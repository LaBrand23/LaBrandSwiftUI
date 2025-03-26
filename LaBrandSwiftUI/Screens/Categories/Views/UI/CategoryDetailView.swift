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
                // View All Items Button
                Button {
                    // TODO: - Open Show All
//                    viewModel.showAllItems = true
                } label: {
                    Text("VIEW ALL ITEMS")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(25)
                }
                .padding(.horizontal)
                
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
                        }
                        Divider()
                    }
                }
                .padding(.horizontal)
            }
        }
        .navigationTitle(category.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    CategoryDetailView(category: Category.mockCategories.first!)
}
