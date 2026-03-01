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
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build 

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/migrations ./migrations
COPY --from=builder --chown=nextjs:nodejs /app/migrate-mongo-config.js ./migrate-mongo-config.js
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh
# Install migrate-mongo globally
RUN npm install -g migrate-mongo
RUN chmod +x ./start.sh
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
EXPOSE 3000
USER nextjs

CMD ["./start.sh"]
