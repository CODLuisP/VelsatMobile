// android/app/src/main/java/com/velsatmobile/NavigationModeModule.kt
package com.velsatmobile

import android.provider.Settings
import com.facebook.react.bridge.*

class NavigationModeModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext) {
    
    companion object {
        private const val MODULE_NAME = "NavigationModeModule"
    }
    
    override fun getName(): String = MODULE_NAME
    
    @ReactMethod
    fun getNavigationMode(promise: Promise) {
        try {
            val context = reactApplicationContext
            
            // Obtener el modo de navegación desde Settings.Secure
            val navigationMode = Settings.Secure.getInt(
                context.contentResolver, 
                "navigation_mode", 
                0 // Valor por defecto: navegación con 3 botones
            )
            
            // Crear información detallada
            val (modeDescription, hasNavigationBar) = when (navigationMode) {
                0 -> "3_button_navigation" to true
                1 -> "2_button_navigation" to true
                2 -> "gesture_navigation" to false
                else -> "unknown" to true
            }
            
            // Crear respuesta para JavaScript
            val result = Arguments.createMap().apply {
                putInt("mode", navigationMode)
                putString("description", modeDescription)
                putBoolean("hasNavigationBar", hasNavigationBar)
            }
            
            promise.resolve(result)
            
        } catch (e: Exception) {
            promise.reject("NAVIGATION_MODE_ERROR", "Error getting navigation mode", e)
        }
    }
    
    @ReactMethod
    fun getNavigationModeSync(promise: Promise) {
        // Versión síncrona alternativa si es necesaria
        getNavigationMode(promise)
    }
}