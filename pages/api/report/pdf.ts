import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    res.status(400).send('Missing url')
    return
  }
  let browser
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: process.env.CHROME_PATH || '/usr/bin/chromium-browser',
    })
    const page = await browser.newPage()

    // Passa i cookie della richiesta originale a Puppeteer
    const cookies = req.headers.cookie
    if (cookies) {
      await page.setExtraHTTPHeaders({ cookie: cookies })
    }

    await page.goto(url, { waitUntil: 'networkidle0' })
    await page.emulateMediaType('print') // ma forse non serve
    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf')
    res.end(pdf)
  } catch (err) {
    if (browser) await browser.close()
    res.status(500).send('PDF generation failed: ' + err)
  }
}
