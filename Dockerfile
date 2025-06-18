# To build the image:
#
# $ VERSION=$( node -e "console.log(require('./package.json').version)" )
# $ docker build . -t paolini/scandai:$VERSION
# $ docker tag paolini/scandai:$VERSION paolini/scandai:latest
#
# To run the image:
# $ docker compose -f docker-compose-production.yml up
#
# To push the image:
# $ docker push paolini/scandai

FROM node:22-alpine AS base

# Install mongodump
RUN apk add --no-cache mongodb-tools

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build 

# Use Puppeteer's official image for production
FROM ghcr.io/puppeteer/puppeteer:latest AS runner

WORKDIR /app
ENV NODE_ENV=production

# Install mongodump and dumb-init
USER root
RUN apt-get update \
    && apt-get install -y wget gnupg dumb-init \
    && wget -qO - https://pgp.mongodb.com/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-server-6.0.gpg \
    && echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/debian bookworm/mongodb-org/6.0 main" > /etc/apt/sources.list.d/mongodb-org-6.0.list \
    && apt-get update \
    && apt-get install -y mongodb-database-tools \
    && rm -rf /var/lib/apt/lists/*

# Copy built app from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Set correct user (puppeteer image uses user 'pptruser')
USER pptruser

EXPOSE 3000

CMD ["node", "server.js"]
