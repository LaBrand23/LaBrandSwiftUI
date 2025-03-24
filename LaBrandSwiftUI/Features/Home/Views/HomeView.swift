import SwiftUI

struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    
    var body: some View {
        NavigationView {
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
                            HStack(spacing: 16) {
                                ForEach(viewModel.categories) { category in
                                    CategoryCard(category: category)
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
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                    
                    // Summer Sale
                    VStack(alignment: .leading, spacing: 16) {
                        SectionHeader(title: "Summer Sale", showViewAll: true)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 16) {
                                ForEach(viewModel.saleProducts) { product in
                                    ProductCard(product: product)
                                }
                            }
                            .padding(.horizontal)
                        }
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("LaBrand")
            .refreshable {
                await viewModel.fetchData()
            }
        }
    }
}

struct SectionHeader: View {
    let title: String
    var showViewAll: Bool = false
    
    var body: some View {
        HStack {
            Text(title)
                .font(.title3)
                .fontWeight(.bold)
            
            Spacer()
            
            if showViewAll {
                Button("View All") {
                    // TODO: Navigate to category/collection view
                }
                .foregroundColor(.red)
            }
        }
        .padding(.horizontal)
    }
}

struct CategoryCard: View {
    let category: Category
    
    var body: some View {
        VStack {
            AsyncImage(url: URL(string: category.image)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Color(.systemGray6)
            }
            .frame(width: 80, height: 80)
            .clipShape(Circle())
            
            Text(category.name)
                .font(.caption)
                .multilineTextAlignment(.center)
        }
        .frame(width: 100)
    }
}

struct PromotionBannerView: View {
    let promotion: Promotion
    
    var body: some View {
        ZStack(alignment: .leading) {
            AsyncImage(url: URL(string: promotion.backgroundImage)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Color(.systemGray6)
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text(promotion.title)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text(promotion.subtitle)
                    .foregroundColor(.white)
                
                Button {
                    // TODO: Navigate to promotion details
                } label: {
                    Text("Shop Now")
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 8)
                        .background(Color.red)
                        .cornerRadius(20)
                }
            }
            .padding()
        }
        .frame(height: 200)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
    }
}

// Preview helper
struct Promotion: Identifiable {
    let id: UUID
    let title: String
    let subtitle: String
    let backgroundImage: String
} 