# Build stage
FROM node:22 AS build

# Set ARG variables


# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build || echo "No build script found"

# Production stage
FROM node:22-alpine

# Set ARG variables


# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Install http-server globally
RUN yarn global add http-server

# Copy the built app
COPY --from=build /app/build ./build

# Expose port
EXPOSE 3000

# Start the application with cache (1 hour) and SPA support
CMD ["http-server", "build", "-p", "3000", "-c3600", "-S"]
