import { readFileSync, writeFileSync } from 'node:fs'
import { buildSchema, lexicographicSortSchema, parse, printSchema } from 'graphql'
import { codegen } from '@graphql-codegen/core'
import * as typescript from '@graphql-codegen/typescript'
import * as typescriptResolvers from '@graphql-codegen/typescript-resolvers'

// Generate from the local schema without unused remote loaders or watch tooling.
async function generate() {
  const filename = './generated/graphql.ts'
  const schema = lexicographicSortSchema(buildSchema(readFileSync('./public/schema.graphql', 'utf8')))
  const output = await codegen({
    filename,
    schema: parse(printSchema(schema)),
    documents: [],
    plugins: [{ typescript: {} }, { 'typescript-resolvers': {} }],
    pluginMap: { typescript, 'typescript-resolvers': typescriptResolvers },
    config: {
      useIndexSignature: true,
      contextType: '../pages/api/graphql/types#Context',
      avoidOptionals: true,
      // Preserve the custom-scalar behavior of the previous generator.
      defaultScalarType: 'any',
    },
  })
  writeFileSync(filename, output)
  console.log(`Generated ${filename}`)
}

generate().catch(error => {
  console.error(error)
  process.exitCode = 1
})
