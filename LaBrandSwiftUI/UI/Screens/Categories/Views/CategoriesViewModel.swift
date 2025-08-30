//
//  CategoriesViewModel.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

@MainActor
class CategoriesViewModel: ObservableObject {
    @Published var categories: [Category] = []
    @Published var subcategories: [Category] = []
    @Published var mainCategories = [
        MainCategory(name: "Women"),
        MainCategory(name: "Men"),
        MainCategory(name: "Kids")
    ]
    @Published var selectedMainCategory: MainCategory!
    @Published var isLoading = false
    @Published var error: Error?
    
    private let categoryNetworkService: CategoryNetworkServiceProtocol
    
    init(categoryNetworkService: CategoryNetworkServiceProtocol = CategoryNetworkService()) {
        self.categoryNetworkService = categoryNetworkService
        selectedMainCategory = mainCategories[0]
        Task {
            await loadCategories()
        }
    }
    
    // MARK: - Load Categories
    func loadCategories() async {
        isLoading = true
        error = nil
        
        do {
            // Load top-level categories (parentId = nil)
            categories = try await categoryNetworkService.fetchCategories(parentId: nil)
            isLoading = false
        } catch {
            self.error = error
            isLoading = false
            // Fallback to mock data if API fails
            loadMockCategories()
        }
    }
    
    // MARK: - Load Subcategories
    func loadSubcategories(for categoryId: Int) async {
        isLoading = true
        error = nil
        
        do {
            subcategories = try await categoryNetworkService.fetchCategoryChildren(parentId: categoryId)
            isLoading = false
        } catch {
            self.error = error
            isLoading = false
            // Fallback to empty array if API fails
            subcategories = []
        }
    }
    
    // MARK: - Load Category Details
    func loadCategoryDetails(id: Int) async -> Category? {
        do {
            return try await categoryNetworkService.fetchCategoryDetails(id: id)
        } catch {
            self.error = error
            return nil
        }
    }
    
    // MARK: - Load Category Products Count
    func loadCategoryProductsCount(categoryId: Int) async -> CategoryProductsCount? {
        do {
            return try await categoryNetworkService.fetchCategoryProductsCount(categoryId: categoryId)
        } catch {
            self.error = error
            return nil
        }
    }
    
    // MARK: - Mock Data Fallback
    private func loadMockCategories() {
        categories = Category.mockCategories
    }
}
