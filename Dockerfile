# Build stage
FROM node:22.22.0-alpine AS builder

WORKDIR /app

# Update Alpine packages to get latest security fixes
RUN apk update && apk upgrade --no-cache

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (skip postinstall - quasar prepare is for IDE, not needed for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Build for production (Quasar SPA)
RUN npm run build

# Production stage
FROM nginx:1.29-alpine

# Security update - ensure package index is refreshed
RUN apk update && apk upgrade --no-cache

# Copy built assets
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set ownership for nginx directories
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/ || exit 1

USER nginx

CMD ["nginx", "-g", "daemon off;"]
