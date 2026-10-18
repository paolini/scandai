const { randomUUID } = require('node:crypto')
const { test: base, expect } = require('@playwright/test')
const { MongoClient, ObjectId } = require('mongodb')
const { environment } = require('./environment.cjs')

const test = base.extend({
    report: async ({ page }, use) => {
        const client = new MongoClient(environment().uri)
        const db = client.db()
        const schoolIds = [new ObjectId(), new ObjectId(), new ObjectId()]
        const ownerId = new ObjectId()
        const secret = randomUUID()
        const polls = [
            { school: 0, year: '3', class: 'A', form: 'full', academicYear: 2025 },
            { school: 0, year: '4', class: 'B', form: 'full', academicYear: 2025 },
            { school: 0, year: '3', class: 'C', form: 'short', academicYear: 2025 },
            { school: 0, year: '3', class: 'D', form: 'full', academicYear: 2024 },
            { school: 1, year: '3', class: 'E', form: 'full', academicYear: 2025 },
            { school: 2, year: '3', class: 'F', form: 'full', academicYear: 2025 },
        ].map(poll => ({ ...poll, _id: new ObjectId() }))
        const errors = []
        page.on('pageerror', error => errors.push(error.message))
        try {
            await db.collection('schools').insertMany([
                { _id: schoolIds[0], name: 'Scuola E2E prima', city: 'Udine', type: 'first', reportSecret: secret },
                { _id: schoolIds[1], name: 'Scuola E2E seconda', city: 'Udine', type: 'second', reportSecret: secret },
                { _id: schoolIds[2], name: 'Scuola E2E altra città', city: 'Gorizia', type: 'first', reportSecret: secret },
            ])
            await db.collection('users').insertOne({ _id: ownerId, name: 'Docente E2E', isTeacher: true })
            for (const poll of polls) {
                const createdAt = new Date(`${poll.academicYear}-10-01T12:00:00Z`)
                await db.collection('polls').insertOne({
                    _id: poll._id, school_id: schoolIds[poll.school], createdBy: ownerId,
                    secret: randomUUID(), year: poll.year, class: poll.class, form: poll.form,
                    closed: true, createdAt, date: createdAt,
                })
                await db.collection('entries').insertOne({
                    pollId: poll._id, lang: 'it', createdAt, answers: { '1.1.a.1': ['it'] },
                })
            }
            await use({ polls, schoolIds, path: `/report?schoolSecret=${secret}` })
            expect(errors, 'The report must not throw browser errors').toEqual([])
        } finally {
            await db.collection('entries').deleteMany({ pollId: { $in: polls.map(poll => poll._id) } })
            await db.collection('polls').deleteMany({ _id: { $in: polls.map(poll => poll._id) } })
            await db.collection('schools').deleteMany({ _id: { $in: schoolIds } })
            await db.collection('users').deleteOne({ _id: ownerId })
            await client.close()
        }
    },
})

function participantTable(page) {
    return page.getByRole('table').filter({ has: page.getByRole('columnheader', { name: 'variante', exact: true }) })
}

async function expectClasses(page, polls) {
    const expected = polls.map(poll => `${poll.year} ${poll.class}`).sort()
    await expect.poll(async () => {
        const expand = page.getByRole('button', { name: 'espandi', exact: true })
        if (await expand.isVisible()) await expand.click()
        const classes = await participantTable(page).locator('tbody tr td:nth-child(3)').allTextContents()
        return classes.map(value => value.replace(/\s+/g, ' ').trim()).sort()
    }).toEqual(expected)
}

