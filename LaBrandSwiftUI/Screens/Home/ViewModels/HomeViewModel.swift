import SwiftUI

@MainActor
class HomeViewModel: ObservableObject {
    @Published var promotions: [Promotion] = []
    @Published var categories: [Category] = []
    @Published var newArrivals: [Product] = []
    @Published var saleProducts: [Product] = []
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
            )
        ]
        
        categories = [
            Category(id: UUID(), name: "Women", image: "women_cat", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Men", image: "men_cat", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Kids", image: "kids_cat", parentCategoryID: nil, subcategories: nil),
        ]
        
        newArrivals = [
            Product(
                id: UUID(),
                name: "Summer Floral Dress",
                description: "Beautiful floral print dress perfect for summer",
                price: 79.99,
                originalPrice: nil,
                images: ["card_women"],
                category: categories[0],
                brand: "LaBrand",
                rating: 4.8,
                reviewCount: 24,
                colors: ["Blue", "Pink"],
                sizes: ["XS", "S", "M", "L"],
                isNew: true,
                isFavorite: false,
                createdAt: .now
            ),
            Product(
                id: UUID(),
                name: "Classic Denim Jacket",
                description: "Timeless denim jacket for any occasion",
                price: 89.99,
                originalPrice: nil,
                images: ["card_men"],
                category: categories[1],
                brand: "LaBrand",
                rating: 4.6,
                reviewCount: 42,
                colors: ["Blue", "Black"],
                sizes: ["S", "M", "L", "XL"],
                isNew: true,
                isFavorite: false,
                createdAt: .now
            )
        ]
        
        saleProducts = [
            Product(
                id: UUID(),
                name: "Striped T-Shirt",
                description: "Classic striped t-shirt",
                price: 24.99,
                originalPrice: 39.99,
                images: ["card_men"],
                category: categories[0],
                brand: "LaBrand",
                rating: 4.5,
                reviewCount: 86,
                colors: ["White", "Navy"],
                sizes: ["XS", "S", "M", "L", "XL"],
                isNew: false,
                isFavorite: false,
                createdAt: .now
            ),
            Product(
                id: UUID(),
                name: "Leather Crossbody Bag",
                description: "Elegant leather crossbody bag",
                price: 79.99,
                originalPrice: 129.99,
                images: ["card_women"],
                category: categories[2],
                brand: "LaBrand",
                rating: 4.7,
                reviewCount: 153,
                colors: ["Black", "Brown", "Tan"],
                sizes: ["One Size"],
                isNew: false,
                isFavorite: false,
                createdAt: .now
            )
        ]
    }
} 
