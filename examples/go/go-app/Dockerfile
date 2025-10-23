# Build stage
FROM golang:1.21-alpine AS builder

# Set ARG variables
ARG NEXT_URL=https://dsdgfdg

# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Set ARG variables
ARG NEXT_URL=https://dsdgfdg

# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Copy the binary from builder stage
COPY --from=builder /app/main .

# Expose port
EXPOSE 3000

# Run the binary
CMD ["./main"]
