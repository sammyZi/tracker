# ============================================================================
# Generate Release Keystore for Stride
# ============================================================================
#
# This script generates a release keystore for signing the Android app
# for Google Play Store distribution.
#
# IMPORTANT:
#   - Run this script ONCE and store the keystore and passwords securely
#   - NEVER commit the keystore or passwords to version control
#   - If you lose the keystore, you cannot update the app on Play Store
#
# Usage:
#   .\scripts\generate-keystore.ps1
#
# ============================================================================

$ErrorActionPreference = "Stop"

$keystorePath = "android\app\release.keystore"
$propertiesPath = "android\keystore.properties"
$alias = "stride-release"
$validity = 10000  # ~27 years

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Stride Release Keystore Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if keystore already exists
if (Test-Path $keystorePath) {
    Write-Host "WARNING: Keystore already exists at $keystorePath" -ForegroundColor Yellow
    $confirm = Read-Host "Do you want to overwrite it? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Aborted." -ForegroundColor Red
        exit 0
    }
    Remove-Item $keystorePath
}

# Check for keytool
try {
    $keytoolPath = (Get-Command keytool -ErrorAction Stop).Source
    Write-Host "Found keytool at: $keytoolPath" -ForegroundColor Green
} catch {
    Write-Host "ERROR: keytool not found. Please install JDK and add it to your PATH." -ForegroundColor Red
    Write-Host "Download JDK from: https://adoptium.net/" -ForegroundColor Yellow
    exit 1
}

# Generate passwords
function New-SecurePassword {
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    $password = -join ((1..24) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

$storePassword = New-SecurePassword
$keyPassword = New-SecurePassword

Write-Host ""
Write-Host "Generating release keystore..." -ForegroundColor Yellow
Write-Host ""

# Generate the keystore
$dname = "CN=Stride App, OU=Mobile, O=Stride, L=Unknown, ST=Unknown, C=US"

& keytool -genkeypair `
    -v `
    -storetype JKS `
    -keyalg RSA `
    -keysize 2048 `
    -validity $validity `
    -storepass $storePassword `
    -keypass $keyPassword `
    -alias $alias `
    -keystore $keystorePath `
    -dname $dname

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Keystore generation failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Keystore generated successfully!" -ForegroundColor Green
Write-Host ""

# Create keystore.properties
$propertiesContent = @"
# Release Keystore Properties
# WARNING: NEVER commit this file to version control!
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

storeFile=release.keystore
storePassword=$storePassword
keyAlias=$alias
keyPassword=$keyPassword
"@

Set-Content -Path $propertiesPath -Value $propertiesContent -Encoding UTF8

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Keystore Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "  - $keystorePath" -ForegroundColor White
Write-Host "  - $propertiesPath" -ForegroundColor White
Write-Host ""
Write-Host "CRITICAL: Save these credentials securely!" -ForegroundColor Red
Write-Host "  Store Password: $storePassword" -ForegroundColor Yellow
Write-Host "  Key Alias:      $alias" -ForegroundColor Yellow
Write-Host "  Key Password:   $keyPassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you lose these credentials, you will NOT be" -ForegroundColor Red
Write-Host "able to update your app on the Play Store!" -ForegroundColor Red
Write-Host ""

# Verify the keystore
Write-Host "Verifying keystore..." -ForegroundColor Yellow
& keytool -list -v -keystore $keystorePath -storepass $storePassword -alias $alias 2>&1 | Select-Object -First 10

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Save the passwords above in a secure password manager" -ForegroundColor White
Write-Host "  2. Back up the keystore file to a secure location" -ForegroundColor White
Write-Host "  3. Run: eas build --profile production --platform android" -ForegroundColor White
Write-Host ""
