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
                quickCategoriesSection
                    .padding(.top, 28)
                
                // New In Section
                newInSection
                    .padding(.top, 40)
                
                // Editorial Banner
                editorialBanner
                    .padding(.top, 48)
                
                // Trending Now Section
                trendingSection
                    .padding(.top, 40)
                
                // Sale Section
                saleSection
                    .padding(.top, 40)
                    .padding(.bottom, 32)
            }
        }
        .background(Color(hex: "FAFAFA"))
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
                        .foregroundStyle(Color(hex: "1A1A1A"))
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

// MARK: - Quick Categories (Story Style)
private extension HomeView {
    var quickCategoriesSection: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("SHOP BY CATEGORY")
                .font(.custom("Georgia", size: 13))
                .fontWeight(.medium)
                .tracking(3)
                .foregroundStyle(Color(hex: "666666"))
                .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    ForEach(Array(viewModel.categories.enumerated()), id: \.element.id) { index, category in
                        Button {
                            // TODO: - Open Category View
                        } label: {
                            CategoryCard(category: category)
                                .opacity(hasAppeared ? 1 : 0)
                                .offset(y: hasAppeared ? 0 : 20)
                                .animation(
                                    .spring(response: 0.6, dampingFraction: 0.8)
                                    .delay(Double(index) * 0.1),
                                    value: hasAppeared
                                )
                        }
                        .padding(.vertical,2)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

// MARK: - New In Section
private extension HomeView {
    var newInSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            SectionHeader(title: "NEW IN", subtitle: "The latest arrivals", showViewAll: true)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(Array(viewModel.newArrivals.enumerated()), id: \.element.id) { index, product in
                        ProductCard(product: product)
                            .opacity(hasAppeared ? 1 : 0)
                            .offset(y: hasAppeared ? 0 : 30)
                            .animation(
                                .spring(response: 0.7, dampingFraction: 0.8)
                                .delay(0.3 + Double(index) * 0.08),
                                value: hasAppeared
                            )
                            .navigateOnTap(to: product, selection: $selectedProduct)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

// MARK: - Editorial Banner
private extension HomeView {
    var editorialBanner: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "1A1A1A"), Color(hex: "2D2D2D")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            HStack(spacing: 0) {
                VStack(alignment: .leading, spacing: 12) {
                    Text("THE EDIT")
                        .font(.custom("Georgia", size: 11))
                        .tracking(4)
                        .foregroundStyle(Color(hex: "C4A77D"))
                    
                    Text("Timeless\nElegance")
                        .font(.custom("Georgia", size: 32))
                        .fontWeight(.regular)
                        .foregroundStyle(.white)
                        .lineSpacing(4)
                    
                    Text("Curated pieces for the modern wardrobe")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.white.opacity(0.7))
                        .padding(.top, 4)
                    
                    Button {
                        // Navigate to collection
                    } label: {
                        Text("EXPLORE")
                            .font(.system(size: 12, weight: .semibold))
                            .tracking(2)
                            .foregroundStyle(.white)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 0)
                                    .stroke(Color.white.opacity(0.5), lineWidth: 1)
                            )
                    }
                    .padding(.top, 16)
                }
                .padding(.leading, 28)
                
                Spacer()
                
                // Decorative element
                VStack {
                    Circle()
                        .stroke(Color(hex: "C4A77D").opacity(0.3), lineWidth: 1)
                        .frame(width: 120, height: 120)
                        .overlay {
                            Circle()
                                .stroke(Color(hex: "C4A77D").opacity(0.2), lineWidth: 1)
                                .frame(width: 80, height: 80)
                        }
                }
                .padding(.trailing, 20)
            }
        }
        .frame(height: 220)
        .opacity(hasAppeared ? 1 : 0)
        .animation(.easeOut(duration: 0.8).delay(0.5), value: hasAppeared)
    }
}

// MARK: - Trending Section
private extension HomeView {
    var trendingSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            SectionHeader(title: "TRENDING NOW", subtitle: "Most popular this week", showViewAll: true)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 16) {
                    ForEach(viewModel.newArrivals.prefix(4)) { product in
                        TrendingProductCard(product: product)
                            .navigateOnTap(to: product, selection: $selectedProduct)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

// MARK: - Sale Section
private extension HomeView {
    var saleSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Sale Header with accent
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("SALE")
                        .font(.custom("Georgia", size: 24))
                        .fontWeight(.medium)
                        .tracking(4)
                        .foregroundStyle(Color(hex: "1A1A1A"))
                    
                    Text("Up to 50% off selected items")
                        .font(.system(size: 13))
                        .foregroundStyle(Color(hex: "666666"))
                }
                
                Spacer()
                
                Button {
                    // View all sale
                } label: {
                    HStack(spacing: 6) {
                        Text("Shop Sale")
                            .font(.system(size: 13, weight: .medium))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundStyle(Color(hex: "C41E3A"))
                }
            }
            .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 16) {
                    ForEach(viewModel.saleProducts) { product in
                        ProductCard(product: product)
                            .navigateOnTap(to: product, selection: $selectedProduct)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

// MARK: - Trending Product Card
private extension HomeView {
    struct TrendingProductCard: View {
        let product: Product
        @State private var isPressed = false
        
        var body: some View {
            VStack(alignment: .leading, spacing: 12) {
                ZStack(alignment: .topLeading) {
                    AsyncImageView(imageUrl: product.images.first) {
                        Image(.cardMen)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    }
                    .frame(width: 200, height: 260)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
                    
                    // Trending badge
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill")
                            .font(.system(size: 10))
                        Text("TRENDING")
                            .font(.system(size: 9, weight: .bold))
                            .tracking(1)
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(Color(hex: "1A1A1A"))
                    .padding(10)
                }
                
                VStack(alignment: .leading, spacing: 6) {
                    Text(product.brand.name.uppercased())
                        .font(.system(size: 10, weight: .medium))
                        .tracking(1.5)
                        .foregroundStyle(Color(hex: "999999"))
                    
                    Text(product.name)
                        .font(.system(size: 14))
                        .foregroundStyle(Color(hex: "1A1A1A"))
                        .lineLimit(1)
                    
                    Text("$\(String(format: "%.0f", product.price))")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Color(hex: "1A1A1A"))
                }
            }
            .frame(width: 200)
            .scaleEffect(isPressed ? 0.98 : 1.0)
            .animation(.spring(response: 0.3), value: isPressed)
            .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
                isPressed = pressing
            }, perform: {})
        }
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
}
