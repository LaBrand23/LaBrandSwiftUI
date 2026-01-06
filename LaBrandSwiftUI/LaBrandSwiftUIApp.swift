//
//  LaBrandSwiftUIApp.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 24/03/25.
//

import SwiftUI
import FirebaseCore

// MARK: - App Delegate for Firebase
class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        FirebaseApp.configure()
        return true
    }
}

// MARK: - Main App
@main
struct LaBrandSwiftUIApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    
    @StateObject private var authManager = AuthenticationManager()
    @StateObject private var themeManager = ThemeManager.shared
    
    var body: some Scene {
        WindowGroup {
            AppRootView()
                .environmentObject(authManager)
                .withAppTheme()
                .onAppear {
                    themeManager.applyTheme()
                }
        }
    }
}
