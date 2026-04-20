#!/bin/bash

echo "Building Data Analysis Suite..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile TypeScript
echo "Compiling TypeScript..."
npm run typecheck

# Build the application
echo "Building application..."
npm run build

# Create distribution
echo "Creating distribution packages..."
npm run dist

echo "Build complete! Packages are in the dist/ directory."