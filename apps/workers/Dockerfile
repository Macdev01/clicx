# Build stage
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8.12.1 --activate

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./

# Copy shared packages
COPY packages ./packages

# Copy workers app
COPY apps/workers ./apps/workers

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the application
WORKDIR /app/apps/workers
RUN pnpm build

# Prune dev dependencies
RUN pnpm prune --prod

# Runtime stage
FROM node:18-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init ffmpeg

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S worker -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=worker:nodejs /app/apps/workers/dist ./dist
COPY --from=builder --chown=worker:nodejs /app/apps/workers/node_modules ./node_modules
COPY --from=builder --chown=worker:nodejs /app/apps/workers/package.json ./package.json

# Switch to non-root user
USER worker

# Set environment to production
ENV NODE_ENV=production

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the workers
CMD ["node", "dist/main.js"]