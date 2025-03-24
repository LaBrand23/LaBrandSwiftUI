import SwiftUI

@main
struct LaBrandSwiftUIApp: App {
    @StateObject private var favoritesManager = FavoritesManager()
    
    var body: some Scene {
        WindowGroup {
            TabView {
                HomeView()
                    .tabItem {
                        Label("Home", systemImage: "house")
                    }
                
                CategoriesView()
                    .tabItem {
                        Label("Categories", systemImage: "square.grid.2x2")
                    }
                
                SearchView()
                    .tabItem {
                        Label("Search", systemImage: "magnifyingglass")
                    }
                
                FavoritesView(favoritesManager: favoritesManager)
                    .tabItem {
                        Label("Favorites", systemImage: "heart")
                    }
                
                ProfileView()
                    .tabItem {
                        Label("Profile", systemImage: "person")
                    }
            }
            .environmentObject(favoritesManager)
        }
    }
} 