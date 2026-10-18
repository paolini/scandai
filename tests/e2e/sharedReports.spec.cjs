const { randomUUID } = require('node:crypto')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')
const { test: base, expect } = require('@playwright/test')
const { environment } = require('./environment.cjs')

const Create = `mutation Create($name: String!, $filters: ReportFiltersInput!, $report: String!) {
    createSharedReport(name: $name, filters: $filters, report: $report) { _id token name filters }
}`
const Public = `query Public($token: String!) { sharedReport(token: $token) }`
const List = `query List($all: Boolean) { sharedReports(all: $all) { _id name token createdBy { name } } }`
const Revoke = `mutation Revoke($_id: ObjectId!) { revokeSharedReport(_id: $_id) }`

async function gql(request, query, variables = {}) {
    const response = await request.post('/api/graphql', { data: { query, variables } })
    expect(response.ok()).toBe(true)
    return response.json()
}
async function create(request, filters = {}) {
    const result = await gql(request, Create, { name: 'Report API E2E', filters, report: 'full' })
    expect(result.errors).toBeUndefined()
    return result.data.createSharedReport
}

const test = base.extend({
    sharing: async ({ browser }, use) => {
        const client = new MongoClient(environment().uri)
        const db = client.db()
        const schoolId = new ObjectId()
        const users = {}
        const contexts = []
        const pollIds = [new ObjectId(), new ObjectId(), new ObjectId()]
        const password = 'questionnaire-sharing-test-password'
        const hash = await bcrypt.hash(password, 4)
        const now = new Date()
        try {
            for (const role of ['admin', 'teacher', 'other']) {
                const user = {
                    _id: new ObjectId(), username: `${role}_${randomUUID().slice(0, 12).replaceAll('-', '')}`,
                    email: `${role}-${randomUUID()}@example.test`, emailVerified: true,
                    name: `E2E ${role}`, isAdmin: role === 'admin', isTeacher: role !== 'admin',
                    createdAt: now, updatedAt: now,
                }
                users[role] = user
                await db.collection('users').insertOne(user)
                await db.collection('account').insertOne({
                    userId: user._id, accountId: user._id.toString(), providerId: 'credential', password: hash,
                    createdAt: now, updatedAt: now,
                })
            }
            await db.collection('schools').insertOne({
                _id: schoolId, name: 'Scuola condivisione E2E', city: 'Udine', type: 'first', reportSecret: 'private-school-secret',
            })
            for (const [index, _id] of pollIds.entries()) {
                await db.collection('polls').insertOne({
                    _id, school_id: schoolId, createdBy: users[index === 0 ? 'teacher' : index === 1 ? 'other' : 'admin']._id,
                    secret: `private-student-secret-${index}`, adminSecret: `private-admin-secret-${index}`,
                    year: index === 2 ? '4' : '3', class: ['A', 'B', 'C'][index], form: 'full', closed: true,
                    createdAt: new Date(index === 2 ? '2024-10-01T12:00:00Z' : '2025-10-01T12:00:00Z'), date: now,
                })
                await db.collection('entries').insertOne({ pollId: _id, lang: 'it', createdAt: now,
                    answers: { '1.1.a.1': ['it'], '1.1.b.1': ['it'], '1.1.b.2': ['fu'], '1.1.c.2': ['it'] } })
            }
            async function login(role) {
                const context = await browser.newContext({ baseURL: environment().baseURL })
                contexts.push(context)
                let result
                for (let attempt = 0; attempt < 3; attempt++) {
                    result = await context.request.post('/api/auth/sign-in/username', {
                        headers: { origin: environment().baseURL }, data: { username: users[role].username, password },
                    })
                    if (result.status() !== 429) break
                    // Respect the real login rate limit when testing several distinct accounts.
                    const delay = Math.max(1, Math.min(60, Number(result.headers()['x-retry-after']) || Number(result.headers()['retry-after']) || 11))
                    await new Promise(resolve => setTimeout(resolve, delay * 1000))
                }
                expect(result.ok(), await result.text()).toBe(true)
                return context
            }
            await use({ db, users, schoolId, pollIds, login })
        } finally {
            await Promise.all(contexts.map(context => context.close()))
            const ids = Object.values(users).map(user => user._id)
            await db.collection('sharedReports').deleteMany({ createdBy: { $in: ids } })
            await db.collection('entries').deleteMany({ pollId: { $in: pollIds } })
            await db.collection('polls').deleteMany({ _id: { $in: pollIds } })
            await db.collection('schools').deleteOne({ _id: schoolId })
            await db.collection('account').deleteMany({ userId: { $in: ids } })
            await db.collection('session').deleteMany({ userId: { $in: [...ids, ...ids.map(id => id.toString())] } })
            await db.collection('users').deleteMany({ _id: { $in: ids } })
            await client.close()
        }
    },
})

