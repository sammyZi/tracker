# Multi-stage Dockerfile for Next.js static export
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
EXPOSE 3000
RUN npm install -g serve
COPY --from=builder /app/out ./out
CMD ["serve", "-s", "out", "-l", "3000"]
