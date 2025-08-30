//
//  HomeViewModel.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 30/08/25
//

import SwiftUI

// MARK: - Promotion Model
struct Promotion: Identifiable {
    let id: UUID
    let title: String
    let subtitle: String
    let backgroundImage: String
}

// MARK: - Category Collection Model
struct CategoryCollection: Identifiable {
    let id: UUID
    let name: String
    let products: [Product]
}

@MainActor
class HomeViewModel: ObservableObject {
    @Published var promotions: [Promotion] = []
    @Published var quickCategories: [Category] = []
    @Published var newArrivals: [Product] = []
    @Published var backInStock: [Product] = []
    @Published var forYouProducts: [Product] = []
    @Published var categoryCollections: [CategoryCollection] = []
    @Published var trendingProducts: [Product] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    private let homeNetworkService: HomeNetworkServiceProtocol
    
    init(homeNetworkService: HomeNetworkServiceProtocol = HomeNetworkService()) {
        self.homeNetworkService = homeNetworkService
        Task {
            await fetchData()
        }
    }
    
    func fetchData() async {
        isLoading = true
        error = nil
        
        do {
            // Fetch data concurrently for better performance
            async let quickCategoriesTask = homeNetworkService.fetchQuickCategories()
            async let newArrivalsTask = homeNetworkService.fetchNewArrivals(days: 7, page: 1, limit: 10)
            async let categoryCollectionsTask = homeNetworkService.fetchCategoryCollections()
            async let trendingProductsTask = homeNetworkService.fetchTrendingProducts(days: 7, page: 1, limit: 10)
            
            // Wait for all tasks to complete
            let (quickCategoriesResponse, newArrivalsResponse, categoryCollectionsResponse, trendingProductsResponse) = try await (
                quickCategoriesTask,
                newArrivalsTask,
                categoryCollectionsTask,
                trendingProductsTask
            )
            
            // Update UI with fetched data
            self.quickCategories = quickCategoriesResponse.map { $0.toCategory() }
            self.newArrivals = newArrivalsResponse.products.map { $0.toProduct() }
            self.categoryCollections = categoryCollectionsResponse.map { $0.toCategoryCollection() }
            self.trendingProducts = trendingProductsResponse.products.map { $0.toProduct() }
            
            // Load mock data for sections not yet implemented in API
            await loadMockDataForUnimplementedSections()
            
        } catch {
            self.error = error
            // Fallback to mock data if API fails
//            await loadMockData()
        }
        
        isLoading = false
    }
    
    private func loadMockDataForUnimplementedSections() async {
        // Promotions (not yet implemented in API)
        promotions = [
            Promotion(
                id: UUID(),
                title: "Summer Collection",
                subtitle: "Up to 50% off",
                backgroundImage: "mock_image1"
            ),
            Promotion(
                id: UUID(),
                title: "New Arrivals",
                subtitle: "Check out the latest styles",
                backgroundImage: "mock_image1"
            ),
            Promotion(
                id: UUID(),
                title: "Premium Brands",
                subtitle: "Luxury fashion at your fingertips",
                backgroundImage: "mock_image1"
            )
        ]
        
//        // Back in Stock (not yet implemented in API)
//        backInStock = Array(Product.mockProducts.prefix(2))
        
//        // For You (Personalized) - not yet implemented in API
//        forYouProducts = Array(Product.mockProducts.suffix(2))
    }
    
//    private func loadMockData() async {
//        // Fallback mock data when API fails
//        promotions = [
//            Promotion(
//                id: UUID(),
//                title: "Summer Collection",
//                subtitle: "Up to 50% off",
//                backgroundImage: "mock_image1"
//            ),
//            Promotion(
//                id: UUID(),
//                title: "New Arrivals",
//                subtitle: "Check out the latest styles",
//                backgroundImage: "mock_image1"
//            ),
//            Promotion(
//                id: UUID(),
//                title: "Premium Brands",
//                subtitle: "Luxury fashion at your fingertips",
//                backgroundImage: "mock_image1"
//            )
//        ]
//        
//        quickCategories = [
//            Category(id: UUID(), name: "Clothing", image: "cat_women_clothes", parentCategoryID: nil, subcategories: nil),
//            Category(id: UUID(), name: "Jeans", image: "cat_women_new", parentCategoryID: nil, subcategories: nil),
//            Category(id: UUID(), name: "Shoes", image: "cat_women_shoes", parentCategoryID: nil, subcategories: nil),
//            Category(id: UUID(), name: "Accessories", image: "Kids", parentCategoryID: nil, subcategories: nil),
//            Category(id: UUID(), name: "Premium", image: "Men", parentCategoryID: nil, subcategories: nil)
//        ]
//        
//        newArrivals = Product.mockProducts
//        backInStock = Array(Product.mockProducts.prefix(2))
//        forYouProducts = Array(Product.mockProducts.suffix(2))
//        
//        categoryCollections = [
//            CategoryCollection(
//                id: UUID(),
//                name: "Women's Clothing",
//                products: Product.mockProducts
//            ),
//            CategoryCollection(
//                id: UUID(),
//                name: "Men's Clothing",
//                products: Product.mockProducts
//            ),
//            CategoryCollection(
//                id: UUID(),
//                name: "Shoes",
//                products: Product.mockProducts
//            ),
//            CategoryCollection(
//                id: UUID(),
//                name: "Accessories",
//                products: Product.mockProducts
//            )
//        ]
//        
//        trendingProducts = Product.mockProducts
//    }
} 
