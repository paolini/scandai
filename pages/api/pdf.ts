import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query
  if (!path || typeof path !== 'string') {
    res.setHeader('Content-Type', 'text/plain')
    res.status(400).send('Missing path')
    return
  }
  // Verifica che la variabile d'ambiente BROWSERLESS_URL sia configurata
  const BROWSERLESS_URL = process.env.BROWSERLESS_URL
  const BROWSERLESS_SCANDAI_URL = process.env.BROWSERLESS_SCANDAI_URL
  if (!BROWSERLESS_URL) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send('BROWSERLESS_URL environment variable is not set. Please set it to your browserless instance URL (e.g., http://browserless:3000)')
    return
  } 
  if (!BROWSERLESS_SCANDAI_URL) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send('BROWSERLESS_SCANDAI_URL environment variable is not set. Please set it to your browserless Scandai instance URL (e.g., http://scandai)')
    return
  }

  const url = BROWSERLESS_SCANDAI_URL + path

  try {
    // Chiamata a browserless/chrome
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
      const targetUrl = new URL(url)
      const urlHost = targetUrl.hostname
      const isSecure = targetUrl.protocol === 'https:'
      
      const cookies = req.headers.cookie.split(';').map(cookie => {
        const [name, ...valueParts] = cookie.trim().split('=')
        const value = valueParts.join('=') // In caso il valore contenga '='

        const cookieObj: any = {
          name: name.trim(),
          value: decodeURIComponent(value), // Decodifica il valore URL-encoded
          domain: urlHost,
          path: '/',
          httpOnly: false,
          secure: false, // Default a false
          url // <-- aggiungi sempre la proprietà url
        }

        // Gestisci cookie con prefissi di sicurezza
        if (name.startsWith('__Secure-')) {
          cookieObj.secure = true
          cookieObj.httpOnly = true
        }

        // Per cookie __Host-, il domain deve essere omesso e path deve essere '/'
        if (name.startsWith('__Host-')) {
          delete cookieObj.domain // Rimuovi domain
          cookieObj.path = '/'
          cookieObj.secure = true
          cookieObj.httpOnly = true
        }

        // Imposta secure solo se l'URL di destinazione è HTTPS
        if (isSecure && (name.startsWith('__Secure-') || name.startsWith('__Host-'))) {
          cookieObj.secure = true
        }

        return cookieObj
      }).filter(cookie => cookie.name && cookie.value) // Filtra cookie invalidi
      
      browserlessConfig.cookies = cookies
    }
    
    const endpoint = `${BROWSERLESS_URL}/pdf`
    console.log('Fetching PDF from:', endpoint, 'with URL:', url, 'and cookies:', browserlessConfig.cookies)
    const pdfRes = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(browserlessConfig)
    })
    if (!pdfRes.ok) {
      const text = await pdfRes.text()
      res.setHeader('Content-Type', 'text/plain')
      res.status(500).send('Browserless error: ' + text)
      return
    }
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf')
    const buffer = Buffer.from(await pdfRes.arrayBuffer())
    res.end(buffer)
  } catch (err: any) {
    res.setHeader('Content-Type', 'text/plain')
    res.status(500).send('PDF proxy error: ' + err?.message)
  }
}
