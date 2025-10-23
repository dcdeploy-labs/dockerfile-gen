#!/bin/bash

# Dockerfile Generator Remote Testing Script
# This script generates Dockerfiles using the published @dcdeploy/dockerfile-gen package and tests them on remote Docker
# Usage: REMOTE_HOST=user@host ./test-remote.sh <example-name> [port]
#        REMOTE_HOST=user@host ./test-remote.sh all (test all examples)
#        REMOTE_HOST=user@host ./test-remote.sh cleanup (cleanup containers)
# Environment Variables:
#   REMOTE_HOST - SSH host (required, e.g., user@host)
#   REMOTE_PATH - Remote directory path (optional, default: /tmp/dockerfile-gen-test)

set -e

EXAMPLE_NAME=${1:-"react-app"}
PORT=${2:-"3000"}
REMOTE_HOST="${REMOTE_HOST:-}"
REMOTE_PATH="${REMOTE_PATH:-/tmp/dockerfile-gen-test}"

# Function to run command on remote server
run_remote() {
    if [ -z "$REMOTE_HOST" ]; then
        echo "Error: REMOTE_HOST environment variable not set"
        echo "Usage: REMOTE_HOST=user@host ./test-remote.sh <example-name>"
        exit 1
    fi
    ssh $REMOTE_HOST "$1"
}

