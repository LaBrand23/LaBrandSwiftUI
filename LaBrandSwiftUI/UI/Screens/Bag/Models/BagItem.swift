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
                images: ["https://media-hosting.imagekit.io/f3a97739790f4304/heather-ford-5gkYsrH_ebY-unsplash.jpg?Expires=1837687387&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=R9agrybBaIZPuOjBLGqpynrAxL1sPQBN2D1TSI3wfPY~RPpCi9-mQHcqhDHdJMliBrdOd2jaFwOjf4DRuA9Lalko-7oWwq7rCZXtUy56oS1upwKT5OlrpHBiBC1fnTG8z-2A52IW4sIXOxeTDi8CH39~aCY~gSIK40v9yi6jWY2MxQ3zSwHFSz6Yt8jHmZj1TEbSHldIMlnNwa4fJSSIRRiiRotIrgtRvhbzdB--su5BdRuYyt~GzFwWM4IVega4yuGYbPe~6gQcZGGwIuCiWdwW4Sd3YV3mZQmd~5Yq4Oax6S3Dama~B92kkDEEih8V1J8QmospNye-mzxouC5vqA__"],
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
                images: ["https://media-hosting.imagekit.io/f3a97739790f4304/heather-ford-5gkYsrH_ebY-unsplash.jpg?Expires=1837687387&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=R9agrybBaIZPuOjBLGqpynrAxL1sPQBN2D1TSI3wfPY~RPpCi9-mQHcqhDHdJMliBrdOd2jaFwOjf4DRuA9Lalko-7oWwq7rCZXtUy56oS1upwKT5OlrpHBiBC1fnTG8z-2A52IW4sIXOxeTDi8CH39~aCY~gSIK40v9yi6jWY2MxQ3zSwHFSz6Yt8jHmZj1TEbSHldIMlnNwa4fJSSIRRiiRotIrgtRvhbzdB--su5BdRuYyt~GzFwWM4IVega4yuGYbPe~6gQcZGGwIuCiWdwW4Sd3YV3mZQmd~5Yq4Oax6S3Dama~B92kkDEEih8V1J8QmospNye-mzxouC5vqA__"],
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
                images: ["https://media-hosting.imagekit.io/f3a97739790f4304/heather-ford-5gkYsrH_ebY-unsplash.jpg?Expires=1837687387&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=R9agrybBaIZPuOjBLGqpynrAxL1sPQBN2D1TSI3wfPY~RPpCi9-mQHcqhDHdJMliBrdOd2jaFwOjf4DRuA9Lalko-7oWwq7rCZXtUy56oS1upwKT5OlrpHBiBC1fnTG8z-2A52IW4sIXOxeTDi8CH39~aCY~gSIK40v9yi6jWY2MxQ3zSwHFSz6Yt8jHmZj1TEbSHldIMlnNwa4fJSSIRRiiRotIrgtRvhbzdB--su5BdRuYyt~GzFwWM4IVega4yuGYbPe~6gQcZGGwIuCiWdwW4Sd3YV3mZQmd~5Yq4Oax6S3Dama~B92kkDEEih8V1J8QmospNye-mzxouC5vqA__"],
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
