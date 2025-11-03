#!/bin/bash

echo "🧹 Cleaning Android build..."
cd android
./gradlew clean
cd ..

echo "🗑️  Removing build artifacts..."
rm -rf android/app/build

echo "📦 Rebuilding app..."
npx expo run:android

echo "✅ Done! The app should now work with foreground service permissions."
