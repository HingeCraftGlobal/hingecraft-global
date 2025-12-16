#!/bin/bash
# Fix Docker PATH for Python virtual environment

# Check if Docker Desktop is running
if ! pgrep -f "Docker Desktop" > /dev/null; then
    echo "⚠️  Docker Desktop is not running!"
    echo "Please start Docker Desktop first, then run this script again."
    exit 1
fi

# Find Docker binary
DOCKER_PATH=""
if [ -f "/usr/local/bin/docker" ]; then
    DOCKER_PATH="/usr/local/bin"
elif [ -f "/Applications/Docker.app/Contents/Resources/bin/docker" ]; then
    DOCKER_PATH="/Applications/Docker.app/Contents/Resources/bin"
else
    echo "❌ Docker not found in standard locations"
    echo "Please ensure Docker Desktop is installed"
    exit 1
fi

# Add to PATH for current session
export PATH="$DOCKER_PATH:$PATH"

# Verify Docker works
if docker --version > /dev/null 2>&1; then
    echo "✅ Docker found at: $DOCKER_PATH/docker"
    echo "✅ Docker version: $(docker --version)"
    echo ""
    echo "To use Docker in this shell, run:"
    echo "  export PATH=\"$DOCKER_PATH:\$PATH\""
    echo ""
    echo "Or add to your ~/.zshrc or ~/.bash_profile:"
    echo "  export PATH=\"$DOCKER_PATH:\$PATH\""
    echo ""
    
    # Try to start services
    cd [PROJECT_ROOT]/HingeCraft
    echo "🚀 Starting HingeCraft services..."
    docker compose up -d
    
    echo ""
    echo "📊 Service Status:"
    docker compose ps
    
else
    echo "❌ Docker found but not working. Please check Docker Desktop."
    exit 1
fi


