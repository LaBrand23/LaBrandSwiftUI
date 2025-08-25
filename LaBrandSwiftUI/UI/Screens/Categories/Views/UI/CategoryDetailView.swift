//
//  CategoryDetailView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct CategoryDetailView: View {
    
    let category: Category
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                
                // Subcategories List
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(category.subcategories ?? []) { subcategory in
                        NavigationLink(destination: ProductListView(category: subcategory)) {
                            HStack {
                                Text(subcategory.name)
                                    .foregroundColor(.primary)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.gray)
                            }
                            .padding(.vertical, 8)
                            .padding(.horizontal)
                        }
                        Divider()
                    }
                }
            }
            
        }
        .safeAreaInset(edge: .top) {
            // View All Items Button
            viewAllNavBtn
                .padding(.top)
                .padding(.horizontal)
        }
        .navigationTitle(category.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

// MARK: - UI, Navigations

private extension CategoryDetailView {
    
    var viewAllNavBtn: some View {
        NavigationLink(destination: ProductListView(category: category)) {
            Text("VIEW ALL ITEMS")
                .fontWeight(.semibold)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .clipShape(Capsule())
        }
    }
}


#Preview {
    CategoryDetailView(category: Category.mockCategories.first!)
}
