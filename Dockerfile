# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --only=production --legacy-peer-deps; else npm install --only=production --legacy-peer-deps; fi

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copy package.json first
COPY package.json ./
# Copy all source files explicitly
COPY app ./app
COPY components ./components
COPY public ./public
COPY *.config.* ./
COPY *.json ./
COPY *.js ./
COPY *.ts ./
# Debug: Show what was actually copied
RUN echo "=== Files copied to container ===" && ls -la && \
    echo "=== Components directory ===" && ls -la components/ && \
    echo "=== App directory ===" && ls -la app/
RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

# Copy only what's needed to run
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3002
CMD ["npm", "start"]