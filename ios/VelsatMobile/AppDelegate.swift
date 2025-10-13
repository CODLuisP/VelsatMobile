import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  var loadingView: UIView?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    // Crear ventana con fondo azul
    window = UIWindow(frame: UIScreen.main.bounds)
    window?.backgroundColor = UIColor(red: 0/255, green: 41/255, blue: 107/255, alpha: 1)
    
    // Crear una vista de carga azul que se mantenga visible
    let loading = UIView(frame: UIScreen.main.bounds)
    loading.backgroundColor = UIColor(red: 0/255, green: 41/255, blue: 107/255, alpha: 1)
    loadingView = loading
    
    // Agregar la vista de carga a la ventana
    window?.addSubview(loading)
    window?.makeKeyAndVisible()

    // Iniciar React Native
    factory.startReactNative(
      withModuleName: "VelsatMobile",
      in: window,
      launchOptions: launchOptions
    )
    
    // Quitar la vista de carga después de 1 segundo
    DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
      UIView.animate(withDuration: 0.3, animations: {
        self.loadingView?.alpha = 0
      }) { _ in
        self.loadingView?.removeFromSuperview()
        self.loadingView = nil
      }
    }

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}