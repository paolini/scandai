const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const ts = require('typescript')
const bcrypt = require('bcrypt')
const { MongoClient, ObjectId } = require('mongodb')

// Existing bcrypt test vector, also valid with the 2b prefix used by bcrypt 5.
const password = 'envy1362987212538'
const oldHash = '$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC'

test('bcrypt verifies existing password hashes and new hashes', async () => {
    for (const hash of [oldHash, oldHash.replace('$2a$', '$2b$')]) {
        assert.equal(await bcrypt.compare(password, hash), true)
        assert.equal(await bcrypt.compare('incorrect-password', hash), false)
    }
    const hash = await bcrypt.hash('new-password-for-regression-test', 10)
    assert.equal(await bcrypt.compare('new-password-for-regression-test', hash), true)
})

test('username login and session work with existing MongoDB credential accounts', {
    skip: !process.env.SCANDAI_TEST_MONGODB_URI,
}, async () => {
    const uri = process.env.SCANDAI_TEST_MONGODB_URI
    const parsed = new URL(uri)
    assert.ok(['127.0.0.1', 'localhost'].includes(parsed.hostname), 'Use an isolated local MongoDB')
    assert.equal(parsed.pathname, '/scandai_dependency_test', 'Use the dedicated temporary test database')
    const client = new MongoClient(uri)
    const clients = [client]
    const originalEnv = { ...process.env }
    const db = client.db()
    try {
        process.env.MONGODB_URI = uri
        process.env.BETTER_AUTH_URL = 'http://localhost:3000'
        process.env.BETTER_AUTH_SECRET = 'dependency-regression-test-secret-not-used-in-production'
        delete process.env.SMTP_HOST
        delete process.env.GOOGLE_CLIENT_ID
        delete process.env.GOOGLE_CLIENT_SECRET
        delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        const userId = new ObjectId()
        const now = new Date()
        await db.collection('users').insertOne({
            _id: userId, username: 'dependency_test', name: 'Test User',
            email: 'dependency-test@example.test', emailVerified: true,
            password: oldHash, isTeacher: true, createdAt: now, updatedAt: now,
        })
        // Same ObjectId userId and credential account shape as the existing migration.
        await db.collection('account').insertOne({
            userId, providerId: 'credential', accountId: 'dependency_test',
            password: oldHash, createdAt: now, updatedAt: now,
        })
        const filename = path.resolve(__dirname, '../lib/auth.ts')
        const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
        }).outputText
        const module = { exports: {} }
        function testRequire(name) {
            if (name === 'mongodb') return {
                ...require('mongodb'),
                MongoClient: class extends MongoClient {
                    constructor(...args) { super(...args); clients.push(this) }
                },
            }
            if (name === './mongodb') return { getConfigCollection: async () => db.collection('config') }
            return require(name)
        }
        new Function('require', 'module', 'exports', compiled)(testRequire, module, module.exports)
        const { auth } = module.exports
        const migration = require('../migrations/20261017180000-normalize-credential-account-ids.js')
        await migration.up(db)
        await migration.up(db) // Repeated execution preserves the original rollback value.
        const migrated = await db.collection('account').findOne({ userId })
        assert.equal(migrated.accountId, userId.toString())
        assert.equal(migrated.scandaiLegacyAccountId, 'dependency_test')
        const context = await auth.$context
        const authUser = await context.adapter.findOne({ model: 'user', where: [{ field: 'username', value: 'dependency_test' }] })
        assert.equal(authUser?.id, userId.toString(), 'Existing MongoDB user must be found')
        const credential = await context.internalAdapter.findCredentialAccount(userId.toString())
        assert.ok(credential, 'Existing MongoDB credential account must be found')
        const login = await auth.api.signInUsername({
            body: { username: 'dependency_test', password }, asResponse: true,
        })
        assert.equal(login.status, 200, await login.clone().text())
        const cookie = login.headers.get('set-cookie')
        assert.ok(cookie?.includes('session_token'))
        const session = await auth.api.getSession({ headers: new Headers({ cookie }) })
        assert.equal(session.user.id, userId.toString())
        assert.equal(session.user.isTeacher, true)
        const rejected = await auth.api.signInUsername({
            body: { username: 'dependency_test', password: 'incorrect-password' }, asResponse: true,
        })
        assert.equal(rejected.status, 401)
        const signup = await auth.api.signUpEmail({
            body: { email: 'new-user@example.test', name: 'New User', password: 'new-regression-password',
                isAdmin: true, isSuper: true, isViewer: true }, asResponse: true,
        })
        assert.equal(signup.status, 200, await signup.clone().text())
        const newUser = await db.collection('users').findOne({ email: 'new-user@example.test' })
        for (const role of ['isAdmin', 'isSuper', 'isViewer']) assert.equal(newUser[role], false)
        const emailLogin = await auth.api.signInEmail({
            body: { email: 'new-user@example.test', password: 'new-regression-password' }, asResponse: true,
        })
        assert.equal(emailLogin.status, 200, await emailLogin.clone().text())
        await db.collection('account').deleteMany({ userId: newUser._id })
        await db.collection('users').deleteOne({ _id: newUser._id })
        await migration.down(db)
        const restored = await db.collection('account').findOne({ userId })
        assert.equal(restored.accountId, 'dependency_test')
        assert.equal(restored.scandaiLegacyAccountId, undefined)
    } finally {
        await db.collection('session').deleteMany({})
        await db.collection('account').deleteMany({ $or: [{ accountId: 'dependency_test' }, { scandaiLegacyAccountId: 'dependency_test' }] })
        await db.collection('users').deleteMany({ username: 'dependency_test' })
        await Promise.all(clients.map(client => client.close()))
        for (const key of Object.keys(process.env)) if (!(key in originalEnv)) delete process.env[key]
        Object.assign(process.env, originalEnv)
    }
})