async function expectExport(page, context, polls, filename) {
    let renderedPDF
    // Reproduce Browserless opening the exact export URL, using real GraphQL and MongoDB.
    // Only the external renderer is replaced, and Chromium produces an actual PDF.
    await page.route('**/api/pdf?*', async route => {
        const path = new URL(route.request().url()).searchParams.get('path')
        const source = new URL(page.url())
        expect(path).toBe(source.pathname + source.search)
        const printPage = await context.newPage()
        try {
            const statsResponse = printPage.waitForResponse(response =>
                response.url().endsWith('/api/graphql') &&
                response.request().postDataJSON()?.query?.includes('query Stats('))
            await printPage.goto(path)
            const result = await (await statsResponse).json()
            expect(result.errors).toBeUndefined()
            expect(result.data.stats.polls.map(poll => poll._id).sort())
                .toEqual(polls.map(poll => poll._id.toString()).sort())
            expect(result.data.stats.entriesCount).toBe(polls.length)
            await expectClasses(printPage, polls)
            renderedPDF = await printPage.pdf()
            await route.fulfill({ status: 200, contentType: 'application/pdf', body: renderedPDF })
        } finally {
            await printPage.close()
        }
    })
    const downloaded = page.waitForEvent('download')
    await page.getByRole('button', { name: 'stampa report', exact: true }).click()
    const download = await downloaded
    expect(download.suggestedFilename()).toBe(filename)
    expect(await download.failure()).toBeNull()
    const stream = await download.createReadStream()
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)
    expect(Buffer.concat(chunks)).toEqual(renderedPDF)
    expect(renderedPDF.subarray(0, 5).toString()).toBe('%PDF-')
    await page.unroute('**/api/pdf?*')
}

test('selected classes survive reload and are the only classes exported to PDF', async ({ page, context, report }) => {
    const { polls } = report
    await page.goto(report.path)
    await expectClasses(page, polls)
    const selected = [polls[0], polls[4]]
    for (const poll of selected) {
        await participantTable(page).getByRole('cell', { name: `${poll.year} ${poll.class}`, exact: true }).click()
    }
    await page.getByRole('button', { name: 'filtra selezionate', exact: true }).click()
    await expectClasses(page, selected)
    expect(new URL(page.url()).searchParams.getAll('poll').sort()).toEqual(selected.map(poll => poll._id.toString()).sort())
    await expectExport(page, context, selected, 'report-it.pdf')
    await page.reload()
    await expectClasses(page, selected)
    await page.getByRole('button', { name: 'annulla filtro', exact: true }).click()
    await expectClasses(page, polls)
    expect(new URL(page.url()).searchParams.has('poll')).toBe(false)
    await page.reload()
    await expectClasses(page, polls)
})

test('school type and all other report filters are restored when generating the PDF', async ({ page, context, report }) => {
    const { polls } = report
    await page.goto(report.path)
    await expectClasses(page, polls)
    for (const [label, value, expected] of [
        ['anno scolastico', '2025', [0, 1, 2, 4, 5]],
        ['città', 'Udine', [0, 1, 2, 4]],
        ['fotografia', 'full', [0, 1, 4]],
        ['classe', '3', [0, 4]],
        ['scuola', 'type:first', [0]],
    ]) {
        await page.getByRole('combobox', { name: label, exact: true }).selectOption(value)
        await expectClasses(page, expected.map(index => polls[index]))
    }
    await page.reload()
    await expectClasses(page, [polls[0]])
    for (const [label, value] of [['anno scolastico', '2025'], ['città', 'Udine'], ['fotografia', 'full'], ['classe', '3'], ['scuola', 'type:first']]) {
        await expect(page.getByRole('combobox', { name: label, exact: true })).toHaveValue(value)
    }
    await expectExport(page, context, [polls[0]], 'report-scuola-e2e-prima-3a-it.pdf')
    await page.getByRole('combobox', { name: 'scuola', exact: true }).selectOption('')
    await expectClasses(page, [polls[0], polls[4]])
    expect(new URL(page.url()).searchParams.has('school_type')).toBe(false)
    await expectExport(page, context, [polls[0], polls[4]], 'report-it.pdf')
    await page.getByRole('combobox', { name: 'scuola', exact: true }).selectOption(report.schoolIds[1].toString())
    await expectClasses(page, [polls[4]])
    await expectExport(page, context, [polls[4]], 'report-scuola-e2e-seconda-3e-it.pdf')
})
