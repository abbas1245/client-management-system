#!/bin/bash

echo "🔧 Fixing Ajv dependencies for CRACO compatibility..."

# Remove existing node_modules and lock files
echo "📦 Cleaning existing dependencies..."
rm -rf node_modules
rm -f yarn.lock
rm -f package-lock.json

# Install dependencies with correct Ajv versions
echo "📥 Installing dependencies with compatible Ajv versions..."
yarn install

# Clear any build cache
echo "🧹 Clearing build cache..."
rm -rf build
rm -rf .cache

# Run the build
echo "🚀 Running build..."
yarn build

echo "✅ Build process completed!"
echo "📁 Check the 'build' folder for your production files."
