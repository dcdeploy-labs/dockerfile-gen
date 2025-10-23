#!/bin/bash

# Test React App on Remote Docker
# This script tests the React app using the latest dockerfile-gen package

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if REMOTE_HOST is set
if [ -z "$REMOTE_HOST" ]; then
    print_error "REMOTE_HOST environment variable not set"
    echo "Usage: REMOTE_HOST=user@host ./test-react-remote.sh"
    exit 1
fi

REMOTE_PATH=${REMOTE_PATH:-"/tmp/dockerfile-gen-test"}
EXAMPLE_NAME="react-app"
EXAMPLE_PATH="examples/nodejs/$EXAMPLE_NAME"
PORT=3000

print_status "Testing React app on remote Docker server"
print_status "Remote host: $REMOTE_HOST"
print_status "Remote path: $REMOTE_PATH"
print_status "Example: $EXAMPLE_NAME"

# Function to run commands on remote server
run_remote() {
    ssh $REMOTE_HOST "$1"
}

# Function to copy files to remote server
copy_to_remote() {
    print_status "Generating Dockerfile and copying files to remote server..."
    
    # Create a temporary directory with only necessary files
    TEMP_DIR="/tmp/dockerfile-gen-$(basename $EXAMPLE_PATH)-$$"
    mkdir -p "$TEMP_DIR"
    
    # Copy only necessary files, excluding node_modules, dist, build, etc.
    rsync -av --exclude='node_modules' --exclude='dist' --exclude='build' --exclude='.next' --exclude='__pycache__' --exclude='*.pyc' --exclude='.git' --exclude='.DS_Store' --exclude='Dockerfile*' "$EXAMPLE_PATH/" "$TEMP_DIR/"
    
    # Generate Dockerfile using published dockerfile-gen tool
    print_status "Generating Dockerfile for $EXAMPLE_NAME using npx @dcdeploy/dockerfile-gen..."
    npx @dcdeploy/dockerfile-gen@latest "$TEMP_DIR" --output "$TEMP_DIR/Dockerfile" --verbose
    
    # Verify files were generated
    if [ ! -f "$TEMP_DIR/Dockerfile" ]; then
        print_error "Dockerfile not generated"
        echo "Files in temp directory:"
        ls -la "$TEMP_DIR/"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    if [ ! -f "$TEMP_DIR/package.json" ]; then
        print_error "No package.json found"
        echo "Files in temp directory:"
        ls -la "$TEMP_DIR/"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    # Copy to remote server
    scp -r "$TEMP_DIR" $REMOTE_HOST:$REMOTE_PATH/$EXAMPLE_NAME
    
    # Move files from temp subdirectory to the correct location
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && if [ -d $(basename $TEMP_DIR) ]; then cp -r $(basename $TEMP_DIR)/* . && rm -rf $(basename $TEMP_DIR); fi"
    
    # Cleanup local temp directory
    rm -rf "$TEMP_DIR"
}

# Function to test the app
test_app() {
    print_status "Testing $EXAMPLE_NAME on remote Docker..."
    
    # Clean up any existing containers
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && docker stop $EXAMPLE_NAME 2>/dev/null || true && docker rm $EXAMPLE_NAME 2>/dev/null || true"
    
    # Build the Docker image
    print_status "Building Docker image..."
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && docker build -t $EXAMPLE_NAME ."
    
    if [ $? -ne 0 ]; then
        print_error "Docker build failed"
        return 1
    fi
    
    # Run the container
    print_status "Running Docker container on port $PORT..."
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && docker run -d --name $EXAMPLE_NAME -p $PORT:$PORT $EXAMPLE_NAME"
    
    if [ $? -ne 0 ]; then
        print_error "Docker run failed"
        return 1
    fi
    
    # Wait for container to start
    print_status "Waiting for container to start..."
    sleep 5
    
    # Check if container is running
    run_remote "docker ps | grep $EXAMPLE_NAME"
    
    if [ $? -ne 0 ]; then
        print_error "Container is not running"
        print_status "Container logs:"
        run_remote "docker logs $EXAMPLE_NAME"
        return 1
    fi
    
    # Test the application
    print_status "Testing application on port $PORT..."
    run_remote "curl -f http://localhost:$PORT || curl -f http://127.0.0.1:$PORT"
    
    if [ $? -eq 0 ]; then
        print_status "✅ $EXAMPLE_NAME is working correctly!"
        print_status "Application is accessible at http://$REMOTE_HOST:$PORT"
    else
        print_error "Application test failed"
        print_status "Container logs:"
        run_remote "docker logs $EXAMPLE_NAME"
        return 1
    fi
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && docker stop $EXAMPLE_NAME 2>/dev/null || true && docker rm $EXAMPLE_NAME 2>/dev/null || true"
}

# Main execution
main() {
    print_status "Starting React app remote Docker test..."
    
    # Copy files to remote
    copy_to_remote
    
    # Test the app
    if test_app; then
        print_status "🎉 React app test completed successfully!"
    else
        print_error "❌ React app test failed"
        cleanup
        exit 1
    fi
    
    # Ask if user wants to keep container running
    echo
    read -p "Keep container running for manual testing? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        cleanup
    else
        print_status "Container is running. Access it at http://$REMOTE_HOST:$PORT"
        print_status "To stop: ssh $REMOTE_HOST 'docker stop $EXAMPLE_NAME && docker rm $EXAMPLE_NAME'"
    fi
}

# Trap to ensure cleanup on script exit
trap cleanup EXIT

# Run main function
main
