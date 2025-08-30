////
////  HomeNetworkServiceTest.swift
////  LaBrandSwiftUI
////
////  Created by Shaxzod on 19/04/25
////
//
//import Foundation
//
//// MARK: - Home Network Service Test
//class HomeNetworkServiceTest {
//    private let homeNetworkService: HomeNetworkServiceProtocol
//    
//    init(homeNetworkService: HomeNetworkServiceProtocol = HomeNetworkService()) {
//        self.homeNetworkService = homeNetworkService
//    }
//    
//    // MARK: - Test Methods
//    
//    func testFetchQuickCategories() async {
//        print("🧪 Testing fetchQuickCategories...")
//        
//        do {
//            let categories = try await homeNetworkService.fetchQuickCategories()
//            print("✅ Quick Categories fetched successfully: \(categories.count) categories")
//            
//            for category in categories.prefix(3) {
//                print("   - \(category.name) (ID: \(category.id))")
//                print("     Subcategories: \(category.subcategories.count)")
//            }
//        } catch {
//            print("❌ Failed to fetch quick categories: \(error.localizedDescription)")
//        }
//    }
//    
//    func testFetchNewArrivals() async {
//        print("🧪 Testing fetchNewArrivals...")
//        
//        do {
//            let response = try await homeNetworkService.fetchNewArrivals(days: 7, page: 1, limit: 5)
//            print("✅ New Arrivals fetched successfully: \(response.products.count) products")
//            print("   Total count: \(response.totalCount)")
//            print("   Has more: \(response.hasMore)")
//            
//            for product in response.products.prefix(2) {
//                print("   - \(product.name) ($\(product.price))")
//            }
//        } catch {
//            print("❌ Failed to fetch new arrivals: \(error.localizedDescription)")
//        }
//    }
//    
//    func testFetchCategoryCollections() async {
//        print("🧪 Testing fetchCategoryCollections...")
//        
//        do {
//            let collections = try await homeNetworkService.fetchCategoryCollections()
//            print("✅ Category Collections fetched successfully: \(collections.count) collections")
//            
//            for collection in collections.prefix(2) {
//                print("   - \(collection.name) (\(collection.productCount) products)")
//                print("     Products: \(collection.products.count)")
//            }
//        } catch {
//            print("❌ Failed to fetch category collections: \(error.localizedDescription)")
//        }
//    }
//    
//    func testFetchTrendingProducts() async {
//        print("🧪 Testing fetchTrendingProducts...")
//        
//        do {
//            let response = try await homeNetworkService.fetchTrendingProducts(days: 7, page: 1, limit: 5)
//            print("✅ Trending Products fetched successfully: \(response.products.count) products")
//            print("   Total count: \(response.totalCount)")
//            print("   Has more: \(response.hasMore)")
//            
//            for product in response.products.prefix(2) {
//                print("   - \(product.name) ($\(product.price))")
//            }
//        } catch {
//            print("❌ Failed to fetch trending products: \(error.localizedDescription)")
//        }
//    }
//    
//    func testAllEndpoints() async {
//        print("🚀 Starting comprehensive Home Network Service test...")
//        print("=" * 50)
//        
//        await testFetchQuickCategories()
//        print()
//        
//        await testFetchNewArrivals()
//        print()
//        
//        await testFetchCategoryCollections()
//        print()
//        
//        await testFetchTrendingProducts()
//        print()
//        
//        print("=" * 50)
//        print("🏁 Home Network Service test completed!")
//    }
//}
//
//// MARK: - String Extension for Repeat
//extension String {
//    static func * (left: String, right: Int) -> String {
//        return String(repeating: left, count: right)
//    }
//}
//
//// MARK: - Usage Example
///*
// 
// // Example usage in your app:
// 
// let test = HomeNetworkServiceTest()
// 
// // Test individual endpoints
// await test.testFetchQuickCategories()
// await test.testFetchNewArrivals()
// 
// // Or test all endpoints
// await test.testAllEndpoints()
// 
// // Example integration with HomeViewModel:
// 
// @MainActor
// class HomeViewModel: ObservableObject {
//     @Published var quickCategories: [Category] = []
//     @Published var newArrivals: [Product] = []
//     @Published var isLoading = false
//     @Published var error: Error?
//     
//     private let homeNetworkService: HomeNetworkServiceProtocol
//     
//     init(homeNetworkService: HomeNetworkServiceProtocol = HomeNetworkService()) {
//         self.homeNetworkService = homeNetworkService
//     }
//     
//     func fetchData() async {
//         isLoading = true
//         error = nil
//         
//         do {
//             // Fetch data concurrently
//             async let quickCategoriesTask = homeNetworkService.fetchQuickCategories()
//             async let newArrivalsTask = homeNetworkService.fetchNewArrivals(days: 7, page: 1, limit: 10)
//             
//             let (quickCategoriesResponse, newArrivalsResponse) = try await (quickCategoriesTask, newArrivalsTask)
//             
//             // Convert to app models
//             self.quickCategories = quickCategoriesResponse.map { $0.toCategory() }
//             self.newArrivals = newArrivalsResponse.products.map { $0.toProduct() }
//             
//         } catch {
//             self.error = error
//         }
//         
//         isLoading = false
//     }
// }
// 
// */
