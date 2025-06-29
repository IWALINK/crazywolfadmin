# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install -force or --legacy-peer-deps

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy package files and configs first
COPY package.json ./
COPY components.json ./
COPY tailwind.config.* ./
COPY next.config.* ./
COPY postcss.config.* ./
COPY tsconfig.json ./
COPY *.json ./

# Copy source directories
COPY app ./app
COPY components ./components
COPY public ./public
COPY lib ./lib
COPY hooks ./hooks
COPY styles ./styles

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3002

CMD ["npm", "start"]