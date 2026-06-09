# Stage 1: Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package and lock files to run high-performance cache installations
COPY package*.json ./
RUN npm install --only=production

# Copy the rest of the source code
COPY . .

# Run the production build (Vite compilation & Express bundler)
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
# Default port if not overridden by Cloud Run
ENV PORT=3000

# Copy package descriptors for production install
COPY package*.json ./

# Install only production dependencies (excludes development devDependencies)
RUN npm ci --omit=dev

# Copy compiled folders from build stage
COPY --from=builder /app/dist ./dist

# Expose port (Cloud Run overrides this with PORT env var at runtime)
EXPOSE 3000

# Fire up the production Express application
CMD ["npm", "start"]
