package com.fittracker.app

import android.os.Build
import android.os.Bundle

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import expo.modules.ReactActivityDelegateWrapper

class MainActivity : ReactActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    // Set the theme to AppTheme BEFORE onCreate to support
    // coloring the background, status bar, and navigation bar.
    // This is required for expo-splash-screen.
    setTheme(R.style.AppTheme);
    
    // Enable 120 FPS on supported devices
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      try {
        val display = windowManager.defaultDisplay
        val modes = display.supportedModes
        
        // Find the mode with highest refresh rate (120Hz if available)
        var maxRefreshRate = 60f
        var preferredModeId = 0
        
        for (mode in modes) {
          if (mode.refreshRate > maxRefreshRate) {
            maxRefreshRate = mode.refreshRate
            preferredModeId = mode.modeId
          }
        }
        
        // Set the preferred display mode to highest refresh rate
        val params = window.attributes
        params.preferredDisplayModeId = preferredModeId
        window.attributes = params
        
        android.util.Log.d("FitTracker", "Set display refresh rate to: $maxRefreshRate Hz")
      } catch (e: Exception) {
        android.util.Log.e("FitTracker", "Failed to set high refresh rate: ${e.message}")
      }
    }
    
    super.onCreate(null)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "main"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return ReactActivityDelegateWrapper(
          this,
          BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
          object : DefaultReactActivityDelegate(
              this,
              mainComponentName,
              fabricEnabled
          ){})
  }

  /**
    * Align the back button behavior with Android S
    * where moving root activities to background instead of finishing activities.
    * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
    */
  override fun invokeDefaultOnBackPressed() {
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
          if (!moveTaskToBack(false)) {
              // For non-root activities, use the default implementation to finish them.
              super.invokeDefaultOnBackPressed()
          }
          return
      }

      // Use the default back button implementation on Android S
      // because it's doing more than [Activity.moveTaskToBack] in fact.
      super.invokeDefaultOnBackPressed()
  }
}
