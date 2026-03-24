# Build stage
FROM node:22.22.1-alpine AS builder

WORKDIR /app

# Update Alpine packages to get latest security fixes
RUN apk update && apk upgrade --no-cache

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (skip postinstall - quasar prepare is for IDE, not needed for build)
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

# Accept build-time environment variables for Vite
ARG VITE_API_URL
ARG VITE_AUTH_URL
ARG VITE_FILES_API_URL

# Build for production (Quasar PWA)
RUN npm run build

# Production stage
FROM nginx:1.29.6-alpine

# Security update - CACHE_BUST is set by CI to force fresh apk upgrade
ARG CACHE_BUST
RUN apk update && apk upgrade --no-cache

# Copy built assets
COPY --from=builder /app/dist/pwa /usr/share/nginx/html

# Copy nginx config and update CSP origins from build args
ARG VITE_API_URL
ARG VITE_AUTH_URL
ARG VITE_FILES_API_URL
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN set -e; \
    ORIGINS=""; \
    for url in "$VITE_API_URL" "$VITE_AUTH_URL" "$VITE_FILES_API_URL"; do \
      origin=$(echo "$url" | sed 's|\(https\{0,1\}://[^/]*\).*|\1|'); \
      case "$ORIGINS" in *"$origin"*) ;; *) ORIGINS="$ORIGINS $origin";; esac; \
    done; \
    ORIGINS=$(echo "$ORIGINS" | sed 's/^ //'); \
    if [ -n "$ORIGINS" ]; then \
      sed -i "s|https://localhost:\* https://\*\.localhost:\*|$ORIGINS|g" /etc/nginx/conf.d/default.conf; \
      sed -i "s|https://localhost:\*|$ORIGINS|g" /etc/nginx/conf.d/default.conf; \
    fi

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
