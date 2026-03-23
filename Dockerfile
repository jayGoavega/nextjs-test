# Stage 1: Install dependencies
FROM node:22-slim AS deps
WORKDIR /app

# Install OpenSSL (required for Prisma)
RUN apt-get update -y && apt-get install -y openssl

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


# Stage 2: Build
FROM node:22-slim AS builder
WORKDIR /app

# Install OpenSSL
RUN apt-get update -y && apt-get install -y openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN yarn build


# Stage 3: Run
FROM node:22-slim AS runner
WORKDIR /app

# Install OpenSSL (IMPORTANT for runtime)
RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Prisma runtime files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

# Start server
CMD ["node", "server.js"]