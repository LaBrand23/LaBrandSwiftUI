import SwiftUI

struct ProductListView: View {
    // MARK: - PROPERTIES
    let category: Category
    @StateObject private var viewModel = ProductListViewModel()
    @State private var showFilters = false
    @State private var showProductDetail = false
    @State private var selectedProduct: Product?
    
    // MARK: - body
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Filter Bar
                HStack(spacing: 16) {
                    // Filter Button
                    filterButton {
                        showFilters = true
                    }
                    
                    // Sort Button
                    sortButtonUI
                }
                .padding(.horizontal)
                .tint(.black)
                
                // Active Filters
                if !viewModel.activeFilters.isEmpty {
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(viewModel.activeFilters, id: \.self) { filter in
                                FilterChip(
                                    text: filter,
                                    onRemove: { viewModel.removeFilter(filter) }
                                )
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                
                // Products Grid
                LazyVGrid(
                    columns: [
                        GridItem(.flexible(), spacing: 16),
                        GridItem(.flexible(), spacing: 16)
                    ],
                    spacing: 16
                ) {
                    ForEach(viewModel.filteredProducts) { product in
                        ProductCard(product: product)
                            .navigateOnTap(to: product, selection: $selectedProduct)
                    }
                }
                .padding(.horizontal)
            }
        }
        .navigationTitle(category.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    // Search action
                } label: {
                    Image(systemName: "magnifyingglass")
                }
            }
        }
        .sheet(isPresented: $showFilters) {
            FilterView(
                selectedPriceRange: $viewModel.selectedPriceRange,
                selectedColors: $viewModel.selectedColors,
                selectedSizes: $viewModel.selectedSizes,
                selectedBrands: $viewModel.selectedBrands,
                isPresented: $showFilters
            )
        }
        .navigationDestination(for: $selectedProduct) { product in
            ProductDetailView(product: product)
        }
        .task {
            viewModel.loadProducts(for: category)
        }
    }
}

// MARK: - Privates UI

private extension ProductListView {
    struct FilterChip: View {
        let text: String
        let onRemove: () -> Void
        
        var body: some View {
            HStack(spacing: 4) {
                Text(text)
                    .font(.subheadline)
                Button(action: onRemove) {
                    Image(systemName: "xmark")
                        .font(.caption2)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(Color(.systemGray6))
            .cornerRadius(16)
        }
    }
    
    func filterButton(_ action: @escaping ()-> Void) -> some View {
        Button {
            action()
        } label: {
            HStack {
                Image(systemName: "slider.horizontal.3")
                Text("Filters")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            .cornerRadius(20)
        }
    }
    
    var sortButtonUI: some View {
        Menu {
            Button("Popular", action: { viewModel.sortOption = .popular })
            Button("Newest", action: { viewModel.sortOption = .newest })
            Button("Customer Review", action: { viewModel.sortOption = .customerReview })
            Button("Price: Low to High", action: { viewModel.sortOption = .priceLowToHigh })
            Button("Price: High to Low", action: { viewModel.sortOption = .priceHighToLow })
        } label: {
            HStack {
                Text(viewModel.sortOption.displayText)
                Image(systemName: "chevron.down")
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(Color(.systemGray6))
            .cornerRadius(20)
        }
    }
}

#Preview {
    NavigationStack {
        ProductListView(category: .mockCategories.first!)
    }
}
