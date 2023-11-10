import type { NextApiRequest, NextApiResponse } from 'next'

import Config, {IGetConfig} from '@/models/Config'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IGetConfig>
) {
  const config = await Config.findOne({})
  console.log(`GET config: ${config}`)
  res.status(200).json(config)
}
