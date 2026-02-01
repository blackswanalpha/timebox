#!/bin/bash

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="TimeBox"

echo "Building $APP_NAME installer..."

# Navigate to project directory
cd "$PROJECT_DIR"

# Install dependencies if node_modules is missing
if [ ! -d "node_modules" ]; then
    echo "Installing node dependencies..."
    npm install
fi

# Run Tauri build
echo "Running tauri build..."
npm run tauri build

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "Binaries can be found in src-tauri/target/release/bundle/"
else
    echo "Build failed!"
    exit 1
fi
