import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var authManager: AuthenticationManager
    
    var body: some View {
        Group {
            if true /*authManager.isAuthenticated*/ {
                MainTabView()
            } else {
                SignInView()
            }
        }
    }
}

struct MainTabView: View {
    
    @StateObject private var favoritesManager = FavoritesManager()
    
    var body: some View {
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
//        .accentColor(.red)
    }
}


#Preview {
    ContentView()
        .environmentObject(AuthenticationManager())
}
