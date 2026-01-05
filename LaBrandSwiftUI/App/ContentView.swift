//
//  ContentView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct ContentView: View {
    
    @EnvironmentObject private var authManager: AuthenticationManager
    
    var body: some View {
        Group {
            if true /* authManager.isAuthenticated */ {
                MainTabView()
            } else {
                NavigationStack {
                    SignInView()
                }
            }
        }
    }
}

// MARK: - Main Tab View
struct MainTabView: View {
    
    // MARK: - Properties
    @StateObject private var favoritesManager = FavoritesManager()
    @State private var selectedTab: TabBarTag = .home
    
    // MARK: - Init
    init() {
        configureTabBarAppearance()
    }
    
    // MARK: - Body
    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab
            NavigationStack {
                HomeView()
            }
            .tabItem {
                tabItemLabel(for: .home)
            }
            .tag(TabBarTag.home)
            
            // Shop Tab
            NavigationStack {
                CategoriesView()
            }
            .tabItem {
                tabItemLabel(for: .shop)
            }
            .tag(TabBarTag.shop)
            
            // Bag Tab
            NavigationStack {
                BagView()
            }
            .tabItem {
                tabItemLabel(for: .bag)
            }
            .tag(TabBarTag.bag)
            
            // Favorites Tab
            NavigationStack {
                FavoritesView(favoritesManager: favoritesManager)
            }
            .tabItem {
                tabItemLabel(for: .favorites)
            }
            .tag(TabBarTag.favorites)
            
            // Profile Tab
            NavigationStack {
                ProfileView()
            }
            .tabItem {
                tabItemLabel(for: .profile)
            }
            .tag(TabBarTag.profile)
        }
        .tint(Color(hex: "1A1A1A"))
        .environmentObject(favoritesManager)
        .environment(\.tabSelection, $selectedTab)
    }
    
    // MARK: - Tab Item Label
    @ViewBuilder
    private func tabItemLabel(for tab: TabBarTag) -> some View {
        VStack(spacing: 4) {
            Image(selectedTab == tab ? tab.activeIcon : tab.inactiveIcon)
            Text(tab.rawValue)
        }
    }
    
    // MARK: - Tab Bar Appearance
    private func configureTabBarAppearance() {
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        
        // Background
        appearance.backgroundColor = UIColor(Color(hex: "FAFAFA"))
        
        // Shadow line
        appearance.shadowColor = UIColor(Color(hex: "E8E8E8"))
        
        // Normal state
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor(Color(hex: "999999"))
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor(Color(hex: "999999")),
            .font: UIFont.systemFont(ofSize: 10, weight: .medium)
        ]
        
        // Selected state
        appearance.stackedLayoutAppearance.selected.iconColor = UIColor(Color(hex: "1A1A1A"))
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: UIColor(Color(hex: "1A1A1A")),
            .font: UIFont.systemFont(ofSize: 10, weight: .semibold)
        ]
        
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }
}

// MARK: - Tab Bar Tag Extension
extension TabBarTag {
    var activeIcon: ImageResource {
        switch self {
        case .home: return .homeActivated
        case .shop: return .shopActivated
        case .bag: return .bagActivated
        case .favorites: return .heartActivated
        case .profile: return .profileActivated
        }
    }
    
    var inactiveIcon: ImageResource {
        switch self {
        case .home: return .homeInactive
        case .shop: return .shopInactive
        case .bag: return .bagInactive
        case .favorites: return .heartInactive
        case .profile: return .profileInactive
        }
    }
}

// MARK: - Preview
#Preview {
    ContentView()
        .environmentObject(AuthenticationManager())
}
