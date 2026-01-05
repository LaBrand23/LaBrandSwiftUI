//
//  ProductListView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct ProductListView: View {
    
    // MARK: - Properties
    let category: Category
    @StateObject private var viewModel = ProductListViewModel()
    @State private var showFilters = false
    @State private var selectedProduct: Product?
    @State private var selectedSubcategory: ProductSubcategory? = nil
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: 0) {
            // Subcategory Tags
            subcategoryTags
            
            // Filter Bar
            filterBar
            
            // Products Content
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    // Active Filters
                    if !viewModel.activeFilters.isEmpty {
                        activeFiltersView
                    }
                    
                    // Products Grid
                    LazyVGrid(
                        columns: [
                            GridItem(.flexible(), spacing: 16),
                            GridItem(.flexible(), spacing: 16)
                        ],
                        spacing: 24
                    ) {
                        ForEach(Array(viewModel.filteredProducts.enumerated()), id: \.element.id) { index, product in
                            ProductCard(product: product)
                                .opacity(hasAppeared ? 1 : 0)
                                .offset(y: hasAppeared ? 0 : 30)
                                .animation(
                                    .spring(response: 0.6, dampingFraction: 0.8)
                                    .delay(Double(index) * 0.05),
                                    value: hasAppeared
                                )
                                .navigateOnTap(to: product, selection: $selectedProduct)
                        }
                    }
                    .padding(.horizontal, 20)
                }
                .padding(.vertical, 20)
            }
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text(category.name.uppercased())
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(3)
            }
            
            ToolbarItem(placement: .navigationBarTrailing) {
                NavigationLink(destination: SearchView()) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 16))
                        .foregroundStyle(AppColors.Text.primary)
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
            .onDisappear {
                viewModel.loadProducts(for: category)
            }
        }
        .navigationDestination(for: $selectedProduct) { product in
            ProductDetailView(product: product)
        }
        .onAppear {
            viewModel.loadProducts(for: category)
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension ProductListView {
    
    var subcategoryTags: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                // Show All
                subcategoryTag(title: "All", isSelected: selectedSubcategory == nil) {
                    selectedSubcategory = nil
                    viewModel.showAllProducts()
                }
                
                // Categories
                ForEach(ProductSubcategory.allCases) { subcategory in
                    subcategoryTag(
                        title: subcategory.rawValue,
                        isSelected: selectedSubcategory == subcategory
                    ) {
                        selectedSubcategory = subcategory
                        viewModel.filterBySubcategory(subcategory)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
        }
        .background(AppColors.Background.surface)
    }
    
    func subcategoryTag(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(isSelected ? .white : AppColors.Text.primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? AppColors.Button.primaryBackground : AppColors.Background.secondary)
                .clipShape(Capsule())
        }
    }
    
    var filterBar: some View {
        HStack(spacing: 12) {
            // Filter Button
            Button {
                showFilters = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "slider.horizontal.3")
                        .font(.system(size: 14))
                    Text("Filters")
                        .font(.system(size: 13, weight: .medium))
                }
                .foregroundStyle(AppColors.Text.primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(AppColors.Background.secondary)
                .clipShape(Capsule())
            }
            
            Spacer()
            
            // Sort Menu
            Menu {
                Button("Popular") { viewModel.sortOption = .popular }
                Button("Newest") { viewModel.sortOption = .newest }
                Button("Rating") { viewModel.sortOption = .customerReview }
                Button("Price: Low to High") { viewModel.sortOption = .priceLowToHigh }
                Button("Price: High to Low") { viewModel.sortOption = .priceHighToLow }
            } label: {
                HStack(spacing: 6) {
                    Text(viewModel.sortOption.displayText)
                        .font(.system(size: 13, weight: .medium))
                    Image(systemName: "chevron.down")
                        .font(.system(size: 10, weight: .semibold))
                }
                .foregroundStyle(AppColors.Text.primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
                .background(AppColors.Background.secondary)
                .clipShape(Capsule())
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
    
    var activeFiltersView: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(Array(viewModel.activeFilters), id: \.self) { filter in
                    HStack(spacing: 6) {
                        Text(filter)
                            .font(.system(size: 12))
                            .foregroundStyle(AppColors.Text.primary)
                        
                        Button {
                            viewModel.removeFilter(filter)
                        } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 10, weight: .medium))
                                .foregroundStyle(AppColors.Text.tertiary)
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(AppColors.Background.secondary)
                    .clipShape(Capsule())
                }
                
                // Clear all
                if viewModel.activeFilters.count > 1 {
                    Button {
                        viewModel.clearAllFilters()
                    } label: {
                        Text("Clear All")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(AppColors.Accent.sale)
                    }
                }
            }
            .padding(.horizontal, 20)
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        ProductListView(category: .mockCategories.first!)
    }
}
