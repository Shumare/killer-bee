FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY packages/crypto/package.json ./packages/crypto/
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/
COPY apps/services/auth-service/package.json ./apps/services/auth-service/
COPY apps/services/model-service/package.json ./apps/services/model-service/
COPY apps/services/ingredient-service/package.json ./apps/services/ingredient-service/
COPY apps/services/process-service/package.json ./apps/services/process-service/
COPY apps/services/test-service/package.json ./apps/services/test-service/

FROM base AS deps
RUN npm install --workspace=apps/services/auth-service --workspace=packages/crypto --workspace=packages/shared --legacy-peer-deps

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY packages/ ./packages/
COPY apps/services/auth-service/ ./apps/services/auth-service/
RUN npm run build --workspace=packages/crypto
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/services/auth-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/services/auth-service/dist ./dist
COPY --from=builder /app/apps/services/auth-service/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD node -e "require('http').get('http://localhost:3001/health', r => process.exit(r.statusCode===200?0:1))"
CMD ["node", "dist/index.js"]
