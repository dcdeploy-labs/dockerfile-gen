#!/bin/bash

# Quick Remote Docker Testing - One-liner commands
# Usage: ./quick-test.sh

echo "=== Quick Remote Docker Testing Commands ==="
echo
echo "1. Test React App:"
echo "   ./test-remote.sh react-app 3000"
echo
echo "2. Test Express App:"
echo "   ./test-remote.sh express-app 3000"
echo
echo "3. Test Go App:"
echo "   ./test-remote.sh go-app 8080"
echo
echo "4. Test Python Flask:"
echo "   ./test-remote.sh python-flask 5000"
echo
echo "5. Test Django App:"
echo "   ./test-remote.sh python-django 8000"
echo
echo "6. Cleanup all containers:"
echo "   ./test-remote.sh cleanup"
echo
echo "7. Manual SSH testing:"
echo "   ssh \$REMOTE_HOST"
echo "   cd \$REMOTE_PATH"
echo "   docker ps"
echo "   curl http://localhost:PORT"
echo
echo "8. Copy project to remote:"
echo "   scp -r . \$REMOTE_HOST:\$REMOTE_PATH/"
echo
echo "9. Set environment variables:"
echo "   export REMOTE_HOST=user@host"
echo "   export REMOTE_PATH=/path/to/remote/directory"
