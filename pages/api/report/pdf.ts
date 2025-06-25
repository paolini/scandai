import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query
  if (!url || typeof url !== 'string') {
    res.status(400).send('Missing url')
    return
  }
  try {
    // Chiamata a browserless/chrome
    const browserlessUrl = process.env.BROWSERLESS_URL || 'http://browserless:3000/pdf'
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    
    // Prepara la configurazione per browserless
    const browserlessConfig: any = {
      url,
      waitFor: 5000, // Attendi 5 secondi per il caricamento della pagina
      options: { printBackground: true }
    }
    
    // Passa i cookie come opzione di browserless invece che negli headers HTTP
    if (req.headers.cookie) {
      // Converte i cookie in formato array di oggetti per browserless
      const cookies = req.headers.cookie.split(';').map(cookie => {
        const [name, value] = cookie.trim().split('=')
        return {
          name: name,
          value: value,
          domain: new URL(url).hostname
        }
      })
      browserlessConfig.cookies = cookies
    }
    
    console.log('Fetching PDF from:', browserlessUrl, 'with URL:', url, 'and cookies:', browserlessConfig.cookies)
    const pdfRes = await fetch(browserlessUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(browserlessConfig)
    })
    if (!pdfRes.ok) {
      const text = await pdfRes.text()
      res.status(500).send('Browserless error: ' + text)
      return
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf')
    const buffer = Buffer.from(await pdfRes.arrayBuffer())
    res.end(buffer)
  } catch (err: any) {
    res.status(500).send('PDF proxy error: ' + err?.message)
  }
}
