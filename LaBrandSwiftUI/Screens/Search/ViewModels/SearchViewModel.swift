import SwiftUI
import Combine

@MainActor
class SearchViewModel: ObservableObject {
    @Published var searchText = ""
    @Published var searchResults: [Product] = []
    @Published var recentSearches: [String] = []
    @Published var trendingProducts: [Product] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    private var cancellables = Set<AnyCancellable>()
    private let maxRecentSearches = 10
    
    init() {
        loadRecentSearches()
        setupSearchPublisher()
        loadTrendingProducts()
    }
    
    private func setupSearchPublisher() {
        $searchText
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .removeDuplicates()
            .sink { [weak self] text in
                guard !text.isEmpty else {
                    self?.searchResults = []
                    return
                }
                
                Task {
                    await self?.performSearch(text)
                }
            }
            .store(in: &cancellables)
    }
    
    private func performSearch(_ query: String) async {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Implement actual search API call
        // For now, using mock data
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        // Filter mock products based on search query
        searchResults = mockProducts.filter { product in
            product.name.localizedCaseInsensitiveContains(query) ||
            product.brand.name.localizedCaseInsensitiveContains(query) ||
            product.description.localizedCaseInsensitiveContains(query)
        }
        
        // Add to recent searches
        if !query.isEmpty && !recentSearches.contains(query) {
            recentSearches.insert(query, at: 0)
            if recentSearches.count > maxRecentSearches {
                recentSearches.removeLast()
            }
            saveRecentSearches()
        }
    }
    
    func removeRecentSearch(_ search: String) {
        recentSearches.removeAll { $0 == search }
        saveRecentSearches()
    }
    
    func clearAllRecentSearches() {
        recentSearches.removeAll()
        saveRecentSearches()
    }
    
    private func loadRecentSearches() {
        recentSearches = UserDefaults.standard.stringArray(forKey: "RecentSearches") ?? []
    }
    
    private func saveRecentSearches() {
        UserDefaults.standard.set(recentSearches, forKey: "RecentSearches")
    }
    
    private func loadTrendingProducts() {
        // TODO: Implement actual trending products API call
        // For now, using mock data
        trendingProducts = Array(mockProducts.prefix(4))
    }
    
    // Mock products for demo
    private let mockProducts = Product.mockProducts
}
