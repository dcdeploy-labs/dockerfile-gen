# Use the official Node.js runtime as the base image
FROM node:22 AS base

# Set ARG variables


# Install dependencies only when needed
FROM base AS deps

# Set ARG variables


# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Install dependencies
COPY package.json* ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder

# Set ARG variables


# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build || echo "No build script found"

# Production image, copy all the files and run next
FROM base AS runner

# Set ARG variables


# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
