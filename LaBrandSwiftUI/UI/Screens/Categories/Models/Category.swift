//
//  Category.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import Foundation

struct Category: Identifiable, Codable, Hashable {
    let id: Int
    let name: String
    let parentId: Int?
    let description: String?
    let slug: String?
    let position: Int
    let imageUrl: String?
    
    // MARK: - Computed Properties
    var displayImage: String {
        return imageUrl ?? "cat_women_clothes" // Fallback to local asset
    }
    
    // MARK: - Hashable
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Category, rhs: Category) -> Bool {
        return lhs.id == rhs.id
    }
    
    // MARK: - Coding Keys
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case parentId = "parent_id"
        case description
        case slug
        case position
        case imageUrl = "image_url"
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

// MARK: - Category Products Count Model
struct CategoryProductsCount: Codable {
    let categoryId: Int
    let categoryName: String
    let directProducts: Int
    let subcategoryProducts: Int
    let totalProducts: Int
    
    enum CodingKeys: String, CodingKey {
        case categoryId = "category_id"
        case categoryName = "category_name"
        case directProducts = "direct_products"
        case subcategoryProducts = "subcategory_products"
        case totalProducts = "total_products"
    }
}

// MARK: - Mock Data
extension Category {
    static let clothes = Category(
        id: 1,
        name: "Clothes",
        parentId: nil,
        description: "All clothing items",
        slug: "clothes",
        position: 0,
        imageUrl: "cat_women_clothes"
    )

    static let shoes = Category(
        id: 2,
        name: "Shoes",
        parentId: nil,
        description: "Footwear collection",
        slug: "shoes",
        position: 1,
        imageUrl: "cat_women_shoes"
    )

    static let accessories = Category(
        id: 3,
        name: "Accessories",
        parentId: nil,
        description: "Fashion accessories",
        slug: "accessories",
        position: 2,
        imageUrl: "cat_women_new"
    )

    static let mockCategories: [Category] = [clothes, shoes, accessories]
}