test('share from the report, find it in the user menu, export anonymously and revoke', async ({ page, context, sharing }) => {
    const admin = await sharing.login('admin')
    const ownerPage = await admin.newPage()
    const errors = []
    for (const target of [page, ownerPage]) target.on('pageerror', error => errors.push(error.message))
    await ownerPage.goto('/report?year=2025&class=3&city=Udine&form=full')
    await ownerPage.getByRole('button', { name: 'Condividi questo report', exact: true }).click()
    const dialog = ownerPage.getByRole('dialog')
    await expect(dialog.getByRole('button', { name: 'Crea link pubblico', exact: true })).toBeDisabled()
    await dialog.getByLabel('Nome del report', { exact: true }).fill('Classi terze 2025 E2E')
    await dialog.getByRole('button', { name: 'Crea link pubblico', exact: true }).click()
    const url = await dialog.getByLabel('Link pubblico', { exact: true }).inputValue()
    expect(new URL(url).pathname).toMatch(/^\/it\/report\/shared\/[a-f0-9]{64}$/)
    const token = new URL(url).pathname.split('/').pop()
    await dialog.getByRole('button', { name: 'Copia link', exact: true }).click()
    await expect(ownerPage.getByText('Link copiato', { exact: true })).toBeVisible()
    await dialog.getByRole('link', { name: 'I miei report condivisi', exact: true }).click()
    await expect(ownerPage.getByRole('row').filter({ hasText: 'Classi terze 2025 E2E' })).toBeVisible()
    await ownerPage.getByText(sharing.users.admin.email, { exact: true }).click()
    await ownerPage.getByRole('link', { name: 'I miei report condivisi', exact: true }).click()
    await expect(ownerPage.getByRole('heading', { name: 'I miei report condivisi', exact: true })).toBeVisible()
    const publicResponse = await gql(context.request, Public, { token })
    expect(publicResponse.errors).toBeUndefined()
    const data = publicResponse.data.sharedReport.stats
    expect(data.entriesCount).toBe(2)
    expect(data.polls.map(poll => poll._id).sort()).toEqual(sharing.pollIds.slice(0, 2).map(id => id.toString()).sort())
    expect(data.questions['family-speaking']).toBeTruthy()
    expect(data.questions['1.1.b.1']).toBeUndefined()
    expect(JSON.stringify(data)).not.toMatch(/private-(school|student|admin)-secret/)
    // A public link stays public even for an administrator, and URL tampering cannot expand its filters.
    const adminView = await gql(admin.request, Public, { token })
    expect(adminView.data.sharedReport.stats.questions['1.1.b.1']).toBeUndefined()
    await page.goto(url + `?year=2024&schoolSecret=private-school-secret&poll=${sharing.pollIds[2]}`)
    await expect(page.getByRole('heading', { name: 'Classi terze 2025 E2E', exact: true })).toBeVisible()
    await expect(page.getByRole('combobox')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Condividi questo report', exact: true })).toHaveCount(0)
    await expect(page.getByRole('cell', { name: '3 A', exact: true })).toBeVisible()
    await expect(page.getByRole('cell', { name: '4 C', exact: true })).toHaveCount(0)
    await page.getByRole('cell', { name: '3 A', exact: true }).click()
    await expect(page.getByRole('button', { name: 'filtra selezionate', exact: true })).toHaveCount(0)
    await page.route('**/api/pdf?*', async route => {
        const printPage = await context.newPage()
        try {
            const path = new URL(route.request().url()).searchParams.get('path')
            await printPage.goto(path)
            await expect(printPage.getByRole('heading', { name: 'Classi terze 2025 E2E', exact: true })).toBeVisible()
            await expect(printPage.getByRole('cell', { name: '4 C', exact: true })).toHaveCount(0)
            await route.fulfill({ status: 200, contentType: 'application/pdf', body: await printPage.pdf() })
        } finally { await printPage.close() }
    })
    const downloaded = page.waitForEvent('download')
    await page.getByRole('button', { name: 'stampa report', exact: true }).click()
    expect(await (await downloaded).failure()).toBeNull()
    await ownerPage.getByRole('row').filter({ hasText: 'Classi terze 2025 E2E' }).getByRole('button', { name: 'Revoca', exact: true }).click()
    await expect(ownerPage.getByText('Non hai report condivisi', { exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByText('Report non disponibile o revocato', { exact: true })).toBeVisible()
    expect((await gql(context.request, Public, { token })).errors).toBeTruthy()
    expect(errors).toEqual([])
})

test('ownership, public redaction, dynamic data and role changes constrain shared reports', async ({ context, sharing }) => {
    const teacher = await sharing.login('teacher')
    const other = await sharing.login('other')
    const admin = await sharing.login('admin')
    const selected = await create(admin.request, {
        polls: [sharing.pollIds[0].toString()], schoolId: sharing.schoolId.toString(),
        schoolType: 'first', year: 2025, form: 'full', class: '3', city: 'Udine',
    })
    const selection = await gql(context.request, Public, { token: selected.token })
    expect(selection.errors).toBeUndefined()
    expect(selection.data.sharedReport.stats.polls.map(poll => poll._id)).toEqual([sharing.pollIds[0].toString()])
    expect((await gql(admin.request, Revoke, { _id: selected._id })).data.revokeSharedReport).toBe(true)
    const saved = await create(teacher.request)
    const read = async () => gql(context.request, Public, { token: saved.token })
    expect((await read()).data.sharedReport.stats.polls.map(poll => poll._id)).toEqual([sharing.pollIds[0].toString()])
    expect((await gql(other.request, List)).data.sharedReports).toEqual([])
    expect((await gql(other.request, List, { all: true })).errors).toBeTruthy()
    expect((await gql(other.request, Revoke, { _id: saved._id })).data.revokeSharedReport).toBe(false)
    for (const [query, variables] of [[Create, { name: 'Anonymous', filters: {}, report: 'full' }], [List, {}], [Revoke, { _id: saved._id }]]) {
        expect((await gql(context.request, query, variables)).errors).toBeTruthy()
    }
    await sharing.db.collection('entries').insertOne({ pollId: sharing.pollIds[0], lang: 'it', createdAt: new Date(), answers: { '1.1.b.1': ['it'] } })
    expect((await read()).data.sharedReport.stats.entriesCount).toBe(2)
    await sharing.db.collection('users').updateOne({ _id: sharing.users.teacher._id }, { $set: { isAdmin: true } })
    // Promotion must not turn an existing teacher link into access to the entire database.
    expect((await read()).data.sharedReport.stats.entriesCount).toBe(2)
    const adminPage = await admin.newPage()
    await adminPage.goto('/shared-reports')
    await expect(adminPage.getByText('Non hai report condivisi', { exact: true })).toBeVisible()
    await adminPage.getByRole('checkbox', { name: 'Mostra anche i report condivisi dagli altri utenti', exact: true }).check()
    await expect(adminPage.getByRole('cell', { name: 'E2E teacher', exact: true })).toBeVisible()
    await sharing.db.collection('users').updateOne({ _id: sharing.users.teacher._id }, { $set: { isAdmin: false, isTeacher: false } })
    expect((await read()).errors).toBeTruthy()
    await adminPage.getByRole('button', { name: 'Revoca', exact: true }).click()
    expect((await read()).errors).toBeTruthy()
    // An administrator's live link also narrows if that author loses global access.
    const global = await create(admin.request)
    expect((await gql(context.request, Public, { token: global.token })).data.sharedReport.stats.entriesCount).toBe(4)
    await sharing.db.collection('users').updateOne({ _id: sharing.users.admin._id }, { $set: { isAdmin: false, isTeacher: true } })
    expect((await gql(context.request, Public, { token: global.token })).data.sharedReport.stats.polls.map(poll => poll._id)).toEqual([sharing.pollIds[2].toString()])
})
