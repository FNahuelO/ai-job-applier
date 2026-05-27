FROM mcr.microsoft.com/playwright:v1.54.2-jammy AS builder
WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/worker/package.json ./apps/worker/package.json
COPY packages/shared/package.json ./packages/shared/package.json

RUN npm install

COPY apps/worker ./apps/worker
COPY packages/shared ./packages/shared

RUN npm run build -w packages/shared && npm run build -w apps/worker

FROM mcr.microsoft.com/playwright:v1.54.2-jammy
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

CMD ["node", "apps/worker/dist/index.js"]
