import SwiftUI

// MARK: - Promotion Model
struct Promotion: Identifiable {
    let id: UUID
    let title: String
    let subtitle: String
    let backgroundImage: String
}

// MARK: - Category Collection Model
struct CategoryCollection: Identifiable {
    let id: UUID
    let name: String
    let products: [Product]
}

@MainActor
class HomeViewModel: ObservableObject {
    @Published var promotions: [Promotion] = []
    @Published var quickCategories: [Category] = []
    @Published var newArrivals: [Product] = []
    @Published var backInStock: [Product] = []
    @Published var forYouProducts: [Product] = []
    @Published var categoryCollections: [CategoryCollection] = []
    @Published var trendingProducts: [Product] = []
    @Published var featuredBrands: [Brand] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    init() {
        Task {
            await fetchData()
        }
    }
    
    func fetchData() async {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Replace with actual API calls
        // For now, using mock data
        await loadMockData()
    }
    
    private func loadMockData() async {
        // Promotions
        promotions = [
            Promotion(
                id: UUID(),
                title: "Summer Collection",
                subtitle: "Up to 50% off",
                backgroundImage: "mock_image1"
            ),
            Promotion(
                id: UUID(),
                title: "New Arrivals",
                subtitle: "Check out the latest styles",
                backgroundImage: "mock_image1"
            ),
            Promotion(
                id: UUID(),
                title: "Premium Brands",
                subtitle: "Luxury fashion at your fingertips",
                backgroundImage: "mock_image1"
            )
        ]
        
        // Quick Categories
        quickCategories = [
            Category(id: UUID(), name: "Clothing", image: "cat_women_clothes", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Jeans", image: "cat_women_new", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Shoes", image: "cat_women_shoes", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Accessories", image: "Kids", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Premium", image: "Men", parentCategoryID: nil, subcategories: nil)
        ]
        
        // New Arrivals
        newArrivals = Product.mockProducts
        
        // Back in Stock
        backInStock = Array(Product.mockProducts.prefix(2))
        
        // For You (Personalized)
        forYouProducts = Array(Product.mockProducts.suffix(2))
        
        // Category Collections
        categoryCollections = [
            CategoryCollection(
                id: UUID(),
                name: "Women's Clothing",
                products: Product.mockProducts
            ),
            CategoryCollection(
                id: UUID(),
                name: "Men's Clothing",
                products: Product.mockProducts
            ),
            CategoryCollection(
                id: UUID(),
                name: "Shoes",
                products: Product.mockProducts
            ),
            CategoryCollection(
                id: UUID(),
                name: "Accessories",
                products: Product.mockProducts
            )
        ]
        
        // Trending Products
        trendingProducts = Product.mockProducts
        
        // Featured Brands
        featuredBrands = [
            Brand(id: "1", name: "Nike", category: "Sports"),
            Brand(id: "2", name: "Adidas", category: "Sports"),
            Brand(id: "3", name: "Puma", category: "Sports"),
            Brand(id: "4", name: "Champion", category: "Sports"),
            Brand(id: "5", name: "Diesel", category: "Denim"),
            Brand(id: "6", name: "Jack & Jones", category: "Casual")
        ]
    }
} 
