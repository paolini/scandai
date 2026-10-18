const { randomUUID } = require('node:crypto')
const { test: base, expect } = require('@playwright/test')
const { MongoClient, ObjectId } = require('mongodb')
const { environment } = require('./environment.cjs')

const test = base.extend({
    survey: async ({}, use) => {
        const client = new MongoClient(environment().uri)
        const db = client.db()
        const schoolId = new ObjectId()
        const ownerId = new ObjectId()
        const polls = []
        try {
            await db.collection('schools').insertOne({ _id: schoolId, name: 'Scuola E2E', city: 'Città E2E' })
            await db.collection('users').insertOne({ _id: ownerId, name: 'Docente E2E', isTeacher: true })
            await use({
                db,
                async create(form, closed = false) {
                    const poll = {
                        _id: new ObjectId(), secret: `e2e-${randomUUID()}`, form, closed,
                        school_id: schoolId, createdBy: ownerId,
                        year: '3', class: 'A', date: new Date(), createdAt: new Date(),
                    }
                    polls.push(poll._id)
                    await db.collection('polls').insertOne(poll)
                    return poll
                },
            })
        } finally {
            await db.collection('entries').deleteMany({ pollId: { $in: polls } })
            await db.collection('polls').deleteMany({ _id: { $in: polls } })
            await db.collection('users').deleteOne({ _id: ownerId })
            await db.collection('schools').deleteOne({ _id: schoolId })
            await client.close()
        }
    },
    runtimeErrors: [async ({ page }, use) => {
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        await use()
        expect(errors, 'The student flow must not throw browser errors').toEqual([])
    }, { auto: true }],
})

async function start(page, poll, language, startLabel) {
    await page.goto(`/p/${poll.secret}`)
    await expect(page.getByText('Scuola E2E', { exact: false })).toBeVisible()
    await page.locator(`input[name="lang"][value="${language}"]`).check()
    await page.getByRole('button', { name: startLabel, exact: true }).click()
}

async function selectAllGroups(page, count, language) {
    const groups = page.getByRole('group')
    await expect(groups).toHaveCount(count)
    for (const group of await groups.all()) await group.getByRole('checkbox', { name: language, exact: true }).check()
}

async function submitAndRead(page, survey, poll, language, sendLabel, thanksLabel) {
    const responsePromise = page.waitForResponse(response => {
        if (!response.url().endsWith('/api/graphql') || response.request().method() !== 'POST') return false
        const request = response.request().postDataJSON()
        return request?.query?.includes('submit(') && request.variables?._id === poll._id.toString()
    })
    await page.getByRole('button', { name: sendLabel, exact: true }).click()
    const response = await responsePromise
    expect(response.ok()).toBe(true)
    expect(await response.json()).toMatchObject({ data: { submit: true } })
    await expect(page.getByText(thanksLabel, { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: sendLabel, exact: true })).toHaveCount(0)
    const entries = await survey.db.collection('entries').find({ pollId: poll._id }).toArray()
    expect(entries).toHaveLength(1)
    const [entry] = entries
    expect(entry.lang).toBe(language)
    expect(entry.createdAt).toBeInstanceOf(Date)
    expect(typeof entry.clientTimestamp).toBe('number')
    expect(entry.IP).toBeTruthy()
    expect(entry.answers).toEqual(response.request().postDataJSON().variables.answers)
    expect(entry.answers).not.toHaveProperty('family-speaking')
    expect(entry.answers).not.toHaveProperty('family-listening')
    return entry
}

