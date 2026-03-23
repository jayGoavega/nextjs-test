# Stage 1: Dependencies
FROM node:22-slim AS deps
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install --frozen-lockfile

# Stage 2: Build
FROM node:22-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN yarn build

# Stage 3: Run (Full Image)
FROM node:22-slim AS runner
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
# Critical: Next.js needs to know it's in a container
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy EVERYTHING from the builder
COPY --from=builder /app ./

EXPOSE 3000

# Use the standard Next.js start command
CMD ["yarn", "next", "start"]