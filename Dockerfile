# ─── Stage 1: Install production dependencies ──────────────────────────
FROM node:20-alpine AS deps

# Install only essential system tools (no build tools needed unless native modules)
RUN apk add --no-cache tini

WORKDIR /usr/src/app

# Copy package files first for layer caching
COPY package*.json ./

# Install only production dependencies — no devDependencies, no postinstall scripts
RUN npm ci --only=production && npm cache clean --force

# ─── Stage 2: Production runtime ───────────────────────────────────────
FROM node:20-alpine

# Tini ensures Node.js runs with PID 1 and handles signals properly
COPY --from=deps /sbin/tini /sbin/tini

WORKDIR /usr/src/app

# Copy node_modules from deps stage (cached, no devDependencies)
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy the application source code
COPY . .

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /usr/src/app

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 9000

# Use tini as the init process to handle signals correctly
ENTRYPOINT ["/sbin/tini", "--"]

# Start the application
CMD ["node", "app.js"]