//
//  SearchView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct SearchView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = SearchViewModel()
    @State private var selectedProduct: Product?
    @State private var showVisualSearch = false
    @State private var hasAppeared = false
    @FocusState private var isSearchFocused: Bool
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: 0) {
            // Search Header
            searchHeader
            
            // Content
            if viewModel.searchText.isEmpty {
                emptySearchContent
            } else {
                searchResultsContent
            }
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("SEARCH")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .navigationDestination(item: $selectedProduct) { ProductDetailView(product: $0) }
        .sheet(isPresented: $showVisualSearch) {
            VisualSearchView()
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension SearchView {
    
    var searchHeader: some View {
        HStack(spacing: 12) {
            // Search Field
            HStack(spacing: 12) {
                Image(systemName: "magnifyingglass")
                    .font(.system(size: 16))
                    .foregroundStyle(AppColors.Text.muted)
                
                TextField("Search for items...", text: $viewModel.searchText)
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.Text.primary)
                    .focused($isSearchFocused)
                
                if !viewModel.searchText.isEmpty {
                    Button {
                        viewModel.searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 16))
                            .foregroundStyle(AppColors.Text.muted)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(AppColors.Background.secondary)
            .clipShape(RoundedRectangle(cornerRadius: 4))
            
            // Visual Search Button
            Button {
                showVisualSearch = true
            } label: {
                Image(systemName: "camera")
                    .font(.system(size: 16))
                    .foregroundStyle(AppColors.Text.primary)
                    .frame(width: 44, height: 44)
                    .background(AppColors.Background.secondary)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
        .background(AppColors.Background.surface)
    }
    
    var emptySearchContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 32) {
                // Recent Searches
                if !viewModel.recentSearches.isEmpty {
                    recentSearchesSection
                }
                
                // Trending Now
                trendingSection
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 20)
        }
    }
    
    var recentSearchesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("RECENT SEARCHES")
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.tertiary)
                
                Spacer()
                
                Button {
                    viewModel.clearAllRecentSearches()
                } label: {
                    Text("Clear")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(AppColors.Accent.sale)
                }
            }
            
            VStack(spacing: 0) {
                ForEach(Array(viewModel.recentSearches.enumerated()), id: \.element) { index, search in
                    HStack {
                        Button {
                            viewModel.searchText = search
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: "clock.arrow.circlepath")
                                    .font(.system(size: 14))
                                    .foregroundStyle(AppColors.Text.muted)
                                
                                Text(search)
                                    .font(.system(size: 14))
                                    .foregroundStyle(AppColors.Text.primary)
                            }
                        }
                        
                        Spacer()
                        
                        Button {
                            viewModel.removeRecentSearch(search)
                        } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundStyle(AppColors.Text.muted)
                        }
                    }
                    .padding(.vertical, 12)
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(x: hasAppeared ? 0 : -20)
                    .animation(.easeOut(duration: 0.4).delay(Double(index) * 0.05), value: hasAppeared)
                    
                    if search != viewModel.recentSearches.last {
                        Rectangle()
                            .fill(AppColors.Border.subtle)
                            .frame(height: 1)
                    }
                }
            }
        }
    }
    
    var trendingSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("TRENDING NOW")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            LazyVGrid(
                columns: [
                    GridItem(.flexible(), spacing: 16),
                    GridItem(.flexible(), spacing: 16)
                ],
                spacing: 20
            ) {
                ForEach(Array(viewModel.trendingProducts.enumerated()), id: \.element.id) { index, product in
                    ProductCard(product: product, imageSize: 160)
                        .opacity(hasAppeared ? 1 : 0)
                        .offset(y: hasAppeared ? 0 : 20)
                        .animation(
                            .easeOut(duration: 0.5).delay(0.2 + Double(index) * 0.05),
                            value: hasAppeared
                        )
                        .navigateOnTap(to: product, selection: $selectedProduct)
                }
            }
        }
    }
    
    var searchResultsContent: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 16) {
                // Results count
                Text("\(viewModel.searchResults.count) results for \"\(viewModel.searchText)\"")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.Text.tertiary)
                
                LazyVGrid(
                    columns: [
                        GridItem(.flexible(), spacing: 16),
                        GridItem(.flexible(), spacing: 16)
                    ],
                    spacing: 20
                ) {
                    ForEach(viewModel.searchResults) { product in
                        ProductCard(product: product, imageSize: 160)
                            .navigateOnTap(to: product, selection: $selectedProduct)
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
        SearchView()
    }
}
