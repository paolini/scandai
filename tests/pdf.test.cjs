const assert = require('node:assert/strict')
const fs = require('node:fs')
const { test } = require('node:test')
const ts = require('typescript')
const source = ts.transpileModule(fs.readFileSync('pages/api/pdf.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText

async function request({ path = '/it/report?poll=one&poll=two', cookie, response, error, env = {}, method = 'GET' } = {}) {
    const calls = []
    const module = { exports: {} }
    new Function('module', 'exports', 'process', 'fetch', source)(module, module.exports, {
        env: { BROWSERLESS_URL: 'http://renderer:3000?token=private', BROWSERLESS_SCANDAI_URL: 'https://scandai.test', ...env },
    }, async (url, options) => {
        calls.push({ endpoint: String(url), ...JSON.parse(options.body), signal: options.signal })
        if (error) throw error
        return response || new Response('%PDF-1.7\nfixture', { headers: { 'Content-Type': 'application/pdf' } })
    })
    const res = { code: 200, headers: {}, setHeader(k, v) { this.headers[k] = v }, status(code) { this.code = code; return this }, send(body) { this.body = body }, end(body) { this.body = body } }
    await module.exports.default({ method, query: { path }, headers: { cookie } }, res)
    return { res, calls }
}

test('PDF proxy preserves filters, signed cookies and renderer token and waits for readiness', async () => {
    const { calls: [call], res } = await request({ cookie: '__Secure-better-auth.session_token=abc%2Fdef%3D.sig==; other=malformed%zz' })
    assert.equal(call.endpoint, 'http://renderer:3000/pdf?token=private')
    assert.equal(call.url.includes('session'), false)
    assert.equal(call.cookies[0].value, 'abc%2Fdef%3D.sig==')
    assert.equal(call.cookies[1].value, 'malformed%zz')
    assert.equal(call.cookies[0].secure, true)
    assert.equal(call.cookies[0].domain, undefined)
    assert.equal(call.url, 'https://scandai.test/it/report?poll=one&poll=two')
    assert.equal(call.waitFor, '[data-pdf-ready="true"]')
    assert.equal(call.signal.aborted, false)
    assert.equal(res.code, 200)
    assert.equal(res.headers['Cache-Control'], 'no-store')
    assert.equal(res.body.subarray(0, 5).toString(), '%PDF-')
})

test('shared reports and localized questionnaires support Browserless v2', async () => {
    for (const path of ['/en/report/shared/abc-123_xyz', '/fu/p/print?form=full', '/report']) {
        const { res, calls: [call] } = await request({ path, env: { BROWSERLESS_API_VERSION: '2' } })
        assert.equal(res.code, 200)
        assert.equal(call.endpoint, 'http://renderer:3000/pdf?token=private')
        assert.equal(call.waitFor, undefined)
        assert.equal(call.waitForSelector.selector, '[data-pdf-ready="true"]')
    }
})

test('invalid destinations, missing configuration and secure cookies over HTTP fail before rendering', async () => {
    for (const path of ['https://evil.test', '//evil.test/report', '/api/graphql', '/report/../api/graphql', '/report#fragment', ['/report']]) {
        const { res, calls } = await request({ path })
        assert.equal(res.code, 400)
        assert.equal(calls.length, 0)
    }
    assert.equal((await request({ method: 'POST' })).res.code, 405)
    assert.equal((await request({ env: { BROWSERLESS_URL: '' } })).res.code, 503)
    const { res, calls } = await request({ cookie: '__Host-session=opaque', env: { BROWSERLESS_SCANDAI_URL: 'http://scandai' } })
    assert.equal(res.code, 503)
    assert.match(res.body, /HTTPS/)
    assert.equal(calls.length, 0)
})

test('renderer failures, non-PDF responses and timeouts never return a successful download', async () => {
    for (const response of [new Response('secret upstream details', { status: 500 }), new Response('<html>login</html>')]) {
        const { res } = await request({ response })
        assert.equal(res.code, 502)
        assert.equal(res.body.includes('secret upstream details'), false)
    }
    assert.equal((await request({ error: new DOMException('timeout', 'TimeoutError') })).res.code, 504)
    assert.equal((await request({ error: new Error('connection refused') })).res.code, 502)
})
