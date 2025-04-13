import path from 'path'
import fs from 'fs'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'

// Risolve il percorso a partire dalla root del progetto
const schemaPath = path.resolve(process.cwd(), 'public/schema.graphql');

// Verifica se il file esiste
if (!fs.existsSync(schemaPath)) {
  throw new Error(`File schema.graphql non trovato in ${schemaPath}`);
}

// Carica il file schema.graphql
const typesArray = loadFilesSync(schemaPath);

export const typeDefs = mergeTypeDefs(typesArray);
