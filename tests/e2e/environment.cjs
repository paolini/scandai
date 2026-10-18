const path = require('node:path')

function environment() {
    const uri = process.env.SCANDAI_E2E_MONGODB_URI
    if (!uri) throw new Error('Set SCANDAI_E2E_MONGODB_URI to a temporary local MongoDB database')
    const parsed = new URL(uri)
    if (!['127.0.0.1', 'localhost'].includes(parsed.hostname) || parsed.pathname !== '/scandai_questionnaire_test') {
        throw new Error('E2E tests require a local database named scandai_questionnaire_test')
    }
    const port = process.env.SCANDAI_E2E_PORT || '3199'
    if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535) throw new Error('Invalid E2E port')
    const baseURL = `http://127.0.0.1:${port}`
    return {
        uri, port, baseURL,
        root: path.resolve(__dirname, '../..'),
        serverEnv: {
            MONGODB_URI: uri,
            SCANDAI_E2E: '1',
            BETTER_AUTH_URL: baseURL,
            NEXTAUTH_URL: baseURL,
            BETTER_AUTH_SECRET: 'questionnaire-e2e-secret-only-for-isolated-tests',
            NEXTAUTH_SECRET: 'questionnaire-e2e-secret-only-for-isolated-tests',
            ADMIN_USERNAME: '', ADMIN_PASSWORD: '', SMTP_HOST: '',
            GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '', NEXT_PUBLIC_GOOGLE_CLIENT_ID: '',
            BROWSERLESS_URL: '', BROWSERLESS_SCANDAI_URL: '',
            NEXT_TELEMETRY_DISABLED: '1',
        },
    }
}

module.exports = { environment }