test('complete questionnaire: required answers, back navigation, all answer types and real submission', async ({ page, survey }) => {
    const poll = await survey.create('full')
    await start(page, poll, 'it', 'Compila il questionario')
    const next = page.getByRole('button', { name: 'Avanti', exact: true })
    const back = page.getByRole('button', { name: 'Indietro', exact: true })
    await expect(page.getByText('1 / 8', { exact: true })).toBeVisible()
    await expect(next).toBeDisabled()
    expect(await survey.db.collection('entries').countDocuments({ pollId: poll._id })).toBe(0)
    const family = page.getByRole('group', { name: 'nella mia famiglia si parla ...', exact: true })
    await family.getByRole('checkbox', { name: 'Italiano', exact: true }).check()
    await family.getByRole('checkbox', { name: 'Friulano (o varianti)', exact: true }).check()
    await family.getByRole('textbox', { name: 'Altra lingua:', exact: true }).fill('Arabo')
    await family.getByRole('textbox', { name: 'Altra lingua:', exact: true }).press('Enter')
    await family.getByRole('textbox', { name: 'Altra lingua:', exact: true }).fill('Spanish')
    await family.getByRole('textbox', { name: 'Altra lingua:', exact: true }).press('Enter')
    await next.click()
    await back.click()
    await expect(family.getByRole('checkbox', { name: 'Arabo', exact: true })).toBeChecked()
    await expect(family.getByRole('checkbox', { name: 'Spagnolo', exact: true })).toBeChecked()
    await family.getByRole('checkbox', { name: 'Friulano (o varianti)', exact: true }).uncheck()
    await next.click()
    await expect(page.getByRole('group')).toHaveCount(9)
    // These are report-only questions and must never be asked to students.
    await expect(page.getByRole('group', { name: 'ai miei familiari parlo in...', exact: true })).toHaveCount(0)
    await expect(page.getByRole('group', { name: 'i miei familiari a me parlano in...', exact: true })).toHaveCount(0)
    const mother = page.getByRole('group', { name: 'a mia mamma parlo in...', exact: true })
    await mother.getByRole('checkbox', { name: 'Italiano', exact: true }).check()
    await mother.getByRole('checkbox', { name: 'Friulano (o varianti)', exact: true }).check()
    await page.getByRole('group', { name: 'a mio papà parlo in...', exact: true }).getByRole('checkbox', { name: 'Spagnolo', exact: true }).check()
    await page.getByRole('group', { name: 'ai miei nonni parlo in...', exact: true }).getByRole('checkbox', { name: 'Arabo', exact: true }).check()
    await page.getByRole('group', { name: 'mia madre a me parla in...', exact: true }).getByRole('checkbox', { name: 'Friulano (o varianti)', exact: true }).check()
    await next.click()
    await selectAllGroups(page, 6, 'Italiano')
    await next.click()
    await selectAllGroups(page, 4, 'Italiano')
    await next.click()
    await expect(page.getByText('5 / 8', { exact: true })).toBeVisible()
    await expect(next).toBeDisabled()
    await page.getByRole('group').nth(0).getByRole('checkbox', { name: 'No', exact: true }).check()
    await page.getByRole('group').nth(1).getByRole('checkbox', { name: 'Francese', exact: true }).check()
    await expect(next).toBeEnabled()
    await next.click()
    await selectAllGroups(page, 5, 'Italiano')
    await next.click()
    await page.getByRole('radio', { name: 'Italiano - 0-3 anni', exact: true }).check()
    await page.getByRole('radio', { name: 'Arabo - 3-6 anni', exact: true }).check()
    await next.click()
    await expect(page.getByText('8 / 8', { exact: true })).toBeVisible()
    await page.getByRole('combobox', { name: 'Italiano - Comprensione orale', exact: true }).selectOption('8')
    await page.getByRole('combobox', { name: 'Arabo - Produzione orale', exact: true }).selectOption('3')
    const entry = await submitAndRead(page, survey, poll, 'it', 'Invia', 'Grazie per aver compilato il questionario!')
    const expectedCodes = [
        '1.1.a.1', '1.1.b.1', '1.1.b.2', '1.1.b.3', '1.1.b.4',
        '1.1.c.1', '1.1.c.2', '1.1.c.3', '1.1.c.4', '1.1.c.5',
        '1.2.a.1', '1.2.a.2', '1.2.a.3', '1.2.b.1', '1.2.b.2', '1.2.b.3',
        '1.3.a.1', '1.3.a.2', '1.3.b.1', '1.3.b.2', '3.0.1', '3.0.2',
        '1.4.1', '1.4.2', '1.4.3', '1.4.4', '1.4.5', '2.1.1', '2.2.1',
    ]
    expect(Object.keys(entry.answers).sort()).toEqual(expectedCodes.sort())
    expect(entry.answers['1.1.a.1']).toEqual(['it', 'Arabo', 'es'])
    expect(entry.answers['1.1.b.1']).toEqual(['it', 'fu'])
    expect(entry.answers['1.1.b.2']).toEqual(['es'])
    expect(entry.answers['1.1.b.3']).toEqual([])
    expect(entry.answers['1.1.b.4']).toEqual(['Arabo'])
    expect(entry.answers['1.1.c.2']).toEqual(['fu'])
    for (const code of expectedCodes.filter(code => /^1\.[234]\./.test(code))) expect(entry.answers[code]).toEqual(['it'])
    expect(entry.answers['3.0.1']).toBe('no')
    expect(entry.answers['3.0.2']).toEqual(['fr'])
    expect(entry.answers['2.1.1']).toMatchObject({ it: '0-3', Arabo: '3-6', es: '' })
    expect(entry.answers['2.2.1'].it).toEqual({ CO: '8', CS: '0', PO: '0', PS: '0' })
    expect(entry.answers['2.2.1'].Arabo.PO).toBe('3')
})

