import Foundation

struct Product: Identifiable, Codable {
    let id: UUID
    let name: String
    let description: String
    let price: Decimal
    let originalPrice: Decimal?
    let images: [String]
    let category: Category
    let brand: String
    let rating: Double
    let reviewCount: Int
    let colors: [String]
    let sizes: [String]
    let isNew: Bool
    let isFavorite: Bool
    
    var discountPercentage: Int? {
        guard let originalPrice = originalPrice else { return nil }
        
        let priceDouble = NSDecimalNumber(decimal: price).doubleValue
        let originalPriceDouble = NSDecimalNumber(decimal: originalPrice).doubleValue
        
        let discount = (1 - (priceDouble / originalPriceDouble)) * 100
        
        return Int(round(discount))
    }

}

struct Category: Identifiable, Codable {
    let id: UUID
    let name: String
    let image: String
    let parentCategory: UUID?
    let subcategories: [Category]?
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
