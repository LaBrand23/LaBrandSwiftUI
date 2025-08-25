//
//  HomeView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct HomeView: View {
    
    @StateObject private var viewModel = HomeViewModel()
    @State private var selectedProduct: Product?
    @State private var selectedCategory: Category?
    @State private var searchText = ""
    @State private var showingSearch = false
    @State private var selectedLocation = "Tashkent"
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 0) {
                // 1. Banner Zone (Hero Block) - Edge to edge
                bannerSection
                
                // 2. Quick Actions / Promo Shortcuts
                quickActionsSection
                
                // 3. Personalized / Dynamic Blocks
                personalizedSection
                
                // 4. Category Collections
                categoryCollectionsSection
                
                // 5. Best Sellers / Trending
                bestSellersSection
                
                // 6. Brand Highlights
                brandHighlightsSection
                
                // 7. Footer Zone
                footerSection
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("LaBrand")
        .navigationBarTitleDisplayMode(.large)
        .searchable(text: $searchText, prompt: "Search for products, brands...")
        .onChange(of: searchText) { _, newValue in
            // Handle search text changes
            if !newValue.isEmpty {
                // TODO: Implement search functionality
                // For now, we can show search results in a sheet
                showingSearch = true
            }
        }
        .sheet(isPresented: $showingSearch) {
            SearchView()
        }
        .toolbar {
            // Location selector
            ToolbarItem(placement: .navigationBarLeading) {
                Menu {
                    Button("Tashkent") { selectedLocation = "Tashkent" }
                    Button("Samarkand") { selectedLocation = "Samarkand" }
                    Button("Bukhara") { selectedLocation = "Bukhara" }
                    Divider()
                    Button("Change Location") {
                        // TODO: Show location picker
                    }
                } label: {
                    Label("Deliver to: \(selectedLocation)", systemImage: "location")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            // Action buttons
            ToolbarItemGroup(placement: .navigationBarTrailing) {
                Button {
                    // TODO: Navigate to favorites
                } label: {
                    Image(systemName: "heart")
                        .fontWeight(.medium)
                }
                .accessibilityLabel("Favorites")
                
                Button {
                    // TODO: Navigate to bag
                } label: {
                    Image(systemName: "bag")
                        .fontWeight(.medium)
                }
                .accessibilityLabel("Shopping Bag")
            }
        }
        .navigationDestination(item: $selectedProduct) { product in
            ProductDetailView(product: product)
        }
        .navigationDestination(item: $selectedCategory) { category in
            ProductListView(category: category)
        }
        .refreshable {
            await viewModel.fetchData()
        }
    }
    
    // MARK: - Banner Section
    private var bannerSection: some View {
        TabView {
            ForEach(viewModel.promotions) { promotion in
                PromotionBannerView(promotion: promotion)
                    .onTapGesture {
                        // TODO: Navigate to promotion
                    }
            }
        }
        .frame(height: 220)
        .tabViewStyle(.page)
        .indexViewStyle(.page(backgroundDisplayMode: .always))
        .padding(.top, 16)
    }
    
    // MARK: - Quick Actions Section
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quick Categories")
                .font(.headline)
                .fontWeight(.semibold)
                .dynamicTypeSize(.large ... .accessibility3)
                .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    ForEach(viewModel.quickCategories) { category in
                        QuickCategoryCard(category: category)
                            .onTapGesture {
                                selectedCategory = category
                            }
                    }
                }
                .padding(.horizontal, 20)
            }
        }
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Personalized Section
    private var personalizedSection: some View {
        VStack(spacing: 20) {
            // New Arrivals
            productCarouselSection(
                title: "New Arrivals",
                subtitle: "Fresh styles this week",
                products: viewModel.newArrivals,
                showViewAll: true
            )
            
            // Back in Stock
            if !viewModel.backInStock.isEmpty {
                productCarouselSection(
                    title: "Back in Stock",
                    subtitle: "Recently restocked",
                    products: viewModel.backInStock,
                    showViewAll: false
                )
            }
            
            // For You (Personalized)
            productCarouselSection(
                title: "For You",
                subtitle: "Based on your preferences",
                products: viewModel.forYouProducts,
                showViewAll: true
            )
        }
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Category Collections Section
    private var categoryCollectionsSection: some View {
        VStack(spacing: 20) {
            ForEach(viewModel.categoryCollections) { collection in
                productCarouselSection(
                    title: collection.name,
                    subtitle: "Top picks in \(collection.name.lowercased())",
                    products: collection.products,
                    showViewAll: true
                )
            }
        }
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Best Sellers Section
    private var bestSellersSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text("🔥 Trending Now")
                            .font(.headline)
                            .fontWeight(.semibold)
                            .dynamicTypeSize(.large ... .accessibility3)
                        Spacer()
                    }
                    Text("Most popular this week")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Button("View All") {
                    // TODO: Navigate to trending products
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
            .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(viewModel.trendingProducts) { product in
                        ProductCard(product: product)
                            .onTapGesture {
                                selectedProduct = product
                            }
                    }
                }
                .padding(.horizontal, 20)
            }
        }
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Brand Highlights Section
    private var brandHighlightsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Featured Brands")
                    .font(.headline)
                    .fontWeight(.semibold)
                    .dynamicTypeSize(.large ... .accessibility3)
                Spacer()
                Button("View All") {
                    // TODO: Navigate to brands
                }
                .font(.caption)
                .foregroundColor(.blue)
            }
            .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(viewModel.featuredBrands) { brand in
                        BrandCard(brand: brand)
                            .onTapGesture {
                                // TODO: Navigate to brand detail
                            }
                    }
                }
                .padding(.horizontal, 20)
            }
        }
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Footer Section
    private var footerSection: some View {
        VStack(spacing: 16) {
            // Promo banners
            HStack(spacing: 12) {
                PromoBannerSmall(
                    icon: "truck",
                    title: "Free Shipping",
                    subtitle: "On orders over $50"
                )
                
                PromoBannerSmall(
                    icon: "arrow.clockwise",
                    title: "Easy Returns",
                    subtitle: "14 days to return"
                )
            }
            .padding(.horizontal, 20)
            
            // Bottom spacing
            Color.clear
                .frame(height: 20)
        }
        .background(Color(.systemBackground))
    }
    
    // MARK: - Helper Methods
    private func productCarouselSection(
        title: String,
        subtitle: String,
        products: [Product],
        showViewAll: Bool
    ) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .dynamicTypeSize(.large ... .accessibility3)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if showViewAll {
                    Button("View All") {
                        // TODO: Navigate to category
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                }
            }
            .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(products) { product in
                        ProductCard(product: product)
                            .onTapGesture {
                                selectedProduct = product
                            }
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

// MARK: - Supporting Views

struct QuickCategoryCard: View {
    let category: Category
    
    var body: some View {
        VStack(spacing: 8) {
            Image(category.image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 60, height: 60)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
                .accessibilityHidden(true)
            
            Text(category.name)
                .font(.caption)
                .fontWeight(.medium)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .frame(width: 80)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(category.name) category")
        .accessibilityHint("Double tap to browse \(category.name) products")
    }
}

struct BrandCard: View {
    let brand: Brand
    
    var body: some View {
        VStack(spacing: 8) {
            // Brand logo placeholder
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.gray.opacity(0.1))
                .frame(width: 80, height: 60)
                .overlay(
                    Text(brand.name.prefix(2).uppercased())
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.gray)
                )
            
            Text(brand.name)
                .font(.caption)
                .fontWeight(.medium)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .frame(width: 80)
    }
}

struct PromoBannerSmall: View {
    let icon: String
    let title: String
    let subtitle: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption)
                    .fontWeight(.semibold)
                Text(subtitle)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(Color.blue.opacity(0.1))
        .cornerRadius(12)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        HomeView()
    }
}
