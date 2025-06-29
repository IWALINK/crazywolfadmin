# Stage 1 – base image alias (easy to change later)
FROM node:20-alpine AS base

# Stage 2 – deps
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 3 – builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build   # <- compiles Next.js

# Stage 4 – runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3002

# copy only what we need
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps    /app/node_modules ./node_modules
COPY package.json .

# (optional) non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs \
 && chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3002
CMD ["npx","next","start"]
