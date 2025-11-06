# APK Size Optimization & Background Tracking Guide

## Background Tracking Fixes (NEW)

### Issue
The app was closing after some time in the background due to Android's aggressive battery optimization.

### Solutions Implemented

1. **Battery Optimization Exemption**
   - MainActivity now automatically requests battery optimization exemption on first launch
   - This prevents Android from killing the app to save battery

2. **Foreground Service Configuration**
   - Background location service runs in a separate process (`:background_location`)
   - Persistent notification keeps the service alive
   - Proper foreground service type declaration (`location`)

3. **Enhanced Manifest Permissions**
   - All necessary permissions properly declared
   - Wake lock permission to prevent CPU sleep during tracking
   - Request to ignore battery optimizations

### User Actions Required
See [BACKGROUND_TRACKING_GUIDE.md](./BACKGROUND_TRACKING_GUIDE.md) for detailed instructions on:
- Disabling battery optimization manually
- Manufacturer-specific settings (Samsung, Xiaomi, Huawei, etc.)
- Verification steps
- Troubleshooting

---

## APK Size Optimizations

### 1. Build Configuration (build.gradle)
- ✅ Enabled R8 code shrinking and obfuscation
- ✅ Enabled resource shrinking
- ✅ Enabled ProGuard optimization with `proguard-android-optimize.txt`
- ✅ Enabled PNG crunching
- ✅ Enabled zip alignment
- ✅ Split APKs by ABI (creates separate APKs for each architecture: arm64-v8a, armeabi-v7a, x86, x86_64)

### 2. ProGuard Rules (proguard-rules.pro)
- ✅ Added optimization passes
- ✅ Removed debug logging in release builds
- ✅ Added React Native specific rules
- ✅ Added Hermes and Expo keep rules

### 3. Gradle Properties (gradle.properties)
- ✅ Enabled R8 full mode
- ✅ Enabled resource shrinking
- ✅ Enabled minification
- ✅ Enabled bundle compression
- ✅ Disabled GIF support (saves ~200 KB)
- ✅ Disabled WebP support (saves ~85 KB)
- ✅ Disabled animated WebP (saves ~3.4 MB)

## Expected Results

With these optimizations, you should see:
- **30-50% reduction** in APK size
- Separate APKs per architecture (arm64-v8a, armeabi-v7a, x86, x86_64)
- Each architecture-specific APK will be **significantly smaller** than a universal APK

## Building Optimized APK

### For all architectures (separate APKs):
```bash
cd android
./gradlew assembleRelease
```

APKs will be generated at:
- `android/app/build/outputs/apk/release/app-armeabi-v7a-release.apk` (~15-25 MB)
- `android/app/build/outputs/apk/release/app-arm64-v8a-release.apk` (~20-30 MB)
- `android/app/build/outputs/apk/release/app-x86-release.apk` (~20-30 MB)
- `android/app/build/outputs/apk/release/app-x86_64-release.apk` (~25-35 MB)

### For a specific architecture only:
```bash
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a
```

## Additional Manual Optimizations

### 1. Remove Unused Dependencies
Check your `package.json` and remove any unused libraries:
```bash
npm uninstall <unused-package>
```

### 2. Optimize Images
- Use WebP format for images (if you re-enable WebP support)
- Compress PNG/JPG images before adding to project
- Use vector graphics (SVG) where possible

### 3. Remove Unused Fonts
If you're not using all Poppins font weights, remove unused ones from assets.

### 4. Use Android App Bundle (AAB)
For Google Play Store, use AAB instead of APK:
```bash
cd android
./gradlew bundleRelease
```

AAB allows Google Play to generate optimized APKs for each device configuration.

## Troubleshooting

### If app crashes after optimization:
1. Check ProGuard rules - you may need to add keep rules for specific classes
2. Test thoroughly on different devices
3. Check crash logs: `adb logcat`

### If build fails:
1. Clean the build: `./gradlew clean`
2. Rebuild: `./gradlew assembleRelease`
3. Check for ProGuard warnings in build output

## Size Comparison

Before optimization (typical):
- Universal APK: ~50-80 MB

After optimization:
- arm64-v8a APK: ~20-30 MB (most modern devices)
- armeabi-v7a APK: ~15-25 MB (older devices)
- Total savings: **60-70% per APK**

## Notes

- The arm64-v8a APK is what most modern Android devices (2019+) will use
- The armeabi-v7a APK is for older 32-bit devices
- x86/x86_64 APKs are mainly for emulators and rare x86 Android devices
- When uploading to Play Store, use AAB format for automatic optimization
