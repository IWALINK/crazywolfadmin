# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Create nextjs user early
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install dependencies as nextjs user
COPY package.json package-lock.json* ./
RUN chown -R nextjs:nodejs /app
USER nextjs
RUN if [ -f package-lock.json ]; then npm ci --force; else npm install --force; fi

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy dependencies with correct ownership
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs package.json ./
COPY --chown=nextjs:nodejs components.json ./
COPY --chown=nextjs:nodejs tailwind.config.* ./
COPY --chown=nextjs:nodejs next.config.* ./
COPY --chown=nextjs:nodejs postcss.config.* ./
COPY --chown=nextjs:nodejs tsconfig.json ./
COPY --chown=nextjs:nodejs *.json ./

# Copy source directories with correct ownership
COPY --chown=nextjs:nodejs app ./app
COPY --chown=nextjs:nodejs components ./components
COPY --chown=nextjs:nodejs public ./public
COPY --chown=nextjs:nodejs lib ./lib
COPY --chown=nextjs:nodejs hooks ./hooks
COPY --chown=nextjs:nodejs styles ./styles

# Switch to nextjs user before building
USER nextjs

# Debug: Show what was actually copied
RUN echo "=== Configuration files ===" && ls -la *.json *.config.* && \
    echo "=== Components directory ===" && ls -la components/ && \
    echo "=== Components/ui directory ===" && ls -la components/ui/ || echo "No ui directory"

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