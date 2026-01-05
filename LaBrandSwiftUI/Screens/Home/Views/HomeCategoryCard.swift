//
//  HomeCategoryCard.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

extension HomeView {
    
    struct CategoryCard: View {
        let category: Category
        @State private var isPressed = false
        
        var body: some View {
            VStack(spacing: 12) {
                // Circular Image with elegant border
                ZStack {
                    // Outer ring with gold gradient
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color(hex: "C4A77D").opacity(0.7),
                                    Color(hex: "C4A77D").opacity(0.3)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 2
                        )
                        .frame(width: 78, height: 78)
                    
                    // Image container
                    AsyncImage(url: URL(string: category.image)) { phase in
                        switch phase {
                        case .success(let image):
                            image
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                        case .failure, .empty:
                            // Elegant fallback
                            ZStack {
                                Circle()
                                    .fill(
                                        LinearGradient(
                                            colors: [
                                                Color(hex: "F5F5F5"),
                                                Color(hex: "E8E8E8")
                                            ],
                                            startPoint: .top,
                                            endPoint: .bottom
                                        )
                                    )
                                
                                Image(category.name)
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .padding(18)
                            }
                        @unknown default:
                            Color(hex: "F5F5F5")
                        }
                    }
                    .frame(width: 70, height: 70)
                    .clipShape(Circle())
                }
                .scaleEffect(isPressed ? 0.95 : 1.0)
                .animation(.spring(response: 0.3), value: isPressed)
                
                // Category name
                Text(category.name.uppercased())
                    .font(.system(size: 11, weight: .medium))
                    .tracking(1.5)
                    .foregroundStyle(Color(hex: "333333"))
                    .multilineTextAlignment(.center)
            }
            .frame(width: 90)
            .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
                isPressed = pressing
            }, perform: {})
        }
    }
}

#Preview {
    HStack(spacing: 20) {
        HomeView.CategoryCard(
            category: Category(
                id: UUID(),
                name: "Women",
                image: "",
                parentCategoryID: nil,
                subcategories: nil
            )
        )
        
        HomeView.CategoryCard(
            category: Category(
                id: UUID(),
                name: "Men",
                image: "",
                parentCategoryID: nil,
                subcategories: nil
            )
        )
        
        HomeView.CategoryCard(
            category: Category(
                id: UUID(),
                name: "Kids",
                image: "",
                parentCategoryID: nil,
                subcategories: nil
            )
        )
    }
    .padding()
    .background(Color(hex: "FAFAFA"))
}
