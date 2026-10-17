const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { test } = require('node:test')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')

// Load the actual resolver with an in-memory database, without connecting to MongoDB.
function fixture(entries) {
    const cache = new Map()
    function load(filename) {
        if (cache.has(filename)) return cache.get(filename).exports
        const module = { exports: {} }
        cache.set(filename, module)
        const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
        }).outputText
        function localRequire(name) {
            if (name === '@/lib/mongodb') return {
                getCollection: async () => ({ aggregate: () => ({ toArray: async () => entries }) }),
                getDictCollection: async () => ({ aggregate: () => ({ toArray: async () => [
                    { lang: 'italian', map: 'Italiano' },
                    { lang: 'discard', map: '' },
                ] }) }),
            }
            if (name.startsWith('@/') || name.startsWith('.')) {
                const resolved = name.startsWith('@/') ? path.join(root, name.slice(2)) : path.resolve(path.dirname(filename), name)
                return load(resolved + '.ts')
            }
            return require(name)
        }
        new Function('require', 'module', 'exports', source)(localRequire, module, module.exports)
        return module.exports
    }
    return {
        resolver: load(path.join(root, 'pages/api/graphql/resolvers/stats.ts')).default,
        questionary: load(path.join(root, 'lib/questionary.ts')).default,
    }
}

const teacher = { _id: '000000000000000000000001', isTeacher: true }
const restricted = ['1.1.b.1', '1.1.b.2', '1.1.b.3', '1.1.b.4', '1.1.c.2', '1.1.c.3', '1.1.c.4', '1.1.c.5']

test('union is per respondent, normalized and distinct for each direction', async () => {
    const entries = [
        { answers: {
            '1.1.b.1': ['it', 'Italian', 'discard'], '1.1.b.2': ['it', 'fu'],
            '1.1.b.3': [], '1.1.b.4': [],
            '1.1.c.1': ['de'], '1.1.c.2': ['en'], '1.1.c.3': ['en'],
            '1.1.c.4': [], '1.1.c.5': [],
        } },
        { answers: { '1.1.b.1': ['it'], '1.1.c.2': [] } },
        { answers: {} },
    ]
    const { resolver } = fixture(entries)
    const stats = await resolver(null, {}, { user: teacher })
    const speaking = stats.questions['family-speaking']
    assert.equal(speaking.count, 2)
    assert.equal(speaking.countPositive, 2)
    assert.equal(speaking.countAnswers, 3)
    assert.deepEqual(speaking.answers, { Italiano: 2, Friulano: 1 })
    assert.deepEqual(speaking.singleAnswers, { Italiano: 1 })
    assert.deepEqual(speaking.counts, [0, 1, 1])
    const listening = stats.questions['family-listening']
    assert.equal(listening.count, 2)
    assert.equal(listening.countPositive, 1)
    assert.deepEqual(listening.answers, { Inglese: 1 })
    assert.deepEqual(listening.counts, [1, 1])
    assert.deepEqual(stats.questions['1.1.c.1'].answers, { Tedesco: 1 })
    for (const code of restricted) assert.equal(stats.questions[code], undefined)
    assert.equal(stats.entriesCount, 3)
    assert.deepEqual(entries[0].answers['1.1.b.1'], ['it', 'Italian', 'discard'])
})

test('restricted details depend on server roles, including when using shared links', async () => {
    const { resolver } = fixture([{ answers: Object.fromEntries(restricted.map(code => [code, ['it']])) }])
    for (const query of [{}, { schoolSecret: 'shared' }, { adminSecret: 'shared' }]) {
        for (const user of [teacher, { ...teacher, isAdmin: true }, { ...teacher, isViewer: true }]) {
            const stats = await resolver(null, query, { user })
            for (const code of restricted) assert.equal(!!stats.questions[code], !!(user.isAdmin || user.isViewer))
            assert.ok(stats.questions['family-speaking'])
            assert.ok(stats.questions['family-listening'])
        }
    }
    for (const query of [{ schoolSecret: 'shared' }, { adminSecret: 'shared' }]) {
        const stats = await resolver(null, query, {})
        for (const code of restricted) assert.equal(stats.questions[code], undefined)
        assert.ok(stats.questions['family-speaking'])
    }
    await assert.rejects(resolver(null, {}, {}), /not authenticated/)
})

test('aggregates are derived only from source answers and are absent from student forms', async () => {
    const { resolver, questionary } = fixture([{ answers: { 'family-speaking': ['de'] } }])
    const stats = await resolver(null, {}, { user: teacher })
    assert.equal(stats.questions['family-speaking'], undefined)
    assert.equal(stats.questions['family-listening'], undefined)
    for (const form of Object.values(questionary.forms)) {
        for (const element of form.elements) {
            for (const code of element.questions || []) assert.equal(questionary.questions[code].aggregateFrom, undefined)
        }
    }
})
