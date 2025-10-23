#!/bin/bash

echo "🚀 Publishing @dcdeploy/dockerfile-gen to npm..."
echo

# Check if logged in
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not logged into npm. Please run: npm login"
    exit 1
fi

echo "✅ Logged into npm as: $(npm whoami)"
echo

# Check if package already exists
if npm view @dcdeploy/dockerfile-gen > /dev/null 2>&1; then
    echo "⚠️  Package @dcdeploy/dockerfile-gen already exists on npm"
    echo "Current version: $(npm view @dcdeploy/dockerfile-gen version)"
    echo "Local version: $(node -p "require('./package.json').version")"
    echo
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Publishing cancelled."
        exit 1
    fi
fi

echo "📦 Publishing package..."
npm publish --access=public

if [ $? -eq 0 ]; then
    echo
    echo "🎉 Successfully published @dcdeploy/dockerfile-gen!"
    echo "📦 Package: https://www.npmjs.com/package/@dcdeploy/dockerfile-gen"
    echo
    echo "Users can now install with:"
    echo "  npm install -g @dcdeploy/dockerfile-gen"
    echo "  npx @dcdeploy/dockerfile-gen <source-path>"
else
    echo "❌ Publishing failed"
    exit 1
fi
