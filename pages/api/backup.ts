import getSessionUser from '@/lib/getSessionUser'
import type { NextApiRequest, NextApiResponse } from 'next'
import child_process from 'child_process'
import fs from 'fs'
import util from 'util'
import { stat } from 'fs/promises' 

const exec = util.promisify(child_process.exec)
const mkdtemp = util.promisify(fs.mkdtemp)

const MONGODB_URI = process.env.MONGODB_URI

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const user = await getSessionUser(req)
    if (!user) res.status(401).json({error: 'not authenticated'})
    if (!user?.isAdmin || !user?.isSuper) res.status(402).json({error: 'not authorized'})

    const tempDir = await mkdtemp('/tmp/backup-')
    const filename = `${new Date().toISOString().substring(0,16)}-scandai-mongodb.dump`
    const tempFile = `${tempDir}/${filename}`
  
    console.log('### backup', `${tempFile}`, JSON.stringify(req.body))

    try {
        const command = await exec(`mongodump --archive ${MONGODB_URI} > ${tempFile}`)
        const s = await stat(tempFile);
        
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Length': s.size,
            'Content-Disposition': `attachment; filename=${filename}`
        })
        
        var readStream = fs.createReadStream(tempFile)
        // We replaced all the event handlers with a simple call to readStream.pipe()
        readStream.pipe(res)
    } catch (error) {
        console.log(`dump error: ${error}`)
        return res.status(400).json({ error })
    }
}
  
  