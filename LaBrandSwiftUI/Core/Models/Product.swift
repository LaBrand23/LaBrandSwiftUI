import Foundation

struct Product: Identifiable, Hashable {
    let id: UUID
    let name: String
    let description: String
    let price: Double
    let originalPrice: Decimal?
    let images: [String]
    let category: Category
    let brand: Brand
    let rating: Double
    let reviewCount: Int
    let colors: [String]
    let sizes: [String]
    let isNew: Bool
    var isFavorite: Bool
    let createdAt: Date
    let subcategory: ProductSubcategory
    
    var discountPercentage: Int? {
        guard let originalPrice = originalPrice else { return nil }
        
        let priceDouble = NSDecimalNumber(decimal: Decimal(price)).doubleValue
        let originalPriceDouble = NSDecimalNumber(decimal: originalPrice).doubleValue
        
        let discount = (1 - (priceDouble / originalPriceDouble)) * 100
        
        return Int(round(discount))
    }
    
    var tag: Tag {
        return if discountPercentage != nil {
            .sale
        } else if isNew {
            .new
        } else {
            .default
        }
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
        hasher.combine(name)
    }
}

extension Product {
    enum Tag {
        case sale
        case new
        case `default`
    }
}

// MARK: - Mock Data
extension Product {
    static let mockProducts: [Product] = [
        Product(
            id: UUID(),
            name: "Nike Air Max 270",
            description: "A stylish and comfortable sneaker with Air cushioning.",
            price: 150.00,
            originalPrice: 200.00,
            images: ["https://example.com/nike1.jpg", "https://example.com/nike2.jpg"],
            category: Category.mockCategories.first!,
            brand: Brand(id: "1", name: "Nike", category: "Sports"),
            rating: 4.8,
            reviewCount: 1200,
            colors: ["Red", "Black", "White"],
            sizes: ["7", "8", "9", "10", "11"],
            isNew: true,
            isFavorite: false,
            createdAt: .now,
            subcategory: .blouses
        ),
        Product(
            id: UUID(),
            name: "Adidas Ultraboost",
            description: "A performance running shoe with great energy return.",
            price: 180.00,
            originalPrice: 220.00,
            images: ["https://example.com/adidas1.jpg", "https://example.com/adidas2.jpg"],
            category: Category.mockCategories.first!,
            brand: Brand(id: "2", name: "Adidas", category: "Sports"),
            rating: 4.7,
            reviewCount: 950,
            colors: ["Blue", "White"],
            sizes: ["8", "9", "10", "12"],
            isNew: false,
            isFavorite: true,
            createdAt: .now,
            subcategory: .tshirts
        ),
        Product(
            id: UUID(),
            name: "Puma Running Shoes",
            description: "Lightweight and comfortable for daily runs.",
            price: 120.00,
            originalPrice: nil,  // No discount
            images: ["https://example.com/puma1.jpg"],
            category: Category.mockCategories.first!,
            brand: Brand(id: "3", name: "Puma", category: "Sports"),
            rating: 4.5,
            reviewCount: 500,
            colors: ["Green", "Black"],
            sizes: ["6", "7", "8", "9"],
            isNew: false,
            isFavorite: false,
            createdAt: .now,
            subcategory: .sweaters
        )
    ]
}

struct ProductFilter: Codable {
    var priceRange: ClosedRange<Decimal>?
    var categories: [UUID]?
    var brands: [String]?
    var colors: [String]?
    var sizes: [String]?
    var sortBy: SortOption?
    var onlyNewItems: Bool?
    var onlySaleItems: Bool?
    
    enum SortOption: String, Codable {
        case priceHighToLow
        case priceLowToHigh
        case newest
        case popular
        case rating
    }
}

struct Review: Identifiable, Codable {
    let id: UUID
    let productId: UUID
    let userId: UUID
    let rating: Int
    let comment: String
    let images: [String]?
    let date: Date
    let helpfulCount: Int
    let isVerifiedPurchase: Bool
} 
