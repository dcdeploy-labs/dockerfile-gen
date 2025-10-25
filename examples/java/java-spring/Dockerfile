# Build stage
FROM maven:3.9-openjdk-17 AS builder

# Set ARG variables


# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Copy pom.xml
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM openjdk:17-jre-slim

# Set ARG variables


# Set environment variables


# Set the working directory
WORKDIR /app

# Install system dependencies


# Additional RUN commands


# Copy the jar file from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 3000

# Run the application
CMD ["java", "-jar", "app.jar"]
