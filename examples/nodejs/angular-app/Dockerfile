# Use the official Node.js runtime as the base image
FROM node:22-alpine

# Set ARG variables


# Set environment variables


# Set the working directory in the container
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Copy package files
COPY package.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
