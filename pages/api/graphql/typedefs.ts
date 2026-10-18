import path from 'node:path'
import fs from 'node:fs'
import { parse } from 'graphql'

// There is one schema file; loading and merging arbitrary files is unnecessary.
const schemaPath = path.resolve(process.cwd(), 'public/schema.graphql')
export const typeDefs = parse(fs.readFileSync(schemaPath, 'utf8'))
