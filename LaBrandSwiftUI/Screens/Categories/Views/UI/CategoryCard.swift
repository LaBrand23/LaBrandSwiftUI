//
//  CategoryCard.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct CategoryCard: View {
    let category: Category
    @State private var isPressed = false
    
    var body: some View {
        HStack(spacing: 0) {
            // Text Content
            VStack(alignment: .leading, spacing: 6) {
                Text(category.name.uppercased())
                    .font(.custom("Georgia", size: 15))
                    .fontWeight(.medium)
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.primary)
                
                // Item count or subtitle
                Text("Shop Now")
                    .font(.system(size: 11, weight: .medium))
                    .tracking(1)
                    .foregroundStyle(AppColors.Text.muted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 20)
            
            // Image
            AsyncImage(url: URL(string: category.image)) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                case .failure, .empty:
                    // Fallback placeholder
                    ZStack {
                        LinearGradient(
                            colors: [AppColors.Background.secondary, AppColors.Border.primary],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                        
                        Image(category.image)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    }
                @unknown default:
                    AppColors.Background.secondary
                }
            }
            .frame(width: 120, height: 100)
            .clipShape(
                RoundedRectangle(cornerRadius: 4)
            )
        }
        .frame(height: 100)
        .background(AppColors.Background.surface)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(AppColors.Border.primary, lineWidth: 1)
        )
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

#Preview {
    VStack(spacing: 16) {
        CategoryCard(
            category: Category(
                id: UUID(),
                name: "Women",
                image: "cat_women_clothes",
                parentCategoryID: nil,
                subcategories: nil
            )
        )
        
        CategoryCard(
            category: Category(
                id: UUID(),
                name: "Men",
                image: "cat_women_shoes",
                parentCategoryID: nil,
                subcategories: nil
            )
        )
        
        CategoryCard(
            category: Category(
                id: UUID(),
                name: "Accessories",
                image: "cat_women_new",
                parentCategoryID: nil,
                subcategories: nil
            )
        )
    }
    .padding(.horizontal, 20)
    .background(AppColors.Background.primary)
    .withAppTheme()
}
