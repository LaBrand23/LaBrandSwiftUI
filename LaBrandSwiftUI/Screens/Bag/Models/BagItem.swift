import Foundation

struct BagItem: Identifiable {
    let id: String = UUID().uuidString
    let name: String
    let image: String
    let price: Double
    var quantity: Int
    let size: String
    
    var totalPrice: Double {
        Double(quantity) * price
    }
}

// Sample data
extension BagItem {
    static let sampleItems = [
        BagItem(name: "Pullover", image: "card_men", price: 59.99, quantity: 1, size: "M"),
        BagItem(name: "T-Shirt", image: "tshirt_image", price: 29.99, quantity: 1, size: "L"),
        BagItem(name: "Sport Dress", image: "sport_dress_image", price: 45.99, quantity: 1, size: "S")
    ]
} 
