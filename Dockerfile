# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Update Alpine packages to get latest security fixes
RUN apk update && apk upgrade --no-cache

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production (Quasar SPA)
RUN npm run build

# Production stage
FROM nginx:1.27-alpine

RUN apk upgrade --no-cache

# Copy built assets
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
