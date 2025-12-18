# Build Optimized APK

## For smallest APK (arm64-v8a only - ~15-20MB):
```bash
cd android
.\gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a
```
Output: `android/app/build/outputs/apk/release/app-arm64-v8a-release.apk`

## For compatibility with older devices (both architectures - ~25-30MB):
```bash
cd android
.\gradlew.bat assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a
```
Output: 
- `android/app/build/outputs/apk/release/app-arm64-v8a-release.apk`
- `android/app/build/outputs/apk/release/app-armeabi-v7a-release.apk`

## Build Android App Bundle (AAB) for Play Store (smallest - ~12-15MB):
```bash
cd android
.\gradlew.bat bundleRelease
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Current Configuration:
- ProGuard/R8 minification: ENABLED
- Resource shrinking: ENABLED
- Architecture: arm64-v8a only (change in gradle.properties for more)
- APK splits: ENABLED (creates separate APKs per architecture)

## APK Locations:
- Debug: `android/app/build/outputs/apk/debug/`
- Release: `android/app/build/outputs/apk/release/`
- Bundle: `android/app/build/outputs/bundle/release/`
