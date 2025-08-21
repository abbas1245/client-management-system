@echo off
echo 🔧 Fixing Ajv dependencies for CRACO compatibility...

echo 📦 Cleaning existing dependencies...
if exist node_modules rmdir /s /q node_modules
if exist yarn.lock del yarn.lock
if exist package-lock.json del package-lock.json

echo 📥 Installing dependencies with compatible Ajv versions...
yarn install

echo 🧹 Clearing build cache...
if exist build rmdir /s /q build
if exist .cache rmdir /s /q .cache

echo 🚀 Running build...
yarn build

echo ✅ Build process completed!
echo 📁 Check the 'build' folder for your production files.
pause
