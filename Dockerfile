# ==========================================
# Multi-stage Dockerfile for YEP Streamer Web App
# ==========================================

# Stage 1: Build the client assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
RUN npm install

# Copy source code and build production Vite distribution
COPY . .
RUN npm run build

# Stage 2: Production runtime container
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json ./
RUN npm install --omit=dev && npm install -g tsx

# Copy built frontend client assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy server entrypoint and TypeScript configuration
COPY server.ts ./
COPY tsconfig.json ./

# Switch to standard non-root user for container security
USER node

# Expose default application port
EXPOSE 3000

# Start Express server with tsx runtime
CMD ["tsx", "server.ts"]
