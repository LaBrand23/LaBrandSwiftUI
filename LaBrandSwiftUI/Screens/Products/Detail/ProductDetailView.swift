import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @StateObject private var viewModel = ProductDetailViewModel()
    @Environment(\.dismiss) private var dismiss
    @State var selectedProduct: Product?
    
    var body: some View {
//        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
    //                 Product Images
                    TabView {
                        ForEach(product.images, id: \.self) { imageUrl in
                            AsyncImageView(imageUrl: imageUrl) {
                                Rectangle()
                                    .foregroundColor(Color(.systemGray6))
                            }
                            .onTapGesture {
                                viewModel.selectedImageForFullScreen = imageUrl
                            }
                        }
                    }
                    .frame(height: UIScreen.screenHeight/2.5)
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
                        .padding(.horizontal)
                        
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
                        .padding(.horizontal)
                        
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
                        .padding(.horizontal)
                        
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
                            .padding(.horizontal)
                        }
                        
                        
                        // Description
                        Text(product.description)
                            .foregroundColor(.gray)
                            .padding(.vertical)
                            .padding(.horizontal)
                        
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
                            .padding(.horizontal)
                        }
                        
                        // Recommended Products Section
                        if !viewModel.recommendedProducts.isEmpty {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("You may also like")
                                    .font(.headline)
                                    .padding(.horizontal)
                                
                                ScrollView(.horizontal, showsIndicators: false) {
                                    LazyHStack(spacing: 16) {
                                        ForEach(viewModel.recommendedProducts) { product in
                                            ProductCard(product: product)
                                                .navigateOnTap(to: product, selection: $selectedProduct)
                                        }
                                    }
                                    .padding(.horizontal)
                                }
                            }
                        } else if viewModel.isLoadingRecommendations {
                            HStack {
                                Spacer()
                                ProgressView()
                                Spacer()
                            }
                            .padding(.horizontal)
                        }
                    }
                    
                }
                .padding(.bottom)
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
    //        .applyToolbarHidden()
            .navigationDestination(item: $selectedProduct, destination: { ProductDetailView(product: $0) })
            .fullScreenCover(item: .init(
                get: { viewModel.selectedImageForFullScreen.map { ImageSource(url: $0) } },
                set: { viewModel.selectedImageForFullScreen = $0?.url }
            )) { imageSource in
                ImageFullScreenView(imageUrl: imageSource.url)
            }
            .onAppear {
                viewModel.fetchRecommendedProducts(for: product.id)
            }
//        }
    }
}

// Custom View Extension to Apply Different Modifiers Based on iOS Version
extension View {
    @ViewBuilder
    func applyToolbarHidden() -> some View {
        if #available(iOS 18.0, *) {
            self.toolbarVisibility(.hidden, for: .navigationBar) // iOS 18+
        } else {
            self.toolbar(.hidden, for: .navigationBar) // iOS < 18
        }
    }
    
    @ViewBuilder
    func applyToolbarVisible() -> some View {
        if #available(iOS 18.0, *) {
            self.toolbarVisibility(.visible, for: .navigationBar) // iOS 18+
        } else {
            self.toolbar(.visible, for: .navigationBar) // iOS < 18
        }
    }
}

#Preview {
    NavigationStack {
        ProductDetailView(product: .mockProducts.first!)
    }
}