# Function to test all examples
test_all_examples() {
    echo "Testing all examples using dockerfile-gen tool..."
    
    # Define examples with their ports (using simple arrays)
    local examples=(
        "react-app:3000"
        "angular-app:3000"
        "vite-ts-app:3000"
        "express-app:3000"
        "express-ts-app:3000"
        "nestjs-app:3000"
        "nextjs-ts-app:3000"
        "go-app:8080"
        "go-gin:8080"
        "go-service:8080"
        "python-flask:5000"
        "python-django:8000"
        "python-api:5000"
        "django-app:8000"
        "java-spring:8080"
    )
    
    local success_count=0
    local total_count=${#examples[@]}
    
    for example_port in "${examples[@]}"; do
        local example=$(echo "$example_port" | cut -d: -f1)
        local port=$(echo "$example_port" | cut -d: -f2)
        
        echo
        echo "=========================================="
        echo "Testing $example on port $port"
        echo "=========================================="
        
        if ./test-remote.sh "$example" "$port"; then
            echo "✅ $example - SUCCESS"
            ((success_count++))
        else
            echo "❌ $example - FAILED"
        fi
        
        # Cleanup after each test
        run_remote "docker stop $example-test 2>/dev/null || true"
        run_remote "docker rm $example-test 2>/dev/null || true"
        run_remote "docker rmi $example 2>/dev/null || true"
    done
    
    echo
    echo "=========================================="
    echo "FINAL RESULTS: $success_count/$total_count examples passed"
    echo "=========================================="
}

if [ "$1" = "all" ]; then
    echo "=== Testing ALL Examples on Remote Docker ==="
    test_all_examples
    exit 0
fi

echo "=== Testing $EXAMPLE_NAME on Remote Docker ==="

# Function to generate Dockerfile and copy files to remote server
copy_to_remote() {
    echo "Generating Dockerfile using dockerfile-gen tool and copying to remote server..."
    
    # Create a temporary directory with only necessary files
    TEMP_DIR="/tmp/dockerfile-gen-$(basename $EXAMPLE_PATH)-$$"
    mkdir -p "$TEMP_DIR"
    
    # Copy only necessary files, excluding node_modules, dist, build, etc.
    rsync -av --exclude='node_modules' --exclude='dist' --exclude='build' --exclude='.next' --exclude='__pycache__' --exclude='*.pyc' --exclude='.git' --exclude='.DS_Store' --exclude='Dockerfile' "$EXAMPLE_PATH/" "$TEMP_DIR/"
    
           # Generate Dockerfile using published dockerfile-gen tool
           echo "Generating Dockerfile for $EXAMPLE_NAME using npx @dcdeploy/dockerfile-gen..."
           npx @dcdeploy/dockerfile-gen@1.0.3 "$TEMP_DIR" --output "$TEMP_DIR/Dockerfile" --verbose
    
    # Verify files were generated
    if [ ! -f "$TEMP_DIR/Dockerfile" ]; then
        echo "Error: Dockerfile not generated"
        echo "Files in temp directory:"
        ls -la "$TEMP_DIR/"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    if [ ! -f "$TEMP_DIR/package.json" ] && [ ! -f "$TEMP_DIR/requirements.txt" ] && [ ! -f "$TEMP_DIR/go.mod" ]; then
        echo "Error: No package file found (package.json, requirements.txt, or go.mod)"
        echo "Files in temp directory:"
        ls -la "$TEMP_DIR/"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    # Copy to remote server
    scp -r "$TEMP_DIR" $REMOTE_HOST:$REMOTE_PATH/$(basename $EXAMPLE_PATH)
    
    # Move files from temp subdirectory to the correct location
    run_remote "cd $REMOTE_PATH/$(basename $EXAMPLE_PATH) && if [ -d $(basename $TEMP_DIR) ]; then cp -r $(basename $TEMP_DIR)/* . && rm -rf $(basename $TEMP_DIR); fi"
    
    # Cleanup local temp directory
    rm -rf "$TEMP_DIR"
}

# Function to test example on remote
test_example() {
    echo "Testing $EXAMPLE_NAME on remote server..."
    
    # Build the Docker image
    echo "Building Docker image..."
    run_remote "cd $REMOTE_PATH/$(basename $EXAMPLE_PATH) && docker build -t $EXAMPLE_NAME ."
    
    # Stop and remove existing container if it exists
    run_remote "docker stop $EXAMPLE_NAME-test 2>/dev/null || true"
    run_remote "docker rm $EXAMPLE_NAME-test 2>/dev/null || true"
    
    # Run the container
    echo "Running container on port $PORT..."
    run_remote "docker run -d -p $PORT:$PORT --name $EXAMPLE_NAME-test $EXAMPLE_NAME"
    
    # Wait a moment for container to start
    sleep 3
    
    # Test the response
    echo "Testing HTTP response..."
    run_remote "timeout 5 curl -s http://localhost:$PORT/ | head -1 || echo 'No response received'"
    
    # Show container status
    echo "Container status:"
    run_remote "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep $EXAMPLE_NAME-test"
}

# Function to cleanup
cleanup() {
    echo "Cleaning up..."
    run_remote "docker stop $EXAMPLE_NAME-test 2>/dev/null || true"
    run_remote "docker rm $EXAMPLE_NAME-test 2>/dev/null || true"
    run_remote "docker rmi $EXAMPLE_NAME 2>/dev/null || true"
}

# Main execution
if [ "$1" = "cleanup" ]; then
    cleanup
    exit 0
fi

# Check if example exists (handle nested structure)
EXAMPLE_PATH=""
if [ -d "examples/$EXAMPLE_NAME" ]; then
    EXAMPLE_PATH="examples/$EXAMPLE_NAME"
elif [ -d "examples/nodejs/$EXAMPLE_NAME" ]; then
    EXAMPLE_PATH="examples/nodejs/$EXAMPLE_NAME"
elif [ -d "examples/python/$EXAMPLE_NAME" ]; then
    EXAMPLE_PATH="examples/python/$EXAMPLE_NAME"
elif [ -d "examples/go/$EXAMPLE_NAME" ]; then
    EXAMPLE_PATH="examples/go/$EXAMPLE_NAME"
elif [ -d "examples/java/$EXAMPLE_NAME" ]; then
    EXAMPLE_PATH="examples/java/$EXAMPLE_NAME"
else
    echo "Error: Example '$EXAMPLE_NAME' not found in examples/ directory"
    echo "Available examples:"
    find examples -maxdepth 2 -type d | grep -v "^examples$" | sed 's|examples/||g' | sed 's|/||g' | sort
    exit 1
fi

# Create remote directory
run_remote "mkdir -p $REMOTE_PATH"

# Copy and test
copy_to_remote
test_example

echo "=== Test completed ==="
echo "To cleanup: ./test-remote.sh cleanup"
