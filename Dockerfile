# To build the image:
#
# $ VERSION=$( node -e "console.log(require('./package.json').version)" )
# $ docker build . -t paolini/scandai:$VERSION
# $ docker tag paolini/scandai:$VERSION paolini/scandai:latest
#
# To run the image:
# $ docker-compose -f docker-compose-production.yml up
#
# To push the image:
# $ docker push paolini/scandai

FROM node:16-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production 

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build 

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
EXPOSE 3000
USER nextjs
CMD ["node", "server.js"]
