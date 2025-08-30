import Foundation

import Foundation

struct Category: Identifiable, Codable, Hashable {
    let id: UUID
    let name: String
    let image: String
    let parentCategoryID: UUID?  // ✅ FIXED: Use UUID instead of Category
    let subcategories: [Category]?
    
    // MARK: - Hashable
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Category, rhs: Category) -> Bool {
        return lhs.id == rhs.id
    }
}

// MARK: - Equatable
extension Category: Equatable {
//    static func == (lhs: Category, rhs: Category) -> Bool {
//        return lhs.id == rhs.id
//    }
}

// MARK: - MainCategory
struct MainCategory: Equatable {
    let name: String
}

// MARK: - Mock Data
extension Category {
    static let clothes = Category(
        id: UUID(),
        name: "Clothes",
        image: "clothes_category",
        parentCategoryID: nil,
        subcategories: [
            Category(id: UUID(), name: "Tops", image: "tops", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Dresses", image: "dresses", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Pants", image: "pants", parentCategoryID: nil, subcategories: nil)
        ]
    )

    static let shoes = Category(
        id: UUID(),
        name: "Shoes",
        image: "shoes_category",
        parentCategoryID: nil,
        subcategories: [
            Category(id: UUID(), name: "Sneakers", image: "sneakers", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Boots", image: "boots", parentCategoryID: nil, subcategories: nil)
        ]
    )

    static let accessories = Category(
        id: UUID(),
        name: "Accessories",
        image: "accessories_category",
        parentCategoryID: nil,
        subcategories: nil
    )

    static let mockCategories: [Category] = [clothes, shoes, accessories]
}

