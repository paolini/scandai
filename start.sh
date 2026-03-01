#!/bin/sh
# Applica le migrazioni e avvia il server
set -e
npx migrate-mongo up
exec node server.js
