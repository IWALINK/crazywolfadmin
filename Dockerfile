# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --force; else npm install --force; fi

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

# Debug: Show what was actually copied
RUN echo "=== Configuration files ===" && ls -la *.json *.config.* && \
    echo "=== Components directory ===" && ls -la components/ && \
    echo "=== Components/ui directory ===" && ls -la components/ui/ || echo "No ui directory"

# Build as root (no permission issues)
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3002

CMD ["npm", "start"]