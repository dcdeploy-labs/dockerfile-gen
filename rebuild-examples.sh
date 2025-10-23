#!/bin/bash

# Script to regenerate all example Dockerfiles and build/run them
# Usage: ./rebuild-examples.sh [build|run|both]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to regenerate Dockerfile for an example
regenerate_dockerfile() {
    local example_dir=$1
    local example_name=$(basename "$example_dir")
    
    print_status "Regenerating Dockerfile for $example_name..."
    
    # Remove existing Dockerfile if it exists
    if [ -f "$example_dir/Dockerfile" ]; then
        rm "$example_dir/Dockerfile"
        print_status "Removed existing Dockerfile"
    fi
    
    # Generate new Dockerfile
    if node src/cli.js "$example_dir" --output "$example_dir"; then
        print_success "Generated Dockerfile for $example_name"
    else
        print_error "Failed to generate Dockerfile for $example_name"
        return 1
    fi
}

# Function to build Docker image
build_image() {
    local example_dir=$1
    local example_name=$(basename "$example_dir")
    local image_name="dockerfile-gen-$example_name"
    
    print_status "Building Docker image for $example_name..."
    
    if docker build -t "$image_name" "$example_dir"; then
        print_success "Built image: $image_name"
    else
        print_error "Failed to build image for $example_name"
        return 1
    fi
}

# Function to run Docker container
run_container() {
    local example_dir=$1
    local example_name=$(basename "$example_dir")
    local image_name="dockerfile-gen-$example_name"
    local port=$2
    
    print_status "Running container for $example_name on port $port..."
    
    # Stop existing container if running
    docker stop "dockerfile-gen-$example_name" 2>/dev/null || true
    docker rm "dockerfile-gen-$example_name" 2>/dev/null || true
    
    if docker run -d --name "dockerfile-gen-$example_name" -p "$port:$port" "$image_name"; then
        print_success "Started container: dockerfile-gen-$example_name on port $port"
    else
        print_error "Failed to start container for $example_name"
        return 1
    fi
}

# Function to show running containers
show_containers() {
    print_status "Currently running containers:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
}

# Main execution
main() {
    local action=${1:-"both"}
    
    print_status "Starting Dockerfile regeneration and build process..."
    print_status "Action: $action"
    
    # Define examples with their ports
    declare -A examples=(
        ["react-app"]="3000"
        ["react-ts-app"]="3001"
        ["angular-app"]="3002"
        ["nextjs-ts-app"]="3003"
        ["vite-ts-app"]="3004"
        ["express-app"]="3005"
        ["express-ts-app"]="3006"
        ["express-ts-yarn"]="3007"
        ["express-ts-pnpm"]="3008"
        ["fastify-ts-app"]="3009"
        ["nestjs-app"]="3010"
        ["python-flask"]="5000"
        ["python-django"]="5001"
        ["go-app"]="8080"
        ["go-gin"]="8081"
        ["java-spring"]="8082"
    )
    
    # Process each example
    for example in "${!examples[@]}"; do
        example_dir="examples/$example"
        port="${examples[$example]}"
        
        if [ -d "$example_dir" ]; then
            print_status "Processing $example..."
            
            # Regenerate Dockerfile
            if regenerate_dockerfile "$example_dir"; then
                # Build image if requested
                if [ "$action" = "build" ] || [ "$action" = "both" ]; then
                    if build_image "$example_dir"; then
                        # Run container if requested
                        if [ "$action" = "run" ] || [ "$action" = "both" ]; then
                            run_container "$example_dir" "$port"
                        fi
                    fi
                fi
            fi
            echo "---"
        else
            print_warning "Directory $example_dir not found, skipping..."
        fi
    done
    
    if [ "$action" = "run" ] || [ "$action" = "both" ]; then
        echo
        show_containers
        echo
        print_success "All containers started! You can access them at:"
        for example in "${!examples[@]}"; do
            port="${examples[$example]}"
            echo "  - $example: http://localhost:$port"
        done
    fi
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Run main function
main "$@"
