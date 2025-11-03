@echo off
echo Cleaning Android build...
cd android
call gradlew.bat clean
cd ..

echo Removing build artifacts...
rmdir /s /q android\app\build 2>nul

echo Rebuilding app...
call npx expo run:android

echo Done! The app should now work with foreground service permissions.
pause
