import SwiftUI

struct SearchView: View {
    @StateObject private var viewModel = SearchViewModel()
    @State private var showVisualSearch = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search header
                SearchHeader(
                    searchText: $viewModel.searchText,
                    showVisualSearch: $showVisualSearch
                )
                .padding()
                
                if viewModel.searchText.isEmpty {
                    // Recent searches and trending
                    ScrollView {
                        VStack(spacing: 24) {
                            if !viewModel.recentSearches.isEmpty {
                                SearchSection(title: "Recent Searches") {
                                    ForEach(viewModel.recentSearches, id: \.self) { search in
                                        RecentSearchRow(
                                            text: search,
                                            onTap: {
                                                viewModel.searchText = search
                                            },
                                            onDelete: {
                                                viewModel.removeRecentSearch(search)
                                            }
                                        )
                                    }
                                }
                            }
                            
                            SearchSection(title: "Trending Now") {
                                LazyVGrid(columns: [
                                    GridItem(.flexible()),
                                    GridItem(.flexible())
                                ], spacing: 16) {
                                    ForEach(viewModel.trendingProducts) { product in
                                        ProductCard(product: product, imageSize: 140)
                                            .environmentObject(FavoritesManager())
                                    }
                                }
                            }
                        }
                        .padding()
                    }
                } else {
                    // Search results
                    ScrollView {
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 16) {
                            ForEach(viewModel.searchResults) { product in
                                ProductCard(product: product, imageSize: 140)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.inline)
        }
        .sheet(isPresented: $showVisualSearch) {
            VisualSearchView()
        }
    }
}

struct SearchHeader: View {
    @Binding var searchText: String
    @Binding var showVisualSearch: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.gray)
                TextField("Search for items", text: $searchText)
                
                if !searchText.isEmpty {
                    Button {
                        searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            .cornerRadius(12)
            
            Button {
                showVisualSearch = true
            } label: {
                Image(systemName: "camera")
                    .foregroundColor(.primary)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .clipShape(Circle())
            }
        }
    }
}

struct SearchSection<Content: View>: View {
    let title: String
    let content: Content
    
    init(title: String, @ViewBuilder content: () -> Content) {
        self.title = title
        self.content = content()
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.headline)
            content
        }
    }
}

struct RecentSearchRow: View {
    let text: String
    let onTap: () -> Void
    let onDelete: () -> Void
    
    var body: some View {
        HStack {
            Button {
                onTap()
            } label: {
                HStack {
                    Image(systemName: "clock")
                        .foregroundColor(.gray)
                    Text(text)
                        .foregroundColor(.primary)
                }
            }
            
            Spacer()
            
            Button {
                onDelete()
            } label: {
                Image(systemName: "xmark")
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 4)
    }
} 
