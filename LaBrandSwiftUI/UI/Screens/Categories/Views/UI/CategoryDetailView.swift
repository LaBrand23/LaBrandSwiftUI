//
//  CategoryDetailView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct CategoryDetailView: View {
    
    let category: Category
    @State private var subcategories: [Category] = []
    @State private var isLoading = false
    @State private var error: Error?
    
    private let categoryNetworkService: CategoryNetworkServiceProtocol
    
    init(category: Category, categoryNetworkService: CategoryNetworkServiceProtocol = CategoryNetworkService()) {
        self.category = category
        self.categoryNetworkService = categoryNetworkService
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                
                if isLoading {
                    ProgressView("Loading subcategories...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .padding()
                } else if let error = error {
                    VStack {
                        Text("Error loading subcategories")
                            .foregroundColor(.red)
                        Text(error.localizedDescription)
                            .font(.caption)
                            .foregroundColor(.gray)
                        Button("Retry") {
                            Task {
                                await loadSubcategories()
                            }
                        }
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(8)
                    }
                    .padding()
                } else {
                    // Subcategories List
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(subcategories) { subcategory in
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
            
        }
        .safeAreaInset(edge: .top) {
            // View All Items Button
            viewAllNavBtn
                .padding(.top)
                .padding(.horizontal)
        }
        .navigationTitle(category.name)
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            Task {
                await loadSubcategories()
            }
        }
    }
    
    // MARK: - Load Subcategories
    private func loadSubcategories() async {
        isLoading = true
        error = nil
        
        do {
            subcategories = try await categoryNetworkService.fetchCategoryChildren(parentId: category.id)
            isLoading = false
        } catch {
            self.error = error
            isLoading = false
        }
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
