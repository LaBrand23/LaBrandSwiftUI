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
        NavigationStack {
            TabView(selection: $selectedTab) {
                NavigationView {
                    HomeView()
                }
                .tabItem {
                    Image(selectedTab == .home ? .homeActivated : .homeInactive)
                    Text(TabBarTag.home.rawValue)
                }
                .tag(TabBarTag.home)
                
                NavigationView {
                    CategoriesView()
                }
                .tabItem {
                    Image(selectedTab == .shop ? .shopActivated : .shopInactive)
                    Text(TabBarTag.shop.rawValue)
                }
                .tag(TabBarTag.shop)
                
                NavigationView {
                    BagView()
                }
                .tabItem {
                    Image(selectedTab == .bag ? .bagActivated : .bagInactive)
                    Text(TabBarTag.bag.rawValue)
                }
                .tag(TabBarTag.bag)
                
                NavigationView {
                    FavoritesView(favoritesManager: favoritesManager)
                }
                .tabItem {
                    Image(selectedTab == .favorites ? .heartActivated : .heartInactive)
                    Text(TabBarTag.favorites.rawValue)
                }
                .tag(TabBarTag.favorites)
                
                NavigationView {
                    ProfileView()
                }
                .tabItem {
                    Image(selectedTab == .profile ? .profileActivated : .profileInactive)
                    Text(TabBarTag.profile.rawValue)
                }
                .tag(TabBarTag.profile)
            }
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
