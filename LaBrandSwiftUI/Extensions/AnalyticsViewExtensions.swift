//
//  AnalyticsViewExtensions.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import SwiftUI

// MARK: - SwiftUI Analytics Extensions

extension View {
    /// Track screen views automatically
    func trackScreen(_ screenName: String) -> some View {
        self.onAppear {
            AnalyticsManager.shared.logScreenView(screenName)
            AnalyticsManager.shared.logViewAppear(screenName)
        }
        .onDisappear {
            AnalyticsManager.shared.logViewDisappear(screenName)
        }
    }
    
    /// Track button taps
    func trackButtonTap(_ buttonName: String, screen: String? = nil) -> some View {
        self.onTapGesture {
            AnalyticsManager.shared.logButtonTap(buttonName, screen: screen)
        }
    }
    
    /// Track user actions
    func trackUserAction(_ action: String, parameters: [String: String] = [:]) -> some View {
        self.onTapGesture {
            AnalyticsManager.shared.logUserAction(action, parameters: parameters)
        }
    }
}

// MARK: - Button Analytics Extensions

extension Button {
    /// Track button taps with analytics
    func trackTap(_ buttonName: String, screen: String? = nil) -> some View {
        self.onTapGesture {
            AnalyticsManager.shared.logButtonTap(buttonName, screen: screen)
        }
    }
}

// MARK: - Navigation Analytics Extensions

extension NavigationLink {
    /// Track navigation with analytics
    func trackNavigation(_ destination: String, screen: String? = nil) -> some View {
        self.onTapGesture {
            AnalyticsManager.shared.logEvent(
                .featureUsage,
                name: "Navigation",
                parameters: [
                    "destination": destination,
                    "screen": screen ?? "unknown"
                ],
                level: .debug
            )
        }
    }
}
