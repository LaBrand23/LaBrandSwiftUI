//
//  ProductDetailView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct ProductDetailView: View {
    let product: Product
    @StateObject private var viewModel = ProductDetailViewModel()
    @Environment(\.dismiss) private var dismiss
    @State var selectedProduct: Product?
    @State var showReviews = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 0) {

                // Product Images with improved gallery
                ProductImageGallery(
                    images: product.images,
                    selectedImageIndex: $viewModel.currentImageIndex,
                    onImageTap: { imageUrl in
                        viewModel.selectedImageForFullScreen = imageUrl
                    }
                )
                
                VStack(spacing: 20) {
                    // Brand and Name
                    VStack(alignment: .leading, spacing: 8) {
                        Text(product.brand.name)
                            .font(.headline)
                            .foregroundColor(.gray)
                        
                        Text(product.name)
                            .font(.title2)
                            .fontWeight(.bold)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)
                    
                    // Trust Badges
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(viewModel.trustBadges, id: \.title) { badge in
                                TrustBadgeView(badge: badge)
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Social Proof
                    SocialProofView(socialProof: viewModel.socialProof)
                        .padding(.horizontal)
                    
                    // Stock Info & Urgency
                    if viewModel.stockInfo.isLowStock {
                        HStack {
                            Image(systemName: "exclamationmark.triangle.fill")
                                .foregroundColor(.orange)
                            Text(viewModel.stockInfo.stockMessage)
                                .font(.subheadline)
                                .fontWeight(.medium)
                                .foregroundColor(.orange)
                            Spacer()
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 8)
                        .background(Color.orange.opacity(0.1))
                        .cornerRadius(8)
                        .padding(.horizontal)
                    }
                    
                    // Improved Price Display
                    ProductPriceView(product: product)
                    
                    // Shipping Progress
//                    ShippingProgressView(shippingInfo: viewModel.shippingInfo)
//                        .padding(.horizontal)
                    
                    // Size Selection with Grid Layout
                    SizeSelectionView(
                        sizes: product.sizes,
                        selectedSize: $viewModel.selectedSize,
                        onSizeGuideTap: {
                            viewModel.showSizeGuide = true
                        }
                    )
                    .padding(.horizontal)
                    
                    // Color Selection
                    if !product.colors.isEmpty {
                        ColorSelectionView(
                            colors: product.colors,
                            selectedColor: $viewModel.selectedColor
                        )
                    }
                    
                    // Expandable Description
                    ExpandableDescriptionView(
                        description: product.description,
                        isExpanded: $viewModel.isDescriptionExpanded
                    )
                    .padding(.horizontal)
                    
                    // Reviews Preview
                    ReviewsPreviewView(
                        product: product,
                        onSeeAllReviews: {
                            showReviews = true
                        }
                    )
                    
                    // Complete the Look (Cross-selling)
                    if !viewModel.recommendedProducts.isEmpty {
//                        CompleteTheLookView(
//                            products: viewModel.recommendedProducts,
                        //                            onProductTap: { product in
                        //                                selectedProduct = product
                        //                            }
                        //                        )
                        
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
                        .padding()
                    }
                }
                .padding(.bottom, 100) // Space for sticky CTA
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .navigationTitle(product.name)
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
            // Sticky Add to Cart Button
            VStack(spacing: 0) {
                // Delivery info
                HStack {
                    Image(systemName: "truck")
                        .foregroundColor(.green)
                    Text(viewModel.stockInfo.deliveryMessage)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                }
                .padding(.horizontal)
                .padding(.vertical, 8)
                .background(Color(.systemGray6))
                
                AddToCartButton(
                    price: Decimal(product.price),
                    isEnabled: viewModel.selectedSize != nil,
                    action: viewModel.addToCart
                )
                .padding()
                .background(.regularMaterial)
            }
        }
        .navigationDestination(item: $selectedProduct, destination: { ProductDetailView(product: $0) })
        .navigationDestination(isPresented: $showReviews, destination: { ReviewsView(product: product) })
        .fullScreenCover(item: .init(
            get: { viewModel.selectedImageForFullScreen.map { ImageSource(url: $0) } },
            set: { viewModel.selectedImageForFullScreen = $0?.url }
        )) { imageSource in
            ImageFullScreenView(imageUrl: imageSource.url)
        }
        .sheet(isPresented: $viewModel.showSizeGuide) {
            SizeGuideSheet(
                isPresented: $viewModel.showSizeGuide,
                productName: product.name,
                category: product.category.name
            )
        }
        .onAppear {
            viewModel.fetchRecommendedProducts(for: product.id)
        }
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
