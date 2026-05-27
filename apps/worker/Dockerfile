FROM mcr.microsoft.com/playwright:v1.54.2-jammy AS builder
WORKDIR /app

COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY packages/shared/src ./packages/shared/src

COPY apps/worker/package.json ./apps/worker/package.json
COPY apps/worker/tsconfig.json ./apps/worker/tsconfig.json
COPY apps/worker/src ./apps/worker/src

RUN npm install --prefix packages/shared && npm run build --prefix packages/shared
RUN npm install --prefix apps/worker && npm run build --prefix apps/worker

FROM mcr.microsoft.com/playwright:v1.54.2-jammy
WORKDIR /app

COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/apps/worker/node_modules ./apps/worker/node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules

WORKDIR /app/apps/worker
CMD ["node", "dist/index.js"]
