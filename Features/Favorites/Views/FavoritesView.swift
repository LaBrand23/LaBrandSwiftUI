import SwiftUI

struct FavoritesView: View {
    @EnvironmentObject private var favoritesManager: FavoritesManager
    @State private var selectedCategory: String = "All"
    @State private var sortOption: SortOption = .priceLowToHigh
    
    private let categories = ["All", "Summer", "T-Shirts", "Shirts"]
    
    private var filteredProducts: [Product] {
        if selectedCategory == "All" {
            return favoritesManager.favoriteProducts
        }
        return favoritesManager.favoriteProducts.filter { $0.category.name == selectedCategory }
    }
    
    private var sortedProducts: [Product] {
        switch sortOption {
        case .priceLowToHigh:
            return filteredProducts.sorted { $0.price < $1.price }
        case .priceHighToLow:
            return filteredProducts.sorted { $0.price > $1.price }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 16) {
                // Category Filter
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(categories, id: \.self) { category in
                            Button(action: { selectedCategory = category }) {
                                Text(category)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                    .padding(.horizontal, 16)
                                    .padding(.vertical, 8)
                                    .background(selectedCategory == category ? Color.black : Color(.systemGray6))
                                    .foregroundColor(selectedCategory == category ? .white : .primary)
                                    .clipShape(Capsule())
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                
                // Sort Options
                HStack {
                    Menu {
                        Button("Price: Low to High") { sortOption = .priceLowToHigh }
                        Button("Price: High to Low") { sortOption = .priceHighToLow }
                    } label: {
                        HStack {
                            Image(systemName: "arrow.up.arrow.down")
                            Text(sortOption.title)
                        }
                        .foregroundColor(.primary)
                    }
                    
                    Spacer()
                }
                .padding(.horizontal)
                
                if favoritesManager.favoriteProducts.isEmpty {
                    // Empty State
                    VStack(spacing: 16) {
                        Image(systemName: "heart.slash")
                            .font(.system(size: 64))
                            .foregroundColor(.gray)
                        Text("No favorites yet")
                            .font(.title2)
                            .fontWeight(.semibold)
                        Text("Items added to your favorites will appear here")
                            .foregroundColor(.gray)
                    }
                    .frame(maxHeight: .infinity)
                } else {
                    // Products Grid
                    ScrollView {
                        LazyVGrid(
                            columns: [
                                GridItem(.flexible(), spacing: 16),
                                GridItem(.flexible(), spacing: 16)
                            ],
                            spacing: 16
                        ) {
                            ForEach(sortedProducts) { product in
                                ProductCard(product: product)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .navigationTitle("Favorites")
        }
    }
}

// MARK: - Supporting Types
private enum SortOption {
    case priceLowToHigh
    case priceHighToLow
    
    var title: String {
        switch self {
        case .priceLowToHigh: return "Price: Low to High"
        case .priceHighToLow: return "Price: High to Low"
        }
    }
}

#Preview {
    FavoritesView()
        .environmentObject(FavoritesManager())
} 