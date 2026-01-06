//
//  QuickCategoriesSection.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct QuickCategoriesSection: View {
    let categories: [Category]
    var hasAppeared: Bool = true
    var onCategoryTapped: ((Category) -> Void)?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text("SHOP BY CATEGORY")
                .font(.custom("Georgia", size: 13))
                .fontWeight(.medium)
                .tracking(3)
                .foregroundStyle(AppColors.Text.tertiary)
                .padding(.horizontal, 20)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    ForEach(Array(categories.enumerated()), id: \.element.id) { index, category in
                        Button {
                            onCategoryTapped?(category)
                        } label: {
                            HomeView.CategoryCard(category: category)
                                .opacity(hasAppeared ? 1 : 0)
                                .offset(y: hasAppeared ? 0 : 20)
                                .animation(
                                    .spring(response: 0.6, dampingFraction: 0.8)
                                    .delay(Double(index) * 0.1),
                                    value: hasAppeared
                                )
                        }
                        .padding(.vertical, 2)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

#Preview("Light Mode") {
    QuickCategoriesSection(
        categories: [
            Category(id: UUID(), name: "Women", image: "", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Men", image: "", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Kids", image: "", parentCategoryID: nil, subcategories: nil)
        ]
    )
    .padding(.vertical)
    .background(AppColors.Background.primary)
    .withAppTheme()
}

#Preview("Dark Mode") {
    QuickCategoriesSection(
        categories: [
            Category(id: UUID(), name: "Women", image: "", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Men", image: "", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Kids", image: "", parentCategoryID: nil, subcategories: nil)
        ]
    )
    .padding(.vertical)
    .background(AppColors.Background.primary)
    .preferredColorScheme(.dark)
    .withAppTheme()
}

