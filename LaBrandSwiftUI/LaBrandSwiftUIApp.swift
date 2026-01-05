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
    
    var body: some Scene {
        WindowGroup {
            AppRootView()
                .environmentObject(authManager)
        }
    }
}
