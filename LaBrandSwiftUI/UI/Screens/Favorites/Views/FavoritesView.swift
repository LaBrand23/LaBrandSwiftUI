import SwiftUI

struct FavoritesView: View {
    @StateObject private var viewModel: FavoritesViewModel
    @State private var selectedProduct: Product?
    
    init(favoritesManager: FavoritesManager) {
        _viewModel = StateObject(wrappedValue: FavoritesViewModel(favoritesManager: favoritesManager))
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Category Filter
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(viewModel.categories, id: \.self) { category in
                        CategoryButton(
                            title: category,
                            isSelected: viewModel.selectedCategory == category,
                            action: { viewModel.selectedCategory = category }
                        )
                    }
                }
                .padding(.horizontal)
            }
            
            // Sort and View Toggle
            HStack {
                Spacer()
                // Sort Menu
                Menu {
                    Button("Price: Low to High") {
                        viewModel.sortOption = .priceLowToHigh
                    }
                    Button("Price: High to Low") {
                        viewModel.sortOption = .priceHighToLow
                    }
                } label: {
                    HStack {
                        Image(systemName: "arrow.up.arrow.down")
                        Text(viewModel.sortOption.title)
                    }
                    .foregroundColor(.primary)
                }
            }
//            .padding(.horizontal)
            .padding([.horizontal, .vertical], 15)
            .background {
                Rectangle()
                    .fill(.white)
                    .shadow(color: .gray.opacity(0.3), radius: 3, y: 6)
            }
            .zIndex(99)
            
            if viewModel.filteredProducts.isEmpty {
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
                // Products Grid/List
                ScrollView {
                    LazyVGrid(
                        columns: [
                            GridItem(.flexible(), spacing: 16),
                            GridItem(.flexible(), spacing: 16)
                        ],
                        spacing: 16
                    ) {
                        ForEach(viewModel.filteredProducts) { product in
                            let productState: ProductCardState = Bool.random() ? .soldOut : .defaultForFavorite
                            ProductCard(product: product, state: productState)
                                .if(productState != .soldOut ) { view in
                                    view
                                        .navigateOnTap(to: product, selection: $selectedProduct)
                                }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Favorites")
        .navigationBarTitleDisplayMode(.automatic)
        .navigationDestination(item: $selectedProduct) { product in
            ProductDetailView(product: product)
        }
    }
}

// MARK: - Supporting Views
private struct CategoryButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(.medium)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.black : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .clipShape(Capsule())
        }
    }
}

#Preview {
    NavigationStack {
        FavoritesView(favoritesManager: FavoritesManager())
    }
}
