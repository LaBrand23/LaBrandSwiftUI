import SwiftUI

struct ProductListView: View {
    let category: Category
    @StateObject private var viewModel = ProductListViewModel()
    @State private var showFilters = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Filter Bar
                HStack(spacing: 16) {
                    // Filter Button
                    Button {
                        showFilters = true
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
                    
                    // Sort Button
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
                .padding(.horizontal)
                
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
                        NavigationLink(destination: ProductDetailView(product: product)) {
                            ProductCard(product: product)
                        }
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
        .onAppear {
            viewModel.loadProducts(for: category)
        }
    }
}

extension ProductListViewModel {
    struct ProductCard: View {
        let product: Product
        
        var body: some View {
            VStack(alignment: .leading, spacing: 8) {
                // Product Image
                AsyncImage(url: URL(string: product.images.first ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .foregroundColor(Color(.systemGray6))
                }
                .frame(height: 200)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(
                    Group {
                        if product.isNew {
                            Text("NEW")
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.black)
                                .cornerRadius(4)
                                .padding(8)
                        }
                    },
                    alignment: .topLeading
                )
                
                // Product Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.brand)
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Text(product.name)
                        .font(.subheadline)
                        .lineLimit(2)
                    
                    HStack {
                        Text("$\(String(format: "%.2f", Double(truncating: product.price as NSNumber)))")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                        
                        if let originalPrice = product.originalPrice {
                            Text("$\(String(format: "%.2f", Double(truncating: originalPrice as NSNumber)))")
                                .font(.caption)
                                .strikethrough()
                                .foregroundColor(.gray)
                        }
                        
                        Spacer()
                        
                        HStack(spacing: 2) {
                            Image(systemName: "star.fill")
                                .foregroundColor(.yellow)
                            Text(String(format: "%.1f", product.rating))
                        }
                        .font(.caption)
                    }
                }
            }
            .foregroundColor(.primary)
        }
    }
}

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

class ProductListViewModel: ObservableObject {
    enum SortOption {
        case popular, newest, customerReview, priceLowToHigh, priceHighToLow
        
        var displayText: String {
            switch self {
            case .popular: return "Popular"
            case .newest: return "Newest"
            case .customerReview: return "Customer Review"
            case .priceLowToHigh: return "Price: Low to High"
            case .priceHighToLow: return "Price: High to Low"
            }
        }
    }
    
    @Published var products: [Product] = []
    @Published var sortOption: SortOption = .popular
    @Published var selectedPriceRange: ClosedRange<Double> = 0...1000
    @Published var selectedColors: Set<String> = []
    @Published var selectedSizes: Set<String> = []
    @Published var selectedBrands: Set<String> = []
    
    var filteredProducts: [Product] {
        var result = products
        
        // Apply filters
        if !selectedColors.isEmpty {
            result = result.filter { product in
                product.colors.contains { selectedColors.contains($0) }
            }
        }
        
        if !selectedSizes.isEmpty {
            result = result.filter { product in
                product.sizes.contains { selectedSizes.contains($0) }
            }
        }
        
        if !selectedBrands.isEmpty {
            result = result.filter { selectedBrands.contains($0.brand) }
        }
        
        let minPrice = Decimal(selectedPriceRange.lowerBound)
        let maxPrice = Decimal(selectedPriceRange.upperBound)
        result = result.filter { $0.price >= minPrice && $0.price <= maxPrice }
        
        // Apply sorting
        switch sortOption {
        case .popular:
            result.sort { $0.reviewCount > $1.reviewCount }
        case .newest:
            result.sort(by: { $0.createdAt > $1.createdAt})
        case .customerReview:
            result.sort { $0.rating > $1.rating }
        case .priceLowToHigh:
            result.sort { $0.price < $1.price }
        case .priceHighToLow:
            result.sort { $0.price > $1.price }
        }
        
        return result
    }
    
    var activeFilters: [String] {
        var filters: [String] = []
        
        if !selectedColors.isEmpty {
            filters.append(contentsOf: selectedColors)
        }
        
        if !selectedSizes.isEmpty {
            filters.append(contentsOf: selectedSizes)
        }
        
        if !selectedBrands.isEmpty {
            filters.append(contentsOf: selectedBrands)
        }
        
        if selectedPriceRange != 0...1000 {
            filters.append("$\(Int(selectedPriceRange.lowerBound))-$\(Int(selectedPriceRange.upperBound))")
        }
        
        return filters
    }
    
    func loadProducts(for category: Category) {
        // TODO: Load products from backend
        // For now, using mock data
        products = Product.mockProducts
    }
    
    func removeFilter(_ filter: String) {
        selectedColors.remove(filter)
        selectedSizes.remove(filter)
        selectedBrands.remove(filter)
        
        // Handle price range filter removal
        if filter.contains("$") {
            selectedPriceRange = 0...1000
        }
    }
} 
