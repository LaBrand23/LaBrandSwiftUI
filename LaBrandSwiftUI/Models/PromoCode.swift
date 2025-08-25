import Foundation

struct PromoCode: Identifiable, Hashable {
    let id: String = UUID().uuidString
    let code: String
    let title: String
    let description: String
    let background: String
    let discountPercentage: Int
    let daysRemaining: Int
    var isApplied: Bool = false
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: PromoCode, rhs: PromoCode) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - Mock Data
extension PromoCode {
    static let mockPromoCodes: [PromoCode] = [
        PromoCode(
            code: "mypromocode2020",
            title: "Personal offer",
            description: "10% off on your first purchase",
            background: "card_men",
            discountPercentage: 10,
            daysRemaining: 6
        ),
        PromoCode(
            code: "summer2020",
            title: "Summer Sale",
            description: "15% off on summer collection",
            background: "card_men",
            discountPercentage: 15,
            daysRemaining: 23
        ),
        PromoCode(
            code: "mypromocode2020",
            title: "Personal offer",
            description: "22% off on selected items",
            background: "card_men",
            discountPercentage: 22,
            daysRemaining: 6
        )
    ]
} 
