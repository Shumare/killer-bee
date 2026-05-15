FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/services/ingredient-service/package.json ./apps/services/ingredient-service/

FROM base AS deps
RUN npm install --workspace=apps/services/ingredient-service --workspace=packages/shared

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY tsconfig.json ./
COPY packages/shared/ ./packages/shared/
COPY apps/services/ingredient-service/ ./apps/services/ingredient-service/
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/services/ingredient-service

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/services/ingredient-service/dist ./dist
COPY --from=builder /app/apps/services/ingredient-service/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3003
HEALTHCHECK --interval=10s --timeout=5s --retries=5 CMD node -e "require('http').get('http://localhost:3003/health', r => process.exit(r.statusCode===200?0:1))"
CMD ["node", "dist/index.js"]
