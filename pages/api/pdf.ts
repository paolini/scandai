import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store')
  const fail = (status: number, message: string) => {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.status(status).send(message)
  }
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return fail(405, 'Method not allowed')
  }
  const { path } = req.query
  // Only printable application routes, never arbitrary URLs or API endpoints.
  if (typeof path !== 'string' || !/^\/(?:it\/|en\/|fu\/)?(?:report(?:\/shared\/[A-Za-z0-9_-]+)?|p\/print)(?:\?|$)/.test(path) || /[\\\r\n#]/.test(path)) {
    return fail(400, 'Invalid PDF path')
  }
  const { BROWSERLESS_URL, BROWSERLESS_SCANDAI_URL } = process.env
  if (!BROWSERLESS_URL || !BROWSERLESS_SCANDAI_URL) {
    return fail(503, 'PDF service is not configured: BROWSERLESS_URL and BROWSERLESS_SCANDAI_URL are required')
  }

  try {
    const target = new URL(path, BROWSERLESS_SCANDAI_URL)
    const endpoint = new URL(BROWSERLESS_URL)
    if (![target.protocol, endpoint.protocol].every(protocol => ['http:', 'https:'].includes(protocol))) {
      return fail(503, 'Invalid PDF service configuration')
    }
    // Preserve any Browserless token in the query string.
    endpoint.pathname = endpoint.pathname.replace(/\/$/, '') + '/pdf'
    const cookies = (req.headers.cookie || '').split(';').flatMap(cookie => {
      const separator = cookie.indexOf('=')
      if (separator < 1) return []
      const name = cookie.slice(0, separator).trim()
      // Cookie values must reach the app exactly as received (including % and =).
      const value = cookie.slice(separator + 1).trim()
      if (!name || !value) return []
      const secure = name.startsWith('__Secure-') || name.startsWith('__Host-')
      return [{ name, value, url: target.origin, path: '/', secure, httpOnly: true }]
    })
    if (target.protocol !== 'https:' && cookies.some(cookie => cookie.secure)) {
      return fail(503, 'PDF session requires HTTPS: configure BROWSERLESS_SCANDAI_URL with the public HTTPS address of Scandai')
    }
    const selector = '[data-pdf-ready="true"]'
    // browserless/chrome uses the v1 API; v2 uses waitForSelector instead.
    const wait = process.env.BROWSERLESS_API_VERSION === '2'
      ? { waitForSelector: { selector, timeout: 60_000 } }
      : { waitFor: selector }
    const pdfRes = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(90_000),
      body: JSON.stringify({
        url: target.href,
        ...wait,
        cookies,
        options: { printBackground: true, preferCSSPageSize: true },
      }),
    })
    if (!pdfRes.ok) {
      // Do not log response bodies or URLs: they can contain report secrets/cookies.
      console.error('PDF renderer returned HTTP', pdfRes.status)
      return fail(502, 'PDF generation failed. Check renderer availability, page access and loading time.')
    }
    const buffer = Buffer.from(await pdfRes.arrayBuffer())
    if (buffer.subarray(0, 5).toString() !== '%PDF-') {
      return fail(502, 'PDF service returned an invalid document')
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf')
    res.end(buffer)
  } catch (err: unknown) {
    const timeout = err instanceof Error && ['TimeoutError', 'AbortError'].includes(err.name)
    console.error('PDF generation failed:', timeout ? 'timeout' : 'connection or configuration error')
    return fail(timeout ? 504 : 502, timeout
      ? 'PDF generation timed out. Please try again.'
      : 'Unable to contact the PDF service. Check its configuration and availability.')
  }
}
