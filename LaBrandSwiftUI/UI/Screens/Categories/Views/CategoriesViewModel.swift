//
//  CategoriesViewModel.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

class CategoriesViewModel: ObservableObject {
    @Published var categories: [Category] = []
    @Published var mainCategories = [
        MainCategory(name: "Women"),
        MainCategory(name: "Men"),
        MainCategory(name: "Kids")
    ]
    @Published var selectedMainCategory: MainCategory!
    
    init() {
        selectedMainCategory = mainCategories[0]
        loadCategories()
    }
    
    private func loadCategories() {
        // Mock categories data
        categories = [
            Category(
                id: UUID(),
                name: "Clothes",
                image: "card_men",
                parentCategoryID: nil,
                subcategories: [
                    Category(id: UUID(), name: "Tops", image: "tops", parentCategoryID: nil, subcategories: nil),
                    Category(id: UUID(), name: "Dresses", image: "dresses", parentCategoryID: nil, subcategories: nil),
                    Category(id: UUID(), name: "Pants", image: "pants", parentCategoryID: nil, subcategories: nil)
                ]
            ),
            Category(
                id: UUID(),
                name: "Shoes",
                image: "cat_women_new",
                parentCategoryID: nil,
                subcategories: [
                    Category(id: UUID(), name: "Sneakers", image: "sneakers", parentCategoryID: nil, subcategories: nil),
                    Category(id: UUID(), name: "Boots", image: "boots", parentCategoryID: nil, subcategories: nil)
                ]
            ),
            Category(
                id: UUID(),
                name: "New",
                image: "cat_women_shoes",
                parentCategoryID: nil,
                subcategories: [
                    Category(id: UUID(), name: "Bags", image: "bags", parentCategoryID: nil, subcategories: nil),
                    Category(id: UUID(), name: "Jewelry", image: "jewelry", parentCategoryID: nil, subcategories: nil)
                ]
            )
        ]
    }
}
