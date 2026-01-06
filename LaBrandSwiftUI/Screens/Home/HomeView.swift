//
//  HomeView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct HomeView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = HomeViewModel()
    @State private var selectedProduct: Product?
    @State private var showSearch = false
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Hero Banner Section
                heroBannerSection
                
                // Quick Categories - Story Style
                QuickCategoriesSection(
                    categories: viewModel.categories,
                    hasAppeared: hasAppeared,
                    onCategoryTapped: { category in
                        // TODO: - Open Category View
                    }
                )
                .padding(.top, 28)
                
                // New In Section
                NewInSectionView(
                    products: viewModel.newArrivals,
                    selectedProduct: $selectedProduct,
                    hasAppeared: hasAppeared
                )
                .padding(.top, 40)
                
                // Editorial Banner
                EditorialBannerView(
                    onExploreTapped: {
                        // Navigate to collection
                    }
                )
                .padding(.top, 48)
                .opacity(hasAppeared ? 1 : 0)
                .animation(.easeOut(duration: 0.8).delay(0.5), value: hasAppeared)
                
                // Trending Now Section
                TrendingSectionView(
                    products: viewModel.newArrivals,
                    selectedProduct: $selectedProduct
                )
                .padding(.top, 40)
                
                // Sale Section
                SaleSectionView(
                    products: viewModel.saleProducts,
                    selectedProduct: $selectedProduct,
                    onShopSaleTapped: {
                        // View all sale
                    }
                )
                .padding(.top, 40)
                .padding(.bottom, 32)
            }
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("LABRAND")
                    .font(.custom("Georgia", size: 22))
                    .fontWeight(.medium)
                    .tracking(6)
            }
            
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showSearch = true
                } label: {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 16, weight: .regular))
                        .foregroundStyle(AppColors.Text.primary)
                }
            }
        }
        .navigationDestination(item: $selectedProduct) { ProductDetailView(product: $0) }
        .refreshable {
            await viewModel.fetchData()
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Hero Banner Section
private extension HomeView {
    var heroBannerSection: some View {
        TabView {
            ForEach(viewModel.promotions) { promotion in
                PromotionBannerView(promotion: promotion)
            }
        }
        .frame(height: 480)
        .tabViewStyle(.page(indexDisplayMode: .always))
        .indexViewStyle(.page(backgroundDisplayMode: .always))
    }
}

// MARK: - Preview Helper
struct Promotion: Identifiable {
    let id: UUID
    let title: String
    let subtitle: String
    let backgroundImage: String
}

#Preview {
    NavigationStack {
        HomeView()
    }
    .withAppTheme()
}
