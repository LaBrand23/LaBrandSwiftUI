import Foundation

struct BagItem: Identifiable {
    let id: String = UUID().uuidString
    let product: Product
    var quantity: Int
    let size: String
    
    var totalPrice: Double {
        Double(quantity) * product.price
    }
}

// Sample data
extension BagItem {
    static let sampleItems = [
        BagItem(
            product: Product(
                id: UUID(),
                name: "Pullover",
                description: "Comfortable and stylish pullover for everyday wear",
                price: 59.99,
                originalPrice: 79.99,
                images: ["pullover_image"],
                category: Category.mockCategories.first!,
                brand: Brand(id: "1", name: "Nike", category: "Sports"),
                rating: 4.5,
                reviewCount: 128,
                colors: ["Black", "Gray", "Navy"],
                sizes: ["S", "M", "L", "XL"],
                isNew: false,
                isFavorite: false,
                createdAt: .now,
                subcategory: .sweaters
            ),
            quantity: 1,
            size: "M"
        ),
        BagItem(
            product: Product(
                id: UUID(),
                name: "T-Shirt",
                description: "Classic cotton t-shirt with modern fit",
                price: 29.99,
                originalPrice: nil,
                images: ["tshirt_image"],
                category: Category.mockCategories.first!,
                brand: Brand(id: "2", name: "Adidas", category: "Sports"),
                rating: 4.2,
                reviewCount: 95,
                colors: ["White", "Black", "Gray"],
                sizes: ["S", "M", "L", "XL"],
                isNew: true,
                isFavorite: false,
                createdAt: .now,
                subcategory: .tshirts
            ),
            quantity: 1,
            size: "L"
        ),
        BagItem(
            product: Product(
                id: UUID(),
                name: "Sport Dress",
                description: "Lightweight and breathable sport dress",
                price: 45.99,
                originalPrice: 59.99,
                images: ["sport_dress_image"],
                category: Category.mockCategories.first!,
                brand: Brand(id: "3", name: "Puma", category: "Sports"),
                rating: 4.7,
                reviewCount: 76,
                colors: ["Black", "Pink"],
                sizes: ["XS", "S", "M", "L"],
                isNew: false,
                isFavorite: false,
                createdAt: .now,
                subcategory: .blouses
            ),
            quantity: 1,
            size: "S"
        )
    ]
} 
