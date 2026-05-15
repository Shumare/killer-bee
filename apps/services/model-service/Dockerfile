FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY packages/crypto/package.json ./packages/crypto/
COPY packages/shared/package.json ./packages/shared/
COPY apps/services/model-service/package.json ./apps/services/model-service/

FROM base AS deps
RUN npm install --workspace=apps/services/model-service --workspace=packages/crypto --workspace=packages/shared

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY packages/ ./packages/
COPY apps/services/model-service/ ./apps/services/model-service/
RUN npm run build --workspace=packages/crypto
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/services/model-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/services/model-service/dist ./dist
COPY --from=builder /app/apps/services/model-service/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3002
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD node -e "require('http').get('http://localhost:3002/health', r => process.exit(r.statusCode===200?0:1))"
CMD ["node", "dist/index.js"]