for (const locale of [
    { language: 'en', start: 'Fill the Questionnarie', next: 'Next', send: 'Send', italian: 'Italian', spanish: 'Spanish', oral: 'Oral comprehension', thanks: 'Thank you for filling the Questionnaire' },
    { language: 'fu', start: 'Compile il cuestionari', next: 'Indenant', send: 'Mande', italian: 'Talian', spanish: 'Spagnûl', oral: 'Comprension orâl', thanks: 'Graciis par vê compilât il cuestionari' },
]) test(`short questionnaire in ${locale.language}: localized controls and canonical stored answers`, async ({ page, survey }) => {
    const poll = await survey.create('short')
    await start(page, poll, locale.language, locale.start)
    const next = page.getByRole('button', { name: locale.next, exact: true })
    await selectAllGroups(page, 3, locale.italian)
    await next.click()
    await expect(next).toBeDisabled()
    await page.getByRole('group').nth(0).getByRole('checkbox', { name: 'No', exact: true }).check()
    await page.getByRole('group').nth(1).getByRole('checkbox', { name: locale.spanish, exact: true }).check()
    await next.click()
    await page.getByRole('combobox', { name: `${locale.italian} - ${locale.oral}`, exact: true }).selectOption('7')
    const entry = await submitAndRead(page, survey, poll, locale.language, locale.send, locale.thanks)
    expect(Object.keys(entry.answers).sort()).toEqual(['1.1.a.1', '1.2.a.1', '1.2.b.1', '3.0.1', '3.0.2', '2.2.1'].sort())
    for (const code of ['1.1.a.1', '1.2.a.1', '1.2.b.1']) expect(entry.answers[code]).toEqual(['it'])
    expect(entry.answers['3.0.1']).toBe('no')
    expect(entry.answers['3.0.2']).toEqual(['es'])
    expect(entry.answers['2.2.1'].it.CO).toBe('7')
    expect(entry.answers).not.toHaveProperty('competences')
    expect(entry.answers).not.toHaveProperty('family')
})

test('closed questionnaire cannot be started or submitted from the student interface', async ({ page, survey }) => {
    const poll = await survey.create('full', true)
    await page.goto(`/p/${poll.secret}`)
    await page.locator('input[name="lang"][value="it"]').check()
    await expect(page.getByText('Il questionario è chiuso.', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Compila il questionario', exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Invia', exact: true })).toHaveCount(0)
    expect(await survey.db.collection('entries').countDocuments({ pollId: poll._id })).toBe(0)
})
