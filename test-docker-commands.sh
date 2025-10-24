#!/bin/bash

# Test Docker Build & Run Commands
# This script tests the actual Docker build and run commands for the React app

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_command() {
    echo -e "${BLUE}[CMD]${NC} $1"
}

# Check if REMOTE_HOST is set
if [ -z "$REMOTE_HOST" ]; then
    print_error "REMOTE_HOST environment variable not set"
    echo "Usage: REMOTE_HOST=user@host ./test-docker-commands.sh"
    exit 1
fi

REMOTE_PATH=${REMOTE_PATH:-"/tmp/dockerfile-gen-test"}
EXAMPLE_NAME="react-app"
EXAMPLE_PATH="examples/nodejs/$EXAMPLE_NAME"
PORT=3000

print_status "Testing Docker build and run commands for React app"
print_status "Remote host: $REMOTE_HOST"
print_status "Remote path: $REMOTE_PATH"

# Function to run commands on remote server
run_remote() {
    print_command "ssh $REMOTE_HOST \"$1\""
    ssh $REMOTE_HOST "$1"
}

# Function to copy files to remote server
copy_to_remote() {
    print_status "Copying React app files to remote server..."
    
    # Create a temporary directory with only necessary files
    TEMP_DIR="/tmp/dockerfile-gen-$(basename $EXAMPLE_PATH)-$$"
    mkdir -p "$TEMP_DIR"
    
    # Copy only necessary files, excluding node_modules, dist, build, etc.
    rsync -av --exclude='node_modules' --exclude='dist' --exclude='build' --exclude='.next' --exclude='__pycache__' --exclude='*.pyc' --exclude='.git' --exclude='.DS_Store' --exclude='Dockerfile*' "$EXAMPLE_PATH/" "$TEMP_DIR/"
    
    # Generate Dockerfile using published dockerfile-gen tool
    print_status "Generating Dockerfile using dockerfile-gen..."
    npx @dcdeploy/dockerfile-gen@1.0.4 "$TEMP_DIR" --output "$TEMP_DIR/Dockerfile" --verbose
    
    # Copy to remote server
    scp -r "$TEMP_DIR" $REMOTE_HOST:$REMOTE_PATH/$EXAMPLE_NAME
    
    # Move files from temp subdirectory to the correct location
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && if [ -d $(basename $TEMP_DIR) ]; then cp -r $(basename $TEMP_DIR)/* . && rm -rf $(basename $TEMP_DIR); fi"
    
    # Cleanup local temp directory
    rm -rf "$TEMP_DIR"
}

# Function to test Docker commands
test_docker_commands() {
    print_status "Testing Docker build and run commands on remote server..."
    
    # Clean up any existing containers and images
    print_status "Cleaning up existing containers and images..."
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && docker stop $EXAMPLE_NAME 2>/dev/null || true && docker rm $EXAMPLE_NAME 2>/dev/null || true && docker rmi $EXAMPLE_NAME 2>/dev/null || true"
    
    # Show the Dockerfile that will be used
    print_status "Dockerfile to be used:"
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && cat Dockerfile"
    
    echo
    print_status "=== DOCKER BUILD COMMAND ==="
    print_command "docker build -t $EXAMPLE_NAME ."
    
    # Build the Docker image
    print_status "Building Docker image..."
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && docker build -t $EXAMPLE_NAME ."
    
    if [ $? -ne 0 ]; then
        print_error "Docker build failed"
        return 1
    fi
    
    print_status "✅ Docker build completed successfully!"
    
    echo
    print_status "=== DOCKER RUN COMMAND ==="
    print_command "docker run -d --name $EXAMPLE_NAME -p $PORT:$PORT $EXAMPLE_NAME"
    
    # Run the container
    print_status "Running Docker container..."
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && docker run -d --name $EXAMPLE_NAME -p $PORT:$PORT $EXAMPLE_NAME"
    
    if [ $? -ne 0 ]; then
        print_error "Docker run failed"
        return 1
    fi
    
    print_status "✅ Docker run completed successfully!"
    
    # Wait for container to start
    print_status "Waiting for container to start..."
    sleep 3
    
    # Check if container is running
    print_status "Checking container status..."
    run_remote "docker ps | grep $EXAMPLE_NAME"
    
    if [ $? -ne 0 ]; then
        print_error "Container is not running"
        print_status "Container logs:"
        run_remote "docker logs $EXAMPLE_NAME"
        return 1
    fi
    
    print_status "✅ Container is running successfully!"
    
    # Test the application
    print_status "Testing application connectivity..."
    run_remote "curl -f http://localhost:$PORT || curl -f http://127.0.0.1:$PORT"
    
    if [ $? -eq 0 ]; then
        print_status "✅ Application is responding correctly!"
        print_status "🎉 All Docker commands executed successfully!"
    else
        print_error "Application test failed"
        print_status "Container logs:"
        run_remote "docker logs $EXAMPLE_NAME"
        return 1
    fi
}

# Function to show Docker commands
show_docker_commands() {
    print_status "=== DOCKER COMMANDS USED ==="
    echo
    print_command "1. Build: docker build -t $EXAMPLE_NAME ."
    print_command "2. Run: docker run -d --name $EXAMPLE_NAME -p $PORT:$PORT $EXAMPLE_NAME"
    print_command "3. Check: docker ps | grep $EXAMPLE_NAME"
    print_command "4. Test: curl http://localhost:$PORT"
    print_command "5. Logs: docker logs $EXAMPLE_NAME"
    print_command "6. Stop: docker stop $EXAMPLE_NAME"
    print_command "7. Remove: docker rm $EXAMPLE_NAME"
    print_command "8. Remove Image: docker rmi $EXAMPLE_NAME"
    echo
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    run_remote "cd $REMOTE_PATH/$EXAMPLE_NAME && docker stop $EXAMPLE_NAME 2>/dev/null || true && docker rm $EXAMPLE_NAME 2>/dev/null || true && docker rmi $EXAMPLE_NAME 2>/dev/null || true"
}

# Main execution
main() {
    print_status "Starting Docker build and run test..."
    
    # Copy files to remote
    copy_to_remote
    
    # Show the commands that will be used
    show_docker_commands
    
    # Test the Docker commands
    if test_docker_commands; then
        print_status "🎉 Docker build and run test completed successfully!"
        print_status "The React app is running at http://$REMOTE_HOST:$PORT"
    else
        print_error "❌ Docker build and run test failed"
        cleanup
        exit 1
    fi
    
    # Ask if user wants to keep container running
    echo
    read -p "Keep container running for manual testing? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        cleanup
        print_status "Container cleaned up"
    else
        print_status "Container is running. Access it at http://$REMOTE_HOST:$PORT"
        print_status "To stop: ssh $REMOTE_HOST 'docker stop $EXAMPLE_NAME && docker rm $EXAMPLE_NAME'"
    fi
}

# Trap to ensure cleanup on script exit
trap cleanup EXIT

# Run main function
main
