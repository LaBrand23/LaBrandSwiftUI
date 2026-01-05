//
//  FavoritesView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct FavoritesView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel: FavoritesViewModel
    @State private var selectedProduct: Product?
    @State private var hasAppeared = false
    
    init(favoritesManager: FavoritesManager) {
        _viewModel = StateObject(wrappedValue: FavoritesViewModel(favoritesManager: favoritesManager))
    }
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: 0) {
            // Category Filter
            categoryFilter
            
            // Sort Bar
            sortBar
            
            // Content
            if viewModel.filteredProducts.isEmpty {
                emptyState
            } else {
                productsGrid
            }
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("FAVORITES")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .navigationDestination(item: $selectedProduct) { product in
            ProductDetailView(product: product)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension FavoritesView {
    
    var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(viewModel.categories, id: \.self) { category in
                    Button {
                        viewModel.selectedCategory = category
                    } label: {
                        Text(category)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(
                                viewModel.selectedCategory == category
                                ? AppColors.Button.primaryText
                                : AppColors.Text.primary
                            )
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(
                                viewModel.selectedCategory == category
                                ? AppColors.Button.primaryBackground
                                : AppColors.Background.secondary
                            )
                            .clipShape(Capsule())
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
        }
        .background(AppColors.Background.surface)
    }
    
    var sortBar: some View {
        HStack {
            // Item count
            Text("\(viewModel.filteredProducts.count) items")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.Text.tertiary)
            
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
                HStack(spacing: 6) {
                    Text(viewModel.sortOption.title)
                        .font(.system(size: 13, weight: .medium))
                    Image(systemName: "chevron.down")
                        .font(.system(size: 10, weight: .semibold))
                }
                .foregroundStyle(AppColors.Text.primary)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(AppColors.Background.surface)
        .overlay(
            Rectangle()
                .fill(AppColors.Border.subtle)
                .frame(height: 1),
            alignment: .bottom
        )
    }
    
    var emptyState: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Icon
            ZStack {
                Circle()
                    .stroke(AppColors.Border.primary, lineWidth: 1)
                    .frame(width: 120, height: 120)
                
                Image(systemName: "heart")
                    .font(.system(size: 40))
                    .foregroundStyle(AppColors.Text.muted)
            }
            
            VStack(spacing: 8) {
                Text("No Favorites Yet")
                    .font(.custom("Georgia", size: 22))
                    .foregroundStyle(AppColors.Text.primary)
                
                Text("Items you love will appear here")
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.Text.tertiary)
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
    
    var productsGrid: some View {
        ScrollView(showsIndicators: false) {
            LazyVGrid(
                columns: [
                    GridItem(.flexible(), spacing: 16),
                    GridItem(.flexible(), spacing: 16)
                ],
                spacing: 24
            ) {
                ForEach(Array(viewModel.filteredProducts.enumerated()), id: \.element.id) { index, product in
                    let productState: ProductCardState = Bool.random() ? .soldOut : .defaultForFavorite
                    
                    ProductCard(product: product, state: productState)
                        .opacity(hasAppeared ? 1 : 0)
                        .offset(y: hasAppeared ? 0 : 30)
                        .animation(
                            .spring(response: 0.6, dampingFraction: 0.8)
                            .delay(Double(index) * 0.05),
                            value: hasAppeared
                        )
                        .if(productState != .soldOut) { view in
                            view.navigateOnTap(to: product, selection: $selectedProduct)
                        }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 20)
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        FavoritesView(favoritesManager: FavoritesManager())
    }
}
