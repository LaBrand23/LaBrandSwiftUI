import SwiftUI
import Combine

class FavoritesManager: ObservableObject {
    @Published private(set) var favoriteProducts: [Product] = []
    private let favoritesKey = "com.labrand.favorites"
    
    init() {
        loadFavorites()
    }
    
    func toggleFavorite(_ product: Product) {
        if let index = favoriteProducts.firstIndex(where: { $0.id == product.id }) {
            favoriteProducts.remove(at: index)
        } else {
            favoriteProducts.append(product)
        }
        saveFavorites()
    }
    
    func isFavorite(_ product: Product) -> Bool {
        favoriteProducts.contains(where: { $0.id == product.id })
    }
    
    private func loadFavorites() {
        if let data = UserDefaults.standard.data(forKey: favoritesKey),
           let favorites = try? JSONDecoder().decode([Product].self, from: data) {
            favoriteProducts = favorites
        }
    }
    
    private func saveFavorites() {
        if let data = try? JSONEncoder().encode(favoriteProducts) {
            UserDefaults.standard.set(data, forKey: favoritesKey)
        }
    }
} 
