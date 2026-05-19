FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace manifest (needed to resolve local packages)
COPY package.json ./

# Copy the local workspace package that frontend depends on
COPY middleware-local ./middleware-local

# Copy frontend package files
COPY frontend/package.json ./frontend/

# Install only the frontend workspace (resolves @killer-bee/middleware-local locally)
RUN npm install --workspace=frontend --include=dev

# Copy frontend source
COPY frontend/src ./frontend/src
COPY frontend/index.html ./frontend/
COPY frontend/tsconfig.json ./frontend/
COPY frontend/vite.config.ts ./frontend/

WORKDIR /app/frontend
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
