//
//  PromotionBannerView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct HomeView: View {
    
    @StateObject private var viewModel = HomeViewModel()
    @State private var selectedProduct: Product?
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Featured Banner
                TabView {
                    ForEach(viewModel.promotions) { promotion in
                        PromotionBannerView(promotion: promotion)
                    }
                }
                .frame(height: 200)
                .tabViewStyle(.page)
                
                // Categories
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(title: "Categories")
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(viewModel.categories) { category in
                                Button {
                                    // TODO: - Open Category View
                                } label: {
                                    CategoryCard(category: category)
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                
                // New Arrivals
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(title: "New Arrivals", showViewAll: true)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 16) {
                            ForEach(viewModel.newArrivals) { product in
                                ProductCard(product: product)
                                    .navigateOnTap(to: product, selection: $selectedProduct)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                
                // Summer Sale
                VStack(alignment: .leading, spacing: 16) {
                    SectionHeader(title: "Summer Sale", showViewAll: true)
                    
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(alignment: .top, spacing: 16) {
                            ForEach(viewModel.saleProducts) { product in
                                ProductCard(product: product)
                                    .navigateOnTap(to: product, selection: $selectedProduct)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
            }
            .padding(.vertical)
        }
        .navigationTitle("LaBrand")
        .navigationDestination(item: $selectedProduct, destination: { ProductDetailView(product: $0) })
        .refreshable {
            await viewModel.fetchData()
        }
    }
}



// Preview helper
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
}
