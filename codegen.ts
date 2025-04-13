import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './public/schema.graphql', // Percorso al tuo schema GraphQL
  generates: {
    './generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../pages/api/graphql/types#Context', // Percorso al tipo del tuo context
        avoidOptionals: true, // 👈 questo forza l'uso di `T | null` invece di `T | null | undefined`
      },
    },
  },
};

export default config;
