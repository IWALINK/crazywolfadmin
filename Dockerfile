############################
# Stage 0 – base image
############################
FROM node:20-alpine AS base
ENV NEXT_TELEMETRY_DISABLE=1
WORKDIR /app

############################
# Stage 1 – deps
############################
FROM base AS deps
# copy lock-file first for optimal cache usage
COPY package.json package-lock.json ./
RUN \
  if [ -f package-lock.json ]; then \
    npm ci --omit=dev --no-audit --no-fund; \
  else \
    npm install --omit=dev --no-audit --no-fund; \
  fi

############################
# Stage 2 – builder
############################
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules

# copy project sources *after* node_modules
COPY package.json .
COPY components.json .
COPY tailwind.config.* .
COPY next.config.* .
COPY postcss.config.* .
COPY tsconfig.json .
COPY jsconfig.json .

# source directories (case-sensitive on Linux)
COPY app        ./app
COPY components ./components
COPY public     ./public
COPY lib        ./lib
COPY hooks      ./hooks
COPY styles     ./styles

# optional: quick sanity check
RUN echo "Contents of components/ui (should exist):" && \
    ls -la components/ui || (echo "❌ Missing components/ui directory" && exit 1)

# Next.js production build
RUN npm run build

############################
# Stage 3 – runner
############################
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3002

# non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# copy artefacts and give ownership of *the whole dir*
COPY --from=builder --chown=nextjs:nodejs /app/.next   ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=deps    --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

RUN chown -R nextjs:nodejs /app

USER nextjs
EXPOSE 3002
CMD ["npx", "next", "start"]
