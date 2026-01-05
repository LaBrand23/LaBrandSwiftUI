//
//  AppRootView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct AppRootView: View {
    
    // MARK: - Properties
    @EnvironmentObject private var authManager: AuthenticationManager
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    @State private var showSplash = true
    
    // MARK: - Body
    var body: some View {
        ZStack {
            // Main Content
            if hasCompletedOnboarding {
                ContentView()
                    .transition(.opacity)
            } else {
                OnboardingView(hasCompletedOnboarding: $hasCompletedOnboarding)
                    .transition(.opacity)
            }
            
            // Splash Screen Overlay
            if showSplash {
                SplashView {
                    withAnimation(.easeOut(duration: 0.5)) {
                        showSplash = false
                    }
                }
                .transition(.opacity)
                .zIndex(1)
            }
        }
        .animation(.easeInOut(duration: 0.5), value: hasCompletedOnboarding)
    }
}

// MARK: - Preview
#Preview("Full Flow") {
    AppRootView()
        .environmentObject(AuthenticationManager())
}

#Preview("Onboarding Only") {
    OnboardingView(hasCompletedOnboarding: .constant(false))
}

#Preview("Splash Only") {
    SplashView { }
}

