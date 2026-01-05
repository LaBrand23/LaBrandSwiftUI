//
//  LaBrandSwiftUIApp.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 24/03/25.
//

import SwiftUI

@main
struct LaBrandSwiftUIApp: App {
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
