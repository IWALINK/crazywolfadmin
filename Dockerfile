# --- Stage 3: Runtime ---------------------------
    FROM node:20-alpine AS runner
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV PORT=3002
    
    # non-root user & group
    RUN addgroup -S nodejs -g 1001 \
     && adduser  -S nextjs -u 1001 -G nodejs
    
    # Copy the already-built app
    COPY --from=builder --chown=nextjs:nodejs /app/.next        ./.next
    COPY --from=builder --chown=nextjs:nodejs /app/public       ./public
    COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
    COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
    # (omit the lockfile entirely in the runtime image)
    
    # IMPORTANT: give the user write rights on /app itself
    USER root
    RUN chown -R nextjs:nodejs /app
    USER nextjs
    
    EXPOSE 3002
    CMD ["npx", "next", "start"]
    