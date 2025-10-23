#!/bin/bash

# Manual Docker Commands Test
# This script shows the exact Docker commands to test the React app

echo "=== MANUAL DOCKER COMMANDS FOR REACT APP ==="
echo
echo "1. First, copy the React app to your remote server:"
echo "   scp -r examples/nodejs/react-app/ user@host:/tmp/react-app/"
echo
echo "2. SSH into your remote server:"
echo "   ssh user@host"
echo
echo "3. Navigate to the React app directory:"
echo "   cd /tmp/react-app"
echo
echo "4. Generate the Dockerfile using dockerfile-gen:"
echo "   npx @dcdeploy/dockerfile-gen@1.0.3 . --output Dockerfile --verbose"
echo
echo "5. Build the Docker image:"
echo "   docker build -t react-app ."
echo
echo "6. Run the Docker container:"
echo "   docker run -d --name react-app -p 3000:3000 react-app"
echo
echo "7. Check if the container is running:"
echo "   docker ps | grep react-app"
echo
echo "8. Test the application:"
echo "   curl http://localhost:3000"
echo
echo "9. Check container logs if there are issues:"
echo "   docker logs react-app"
echo
echo "10. Stop and remove the container when done:"
echo "    docker stop react-app && docker rm react-app"
echo
echo "=== EXPECTED RESULTS ==="
echo "✅ Docker build should complete without errors"
echo "✅ Container should start and run successfully"
echo "✅ Application should respond with React app HTML"
echo "✅ SPA routing should work (try /some-route)"
echo
echo "=== TROUBLESHOOTING ==="
echo "If build fails: Check package.json dependencies"
echo "If container won't start: Check docker logs react-app"
echo "If app doesn't respond: Check port mapping and static-web-server logs"
