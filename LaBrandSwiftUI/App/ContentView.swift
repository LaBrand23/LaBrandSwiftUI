import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var authManager: AuthenticationManager
    
    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                SignInView()
            }
        }
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house")
                }
            
            SearchView()
                .tabItem {
                    Label("Search", systemImage: "magnifyingglass")
                }
            
            CategoriesView()
                .tabItem {
                    Label("Categories", systemImage: "square.grid.2x2")
                }
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person")
                }
        }
        .accentColor(.red)
    }
}


#Preview {
    ContentView()
        .environmentObject(AuthenticationManager())
}
