# Build stage
FROM node:22 as build

# Set ARG variables
ARG NEXT_URL=https://dsdgfdg

# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies (including dev dependencies for build)
RUN yarn install

# Copy source code
COPY . .

# Build the application
RUN yarn build || echo "No build script found"

# Production stage
FROM node:22-alpine

# Set ARG variables
ARG NEXT_URL=https://dsdgfdg

# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Copy package files
COPY package.json yarn.lock ./

# Install only production dependencies
RUN yarn install --production

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Copy other necessary files
COPY --from=build /app/package.json ./

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["yarn", "start"]
