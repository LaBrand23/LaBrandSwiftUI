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
            product.brand.localizedCaseInsensitiveContains(query) ||
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
    private let mockProducts = [
        Product(
            id: UUID(),
            name: "Summer Floral Dress",
            description: "Beautiful floral print dress perfect for summer",
            price: 79.99,
            originalPrice: 99.99,
            images: ["dress_1"],
            category: Category(id: UUID(), name: "Dresses", image: "dresses", parentCategoryID: nil, subcategories: nil),
            brand: "LaBrand",
            rating: 4.8,
            reviewCount: 24,
            colors: ["Blue", "Pink"],
            sizes: ["XS", "S", "M", "L"],
            isNew: true,
            isFavorite: false,
            createdAt: .now
        ),
        Product(
            id: UUID(),
            name: "Classic Denim Jacket",
            description: "Timeless denim jacket for any occasion",
            price: 89.99,
            originalPrice: nil,
            images: ["jacket_1"],
            category: Category(id: UUID(), name: "Jackets", image: "jackets", parentCategoryID: nil, subcategories: nil),
            brand: "LaBrand",
            rating: 4.6,
            reviewCount: 42,
            colors: ["Blue", "Black"],
            sizes: ["S", "M", "L", "XL"],
            isNew: true,
            isFavorite: false,
            createdAt: .now
        ),
        Product(
            id: UUID(),
            name: "Leather Crossbody Bag",
            description: "Elegant leather crossbody bag",
            price: 79.99,
            originalPrice: 129.99,
            images: ["bag_1"],
            category: Category(id: UUID(), name: "Bags", image: "bags", parentCategoryID: nil, subcategories: nil),
            brand: "LaBrand",
            rating: 4.7,
            reviewCount: 153,
            colors: ["Black", "Brown", "Tan"],
            sizes: ["One Size"],
            isNew: false,
            isFavorite: false,
            createdAt: .now
        ),
        Product(
            id: UUID(),
            name: "Striped T-Shirt",
            description: "Classic striped t-shirt",
            price: 24.99,
            originalPrice: 39.99,
            images: ["tshirt_1"],
            category: Category(id: UUID(), name: "T-Shirts", image: "tshirts", parentCategoryID: nil, subcategories: nil),
            brand: "LaBrand",
            rating: 4.5,
            reviewCount: 86,
            colors: ["White", "Navy"],
            sizes: ["XS", "S", "M", "L", "XL"],
            isNew: false,
            isFavorite: false,
            createdAt: .now
        )
    ]
} 
