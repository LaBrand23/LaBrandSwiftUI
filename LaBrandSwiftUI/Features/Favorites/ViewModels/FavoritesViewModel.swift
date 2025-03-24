import SwiftUI
import Combine

class FavoritesViewModel: ObservableObject {
    @Published var selectedCategory: String = "All"
    @Published var sortOption: SortOption = .priceLowToHigh
    @Published var isGridView: Bool = true
    
    let categories = ["All", "Summer", "T-Shirts", "Shirts"]
    
    @Published private(set) var filteredProducts: [Product] = []
    private var cancellables = Set<AnyCancellable>()
    private let favoritesManager: FavoritesManager
    
    init(favoritesManager: FavoritesManager) {
        self.favoritesManager = favoritesManager
        setupBindings()
    }
    
    private func setupBindings() {
        // Combine publishers for filtering and sorting
        Publishers.CombineLatest(
            favoritesManager.$favoriteProducts,
            $selectedCategory
        )
        .map { [weak self] products, category -> [Product] in
            self?.filterProducts(products, category: category) ?? []
        }
        .assign(to: &$filteredProducts)
    }
    
    private func filterProducts(_ products: [Product], category: String) -> [Product] {
        let filtered = category == "All" ? products : products.filter { $0.category.name == category }
        return sortProducts(filtered)
    }
    
    private func sortProducts(_ products: [Product]) -> [Product] {
        switch sortOption {
        case .priceLowToHigh:
            return products.sorted { $0.price < $1.price }
        case .priceHighToLow:
            return products.sorted { $0.price > $1.price }
        }
    }
    
    func toggleFavorite(_ product: Product) {
        favoritesManager.toggleFavorite(product)
    }
    
    func isFavorite(_ product: Product) -> Bool {
        favoritesManager.isFavorite(product)
    }
}

// MARK: - Supporting Types
extension FavoritesViewModel {
    enum SortOption {
        case priceLowToHigh
        case priceHighToLow
        
        var title: String {
            switch self {
            case .priceLowToHigh: return "Price: Low to High"
            case .priceHighToLow: return "Price: High to Low"
            }
        }
    }
} 
