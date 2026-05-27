FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/dashboard/package.json ./apps/dashboard/package.json

RUN npm install

COPY apps/dashboard ./apps/dashboard

RUN npm run build -w apps/dashboard

FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/dashboard/package.json ./apps/dashboard/package.json
COPY --from=builder /app/apps/dashboard/dist ./apps/dashboard/dist

EXPOSE 5173

CMD ["npm", "run", "preview", "-w", "apps/dashboard", "--", "--host", "0.0.0.0", "--port", "5173"]
