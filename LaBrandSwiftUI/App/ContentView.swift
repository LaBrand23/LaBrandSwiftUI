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
    @State private var selectedTab: TabBarTag = .home
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(selectedTab == .home ? .homeActivated : .homeInactive)
                    Text(selectedTab.rawValue)
                }
                .tag(TabBarTag.home)
            
            CategoriesView()
                .tabItem {
                    Image(selectedTab == .shop ? .shopActivated : .shopInactive)
                    Text(selectedTab.rawValue)
                }
                .tag(TabBarTag.shop)
            
            BagView()
                .tabItem {
                    Image(selectedTab == .bag ? .bagActivated : .bagInactive)
                    Text(selectedTab.rawValue)
                }
                .tag(TabBarTag.bag)
            
            FavoritesView(favoritesManager: favoritesManager)
                .tabItem {
                    Image(selectedTab == .favorites ? .heartActivated : .heartInactive)
                    Text(selectedTab.rawValue)
                }
                .tag(TabBarTag.favorites)
            
            ProfileView()
                .tabItem {
                    Image(selectedTab == .profile ? .profileActivated : .profileInactive)
                    Text(selectedTab.rawValue)
                }
                .tag(TabBarTag.profile)
        }
        .accentColor(.red)
        .environmentObject(favoritesManager)
        .environment(\.tabSelection, $selectedTab)
    }
}



#Preview {
    ContentView()
        .environmentObject(AuthenticationManager())
}
