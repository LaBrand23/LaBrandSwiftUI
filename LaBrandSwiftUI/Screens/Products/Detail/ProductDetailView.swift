//
//  ProductDetailView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct ProductDetailView: View {
    
    // MARK: - Properties
    let product: Product
    @StateObject private var viewModel = ProductDetailViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var selectedProduct: Product?
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Product Images
                imageGallery
                
                // Product Info
                VStack(alignment: .leading, spacing: 24) {
                    // Brand & Name
                    brandAndName
                    
                    // Price & Rating
                    priceAndRating
                    
                    // Size Selection
                    sizeSelection
                    
                    // Color Selection
                    if !product.colors.isEmpty {
                        colorSelection
                    }
                    
                    // Description
                    descriptionSection
                    
                    // Reviews Link
                    reviewsLink
                    
                    // Recommended Products
                    if !viewModel.recommendedProducts.isEmpty {
                        recommendedSection
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 24)
                .padding(.bottom, 120)
            }
        }
        .background(AppColors.Background.primary)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    viewModel.toggleFavorite()
                } label: {
                    Image(systemName: product.isFavorite ? "heart.fill" : "heart")
                        .font(.system(size: 18))
                        .foregroundStyle(product.isFavorite ? AppColors.Accent.sale : AppColors.Text.primary)
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            addToCartBar
        }
        .navigationDestination(item: $selectedProduct) { ProductDetailView(product: $0) }
        .fullScreenCover(item: .init(
            get: { viewModel.selectedImageForFullScreen.map { ImageSource(url: $0) } },
            set: { viewModel.selectedImageForFullScreen = $0?.url }
        )) { imageSource in
            ImageFullScreenView(imageUrl: imageSource.url)
        }
        .onAppear {
            viewModel.fetchRecommendedProducts(for: product.id)
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension ProductDetailView {
    
    var imageGallery: some View {
        TabView {
            ForEach(product.images, id: \.self) { imageUrl in
                AsyncImageView(imageUrl: imageUrl) {
                    Rectangle()
                        .fill(AppColors.Background.secondary)
                }
                .onTapGesture {
                    viewModel.selectedImageForFullScreen = imageUrl
                }
            }
        }
        .frame(height: UIScreen.screenHeight / 2.2)
        .tabViewStyle(.page(indexDisplayMode: .automatic))
        .indexViewStyle(.page(backgroundDisplayMode: .always))
    }
    
    var brandAndName: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(product.brand.name.uppercased())
                .font(.system(size: 12, weight: .medium))
                .tracking(2)
                .foregroundStyle(AppColors.Text.muted)
            
            Text(product.name)
                .font(.custom("Georgia", size: 24))
                .fontWeight(.regular)
                .foregroundStyle(AppColors.Text.primary)
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
    }
    
    var priceAndRating: some View {
        HStack(alignment: .firstTextBaseline) {
            // Price
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text("$\(String(format: "%.0f", product.price))")
                    .font(.system(size: 22, weight: .semibold))
                    .foregroundStyle(product.originalPrice != nil ? AppColors.Accent.sale : AppColors.Text.primary)
                
                if let originalPrice = product.originalPrice {
                    Text("$\(String(format: "%.0f", Double(truncating: originalPrice as NSNumber)))")
                        .font(.system(size: 16))
                        .strikethrough()
                        .foregroundStyle(AppColors.Text.muted)
                }
            }
            
            Spacer()
            
            // Rating
            HStack(spacing: 6) {
                HStack(spacing: 2) {
                    ForEach(0..<5) { index in
                        Image(systemName: index < Int(product.rating) ? "star.fill" : "star")
                            .font(.system(size: 12))
                            .foregroundStyle(index < Int(product.rating) ? AppColors.Accent.gold : AppColors.Border.primary)
                    }
                }
                
                Text("(\(product.reviewCount))")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.Text.muted)
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
    }
    
    var sizeSelection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("SELECT SIZE")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            HStack(spacing: 10) {
                ForEach(product.sizes, id: \.self) { size in
                    SizeButton(
                        size: size,
                        isSelected: viewModel.selectedSize == size,
                        action: { viewModel.selectedSize = size }
                    )
                }
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.3), value: hasAppeared)
    }
    
    var colorSelection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("AVAILABLE COLORS")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
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
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.35), value: hasAppeared)
    }
    
    var descriptionSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("DESCRIPTION")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            Text(product.description)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.Text.secondary)
                .lineSpacing(6)
        }
        .opacity(hasAppeared ? 1 : 0)
        .animation(.easeOut(duration: 0.5).delay(0.4), value: hasAppeared)
    }
    
    var reviewsLink: some View {
        NavigationLink {
            ReviewsView(product: product)
                .environmentObject(viewModel)
        } label: {
            HStack {
                Text("REVIEWS")
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.primary)
                
                Spacer()
                
                HStack(spacing: 4) {
                    Text("See all")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(AppColors.Text.tertiary)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(AppColors.Text.muted)
                }
            }
            .padding(.vertical, 16)
            .overlay(
                Rectangle()
                    .fill(AppColors.Border.subtle)
                    .frame(height: 1),
                alignment: .bottom
            )
        }
        .opacity(hasAppeared ? 1 : 0)
        .animation(.easeOut(duration: 0.5).delay(0.45), value: hasAppeared)
    }
    
    var recommendedSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("YOU MAY ALSO LIKE")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(viewModel.recommendedProducts) { product in
                        ProductCard(product: product, imageSize: 180)
                            .navigateOnTap(to: product, selection: $selectedProduct)
                    }
                }
            }
        }
        .padding(.top, 8)
    }
    
    var addToCartBar: some View {
        HStack(spacing: 16) {
            // Price
            VStack(alignment: .leading, spacing: 2) {
                Text("TOTAL")
                    .font(.system(size: 10, weight: .medium))
                    .tracking(1)
                    .foregroundStyle(AppColors.Text.muted)
                
                Text("$\(String(format: "%.0f", product.price))")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(AppColors.Text.primary)
            }
            
            // Add to Cart Button
            Button {
                viewModel.addToCart()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "bag")
                        .font(.system(size: 14, weight: .medium))
                    Text("ADD TO BAG")
                        .font(.system(size: 14, weight: .semibold))
                        .tracking(2)
                }
                .foregroundStyle(AppColors.Button.primaryText)
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(
                    viewModel.selectedSize != nil
                    ? AppColors.Button.primaryBackground
                    : AppColors.Button.disabled
                )
            }
            .disabled(viewModel.selectedSize == nil)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(
            AppColors.Background.surface
                .shadow(color: AppColors.Shadow.light, radius: 10, y: -5)
        )
    }
}

// MARK: - Helper Extension
extension View {
    @ViewBuilder
    func applyToolbarHidden() -> some View {
        if #available(iOS 18.0, *) {
            self.toolbarVisibility(.hidden, for: .navigationBar)
        } else {
            self.toolbar(.hidden, for: .navigationBar)
        }
    }
    
    @ViewBuilder
    func applyToolbarVisible() -> some View {
        if #available(iOS 18.0, *) {
            self.toolbarVisibility(.visible, for: .navigationBar)
        } else {
            self.toolbar(.visible, for: .navigationBar)
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        ProductDetailView(product: .mockProducts.first!)
    }
}
