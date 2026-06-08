FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
RUN npm ci

COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node_modules/.bin/tsx", "apps/api/src/server.ts"]
