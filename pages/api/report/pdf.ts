import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    res.status(400).send('Missing url')
    return
  }

  // Usa PUPPETEER_BASE_URL da env, default http://localhost:3000
  const PUPPETEER_BASE_URL = process.env.PUPPETEER_BASE_URL || 'http://localhost:3000'
  let localUrl: string
  try {
    const parsed = new URL(url, PUPPETEER_BASE_URL)
    localUrl = `${PUPPETEER_BASE_URL}${parsed.pathname}${parsed.search}`
  } catch (e) {
    res.status(400).send('Invalid url')
    return
  }

  let browser
  try {
    console.log('Launching Puppeteer...')
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser',
      protocolTimeout: 30000, // 30 seconds
    })
    console.log('Puppeteer launched')
    const page = await browser.newPage()
    console.log('New page created')

    // Passa i cookie della richiesta originale a Puppeteer
    const cookies = req.headers.cookie
    if (cookies) {
      console.log('Setting cookies')
      await page.setExtraHTTPHeaders({ cookie: cookies })
      console.log('Cookies set')
    }

    console.log('Navigating to', localUrl)
    await page.goto(localUrl, { waitUntil: 'networkidle0' })
    console.log('Page loaded')
    await page.emulateMediaType('print')
    console.log('Media type emulated')
    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    console.log('PDF generated')
    await browser.close()
    console.log('Browser closed')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf')
    res.end(pdf)
  } catch (err) {
    if (browser) await browser.close()
    console.error('PDF generation failed:', err)
    res.status(500).send('PDF generation failed')
  }
}
