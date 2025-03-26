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
            
            AsyncImage(url: URL(string: category.image)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Image(category.image)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            }
            .frame(maxWidth: .infinity)
        }
        .frame(height: 100)
        .background(.white)
        .clipShape(
            RoundedRectangle(cornerRadius: 14)
        )
        .shadow(color: .gray.opacity(0.3), radius: 8)
    }
}

#Preview {
    CategoryCard(
        category: Category(
            id: UUID(),
            name: "String",
            image: "cat_women_clothes",
            parentCategoryID: nil,
            subcategories: nil
        )
    )
    .padding(.horizontal)
}
