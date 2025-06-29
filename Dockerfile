# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app 
COPY package.json package-lock.json* ./
RUN npm ci --force

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjsuser

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# Change ownership
RUN chown -R nextjsuser:nodejs /app

USER nextjsuser

EXPOSE 3002

# Start the Next.js application
CMD ["npm", "start"]