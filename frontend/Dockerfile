# Stage 1: Build
FROM node:22-slim AS builder

WORKDIR /app

# Copy the project (including src/, public/, etc.)
COPY . .

# Install dependencies
RUN npm ci --omit=dev

# Build the Next.js project
RUN npm run build

# Stage 2: Run
FROM node:22-slim AS runner

WORKDIR /app

# Install production dependencies only
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy the built app and required files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json tsconfig.json
COPY --from=builder /app/src ./src

# Expose port and run
EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "start"]
