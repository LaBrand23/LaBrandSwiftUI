//
//  TabSelectionKey.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//


import SwiftUI

// Custom EnvironmentKey for tab index
struct TabSelectionKey: EnvironmentKey {
    static let defaultValue: Binding<TabBarTag> = .constant(.home)
}

extension EnvironmentValues {
    var tabSelection: Binding<TabBarTag> {
        get { self[TabSelectionKey.self] }
        set { self[TabSelectionKey.self] = newValue }
    }
}

enum TabBarTag: String {
    case home = "Home"
    case shop = "Shop"
    case bag = "Bag"
    case favorites = "Favorites"
    case profile = "Profile"
}
