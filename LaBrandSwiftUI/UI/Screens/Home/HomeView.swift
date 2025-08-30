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
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("LaBrand")
        .navigationBarTitleDisplayMode(.large)
        .searchable(text: $searchText, prompt: "Search for products, brands...")
        .onChange(of: searchText) { _, newValue in
            showingSearch = true
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
        .alert("Error", isPresented: .constant(viewModel.error != nil)) {
            Button("OK") {
                viewModel.error = nil
            }
            Button("Retry") {
                Task {
                    await viewModel.fetchData()
                }
            }
        } message: {
            if let error = viewModel.error {
                Text(error.localizedDescription)
            }
        }
    }
    
    // MARK: - Banner Section
    private var bannerSection: some View {
        Group {
            if viewModel.isLoading && viewModel.promotions.isEmpty {
                // Loading placeholder
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.gray.opacity(0.1))
                    .frame(height: 220)
                    .overlay(
                        ProgressView()
                            .scaleEffect(1.2)
                    )
                    .padding(.top, 16)
            } else {
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
        }
    }
    
    // MARK: - Quick Actions Section
    private var quickActionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Quick Categories")
                .font(.headline)
                .fontWeight(.semibold)
                .dynamicTypeSize(.large ... .accessibility3)
                .padding(.horizontal, 20)
            
            if viewModel.isLoading && viewModel.quickCategories.isEmpty {
                // Loading placeholder
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 20) {
                        ForEach(0..<5, id: \.self) { _ in
                            RoundedRectangle(cornerRadius: 30)
                                .fill(Color.gray.opacity(0.1))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    ProgressView()
                                        .scaleEffect(0.8)
                                )
                        }
                    }
                    .padding(.horizontal, 20)
                }
            } else {
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
                showViewAll: true,
                isLoading: viewModel.isLoading && viewModel.newArrivals.isEmpty
            )
            
        }
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Category Collections Section
    private var categoryCollectionsSection: some View {
        VStack(spacing: 20) {
            if viewModel.isLoading && viewModel.categoryCollections.isEmpty {
                // Loading placeholder
                ForEach(0..<2, id: \.self) { _ in
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(Color.gray.opacity(0.1))
                                .frame(width: 120, height: 20)
                            Spacer()
                        }
                        .padding(.horizontal, 20)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 16) {
                                ForEach(0..<3, id: \.self) { _ in
                                    RoundedRectangle(cornerRadius: 8)
                                        .fill(Color.gray.opacity(0.1))
                                        .frame(width: 160, height: 200)
                                        .overlay(
                                            ProgressView()
                                                .scaleEffect(0.8)
                                        )
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                    }
                }
            } else {
                ForEach(viewModel.categoryCollections) { collection in
                    productCarouselSection(
                        title: collection.name,
                        subtitle: "Top picks in \(collection.name.lowercased())",
                        products: collection.products,
                        showViewAll: true,
                        isLoading: false
                    )
                }
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
            
            if viewModel.isLoading && viewModel.trendingProducts.isEmpty {
                // Loading placeholder
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 16) {
                        ForEach(0..<3, id: \.self) { _ in
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.gray.opacity(0.1))
                                .frame(width: 160, height: 200)
                                .overlay(
                                    ProgressView()
                                        .scaleEffect(0.8)
                                )
                        }
                    }
                    .padding(.horizontal, 20)
                }
            } else {
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
        }
        .padding(.vertical, 16)
        .background(Color(.systemBackground))
    }
    
    // MARK: - Helper Methods
    private func productCarouselSection(
        title: String,
        subtitle: String,
        products: [Product],
        showViewAll: Bool,
        isLoading: Bool
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
            
            if isLoading {
                // Loading placeholder
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 16) {
                        ForEach(0..<3, id: \.self) { _ in
                            RoundedRectangle(cornerRadius: 8)
                                .fill(Color.gray.opacity(0.1))
                                .frame(width: 160, height: 200)
                                .overlay(
                                    ProgressView()
                                        .scaleEffect(0.8)
                                )
                        }
                    }
                    .padding(.horizontal, 20)
                }
            } else {
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
}

// MARK: - Supporting Views

struct QuickCategoryCard: View {
    let category: Category
    
    var body: some View {
        VStack(spacing: 8) {
            AsyncImageView(imageUrl: category.image) {
                Image(systemName: "photo")
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            }
            .frame(width: 60, height: 60)
            .clipShape(Circle())
            .overlay(
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 1)
            )
            
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

// MARK: - Preview
#Preview {
    NavigationStack {
        HomeView()
    }
}
