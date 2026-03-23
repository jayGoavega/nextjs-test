# Stage 1: Install dependencies
FROM node:20.11-alpine AS deps
WORKDIR /app

# ✅ Use yarn.lock instead of package-lock.json
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: Build the application
FROM node:20.11-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN yarn build

# Stage 3: Production runner
FROM node:20.11-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma client (important)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]