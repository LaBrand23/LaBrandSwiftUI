import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @StateObject private var viewModel = ProductDetailViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Product Images
                TabView {
                    ForEach(product.images, id: \.self) { imageUrl in
                        AsyncImage(url: URL(string: imageUrl)) { image in
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        } placeholder: {
                            Rectangle()
                                .foregroundColor(Color(.systemGray6))
                        }
                    }
                }
                .frame(height: 450)
                .tabViewStyle(.page)
                
                VStack(alignment: .leading, spacing: 16) {
                    // Brand and Name
                    VStack(alignment: .leading, spacing: 8) {
                        Text(product.brand.name)
                            .font(.headline)
                            .foregroundColor(.gray)
                        
                        Text(product.name)
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    
                    // Price
                    HStack(alignment: .firstTextBaseline) {
                        Text("$\(String(format: "%.2f", Double(truncating: product.price as NSNumber)))")
                            .font(.title3)
                            .fontWeight(.semibold)
                        
                        if let originalPrice = product.originalPrice {
                            Text("$\(String(format: "%.2f", Double(truncating: originalPrice as NSNumber)))")
                                .font(.subheadline)
                                .strikethrough()
                                .foregroundColor(.gray)
                        }
                        
                        Spacer()
                        
                        // Rating
                        HStack {
                            Image(systemName: "star.fill")
                                .foregroundColor(.yellow)
                            Text(String(format: "%.1f", product.rating))
                            Text("(\(product.reviewCount))")
                                .foregroundColor(.gray)
                        }
                        .font(.subheadline)
                    }
                    
                    // Size Selection
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Select size")
                            .font(.headline)
                        
                        HStack(spacing: 12) {
                            ForEach(product.sizes, id: \.self) { size in
                                SizeButton(
                                    size: size,
                                    isSelected: viewModel.selectedSize == size,
                                    action: { viewModel.selectedSize = size }
                                )
                            }
                        }
                    }
                    
                    // Color Selection
                    if !product.colors.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Available colors")
                                .font(.headline)
                            
                            HStack(spacing: 12) {
                                ForEach(product.colors, id: \.self) { color in
                                    ColorButton(
                                        color: color,
                                        isSelected: viewModel.selectedColor == color,
                                        action: { viewModel.selectedColor = color }
                                    )
                                }
                            }
                        }
                    }
                    
                    // Description
                    Text(product.description)
                        .foregroundColor(.gray)
                        .padding(.vertical)
                    
                    // Reviews Section
                    NavigationLink {
                        ReviewsView(product: product)
                            .environmentObject(viewModel)
                    } label: {
                        HStack {
                            Text("Reviews")
                                .font(.headline)
                            Spacer()
                            Text("See all")
                                .foregroundColor(.red)
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    viewModel.toggleFavorite()
                } label: {
                    Image(systemName: product.isFavorite ? "heart.fill" : "heart")
                        .foregroundColor(product.isFavorite ? .red : .primary)
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            AddToCartButton(
                price: Decimal(product.price),
                isEnabled: viewModel.selectedSize != nil,
                action: viewModel.addToCart
            )
            .padding()
            .background(.regularMaterial)
        }
        .toolbar(.hidden, for: .tabBar)
    }
}

struct SizeButton: View {
    let size: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(size)
                .font(.subheadline)
                .fontWeight(.medium)
                .frame(width: 44, height: 44)
                .background(isSelected ? Color.black : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(12)
        }
    }
}

struct ColorButton: View {
    let color: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Circle()
                .fill(Color(color.lowercased()))
                .frame(width: 32, height: 32)
                .overlay(
                    Circle()
                        .strokeBorder(isSelected ? .black : .clear, lineWidth: 2)
                        .padding(2)
                )
        }
    }
}

struct AddToCartButton: View {
    let price: Decimal
    let isEnabled: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Text("Add to Cart")
                    .fontWeight(.semibold)
                Spacer()
                Text("$\(String(format: "%.2f", Double(truncating: price as NSNumber)))")
                    .fontWeight(.semibold)
            }
            .foregroundColor(.white)
            .padding()
            .background(isEnabled ? Color.red : Color.gray)
            .cornerRadius(25)
        }
        .disabled(!isEnabled)
    }
}

class ProductDetailViewModel: ObservableObject {
    @Published var selectedSize: String?
    @Published var selectedColor: String?
    @Published var quantity = 1
    @Published var isFavorite = false
    @Published var showAddReview = false
    
    func toggleFavorite() {
        isFavorite.toggle()
        // TODO: Implement favorite toggling with backend
    }
    
    func addToCart() {
        guard let size = selectedSize else { return }
        // TODO: Implement add to cart with backend
        print("Adding to cart: size \(size), color: \(selectedColor ?? "default"), quantity: \(quantity)")
    }
    
    func addReview() {
        showAddReview = true
    }
}

#Preview {
    ProductDetailView(product: .mockProducts.first!)
}
