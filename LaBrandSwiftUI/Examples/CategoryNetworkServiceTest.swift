////
////  CategoryNetworkServiceTest.swift
////  LaBrandSwiftUI
////
////  Created by Shaxzod on 19/04/25
////
//
//import Foundation
//
//// MARK: - Category Network Service Test
//class CategoryNetworkServiceTest {
//    
//    private let categoryNetworkService: CategoryNetworkServiceProtocol
//    
//    init(categoryNetworkService: CategoryNetworkServiceProtocol = CategoryNetworkService()) {
//        self.categoryNetworkService = categoryNetworkService
//    }
//    
//    // MARK: - Test Methods
//    
//    func testFetchCategories() async {
//        print("🧪 Testing fetchCategories...")
//        
//        do {
//            let categories = try await categoryNetworkService.fetchCategories(parentId: nil)
//            print("✅ Successfully fetched \(categories.count) categories")
//            
//            for category in categories {
//                print("   📁 Category: \(category.name) (ID: \(category.id))")
//                print("      Position: \(category.position)")
//                print("      Image URL: \(category.imageUrl ?? "No image")")
//                print("      Slug: \(category.slug ?? "No slug")")
//                print("      Description: \(category.description ?? "No description")")
//            }
//        } catch {
//            print("❌ Error fetching categories: \(error.localizedDescription)")
//        }
//    }
//    
//    func testFetchCategoryDetails(id: Int) async {
//        print("🧪 Testing fetchCategoryDetails for ID: \(id)...")
//        
//        do {
//            let category = try await categoryNetworkService.fetchCategoryDetails(id: id)
//            print("✅ Successfully fetched category details")
//            print("   📁 Category: \(category.name) (ID: \(category.id))")
//            print("      Parent ID: \(category.parentId ?? "No parent")")
//            print("      Position: \(category.position)")
//            print("      Image URL: \(category.imageUrl ?? "No image")")
//            print("      Slug: \(category.slug ?? "No slug")")
//            print("      Description: \(category.description ?? "No description")")
//        } catch {
//            print("❌ Error fetching category details: \(error.localizedDescription)")
//        }
//    }
//    
//    func testFetchCategoryChildren(parentId: Int) async {
//        print("🧪 Testing fetchCategoryChildren for parent ID: \(parentId)...")
//        
//        do {
//            let children = try await categoryNetworkService.fetchCategoryChildren(parentId: parentId)
//            print("✅ Successfully fetched \(children.count) child categories")
//            
//            for child in children {
//                print("   📁 Child Category: \(child.name) (ID: \(child.id))")
//                print("      Parent ID: \(child.parentId ?? "No parent")")
//                print("      Position: \(child.position)")
//                print("      Image URL: \(child.imageUrl ?? "No image")")
//            }
//        } catch {
//            print("❌ Error fetching category children: \(error.localizedDescription)")
//        }
//    }
//    
//    func testFetchCategoryProductsCount(categoryId: Int) async {
//        print("🧪 Testing fetchCategoryProductsCount for category ID: \(categoryId)...")
//        
//        do {
//            let count = try await categoryNetworkService.fetchCategoryProductsCount(categoryId: categoryId)
//            print("✅ Successfully fetched category products count")
//            print("   📊 Category: \(count.categoryName) (ID: \(count.categoryId))")
//            print("      Direct Products: \(count.directProducts)")
//            print("      Subcategory Products: \(count.subcategoryProducts)")
//            print("      Total Products: \(count.totalProducts)")
//        } catch {
//            print("❌ Error fetching category products count: \(error.localizedDescription)")
//        }
//    }
//    
//    // MARK: - Run All Tests
//    func runAllTests() async {
//        print("🚀 Starting Category Network Service Tests...")
//        print("=" * 50)
//        
//        // Test 1: Fetch all categories
//        await testFetchCategories()
//        print()
//        
//        // Test 2: Fetch category details (using first category if available)
//        // This would need to be run after categories are loaded
//        // await testFetchCategoryDetails(id: 1)
//        
//        // Test 3: Fetch category children (using first category if available)
//        // await testFetchCategoryChildren(parentId: 1)
//        
//        // Test 4: Fetch category products count
//        // await testFetchCategoryProductsCount(categoryId: 1)
//        
//        print("=" * 50)
//        print("🏁 Category Network Service Tests completed!")
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
// To run the tests, you can call:
// 
// let test = CategoryNetworkServiceTest()
// await test.runAllTests()
// 
// Or run individual tests:
// 
// await test.testFetchCategories()
// await test.testFetchCategoryDetails(id: 1)
// await test.testFetchCategoryChildren(parentId: 1)
// await test.testFetchCategoryProductsCount(categoryId: 1)
// */
