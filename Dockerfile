# Stage 1: Install dependencies
FROM node:20.11-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20.11-alpine AS builder
WORKDIR /app
COPY --from=deps /node_modules ./node_modules
COPY . .
# Generate Prisma Client
RUN npx prisma generate
# Build Next.js
RUN npm run build

# Stage 3: Production runner
FROM node:20.11-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /public ./public
COPY --from=builder /.next/standalone ./
COPY --from=builder /.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
