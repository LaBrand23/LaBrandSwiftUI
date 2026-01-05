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
                VStack(alignment: .leading, spacing: 0) {
                    ForEach(category.subcategories ?? []) { subcategory in
                        NavigationLink(destination: ProductListView(category: subcategory)) {
                            HStack {
                                Text(subcategory.name)
                                    .font(.system(size: 15))
                                    .foregroundColor(AppColors.Text.primary)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(AppColors.Text.muted)
                            }
                            .padding(.vertical, 14)
                            .padding(.horizontal, 20)
                        }
                        
                        Rectangle()
                            .fill(AppColors.Border.subtle)
                            .frame(height: 1)
                            .padding(.leading, 20)
                    }
                }
            }
            
        }
        .background(AppColors.Background.primary)
        .safeAreaInset(edge: .top) {
            // View All Items Button
            viewAllNavBtn
                .padding(.top, 16)
                .padding(.horizontal, 20)
        }
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text(category.name.uppercased())
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
    }
}

// MARK: - UI, Navigations

private extension CategoryDetailView {
    
    var viewAllNavBtn: some View {
        NavigationLink(destination: ProductListView(category: category)) {
            Text("VIEW ALL ITEMS")
                .font(.system(size: 13, weight: .semibold))
                .tracking(2)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(AppColors.Button.primaryBackground)
                .foregroundColor(AppColors.Button.primaryText)
        }
    }
}


#Preview {
    NavigationStack {
        CategoryDetailView(category: Category.mockCategories.first!)
    }
    .withAppTheme()
}
