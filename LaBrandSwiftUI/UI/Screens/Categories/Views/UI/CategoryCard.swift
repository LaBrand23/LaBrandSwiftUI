//
//  CategoryCard.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct CategoryCard: View {
    let category: Category
    
    var body: some View {
        HStack(spacing: 8) {
            Text(category.name)
                .font(.headline)
                .foregroundColor(.primary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
            
            AsyncImageView(imageUrl: category.displayImage, placeholder: {
                Image(category.displayImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            })
            .frame(maxWidth: .infinity)
        }
        .frame(height: 100)
        .background(.white)
        .clipShape(
            RoundedRectangle(cornerRadius: 14)
        )
        .shadow(color: .gray.opacity(0.3), radius: 8)
        .contentShape(Rectangle()) // Ensures the entire card is tappable
    }
}

#Preview {
    LazyVGrid(
        columns: [
            GridItem(.flexible(), spacing: 16)
        ],
        spacing: 16
    ) {
        CategoryCard(
            category: Category(
                id: 1,
                name: "Clothes",
                parentId: nil,
                description: "All clothing items",
                slug: "clothes",
                position: 0,
                imageUrl: "cat_women_clothes"
            )
        )
        CategoryCard(
            category: Category(
                id: 2,
                name: "Shoes",
                parentId: nil,
                description: "Footwear collection",
                slug: "shoes",
                position: 1,
                imageUrl: "cat_women_shoes"
            )
        )
    }
    .padding()
}
