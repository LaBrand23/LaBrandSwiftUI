//
//  CategoryNetworkService.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import Foundation

// MARK: - Category Network Service Protocol
protocol CategoryNetworkServiceProtocol {
    func fetchCategories(parentId: Int?) async throws -> [Category]
    func fetchCategoryDetails(id: Int) async throws -> Category
    func fetchCategoryChildren(parentId: Int) async throws -> [Category]
    func fetchCategoryProductsCount(categoryId: Int) async throws -> CategoryProductsCount
}

// MARK: - Category Network Service
class CategoryNetworkService: CategoryNetworkServiceProtocol {
    private let networkManager: NetworkManager
    
    init(networkManager: NetworkManager = NetworkManager.shared) {
        self.networkManager = networkManager
    }
    
    // MARK: - Fetch Categories
    func fetchCategories(parentId: Int? = nil) async throws -> [Category] {
        let request = CategoriesRequest(parentId: parentId)
        return try await networkManager.performAsync(request)
    }
    
    // MARK: - Fetch Category Details
    func fetchCategoryDetails(id: Int) async throws -> Category {
        let request = CategoryDetailsRequest(categoryId: id)
        return try await networkManager.performAsync(request)
    }
    
    // MARK: - Fetch Category Children
    func fetchCategoryChildren(parentId: Int) async throws -> [Category] {
        let request = CategoryChildrenRequest(parentId: parentId)
        return try await networkManager.performAsync(request)
    }
    
    // MARK: - Fetch Category Products Count
    func fetchCategoryProductsCount(categoryId: Int) async throws -> CategoryProductsCount {
        let request = CategoryProductsCountRequest(categoryId: categoryId)
        return try await networkManager.performAsync(request)
    }
}

// MARK: - API Request Models

// MARK: - Categories Request
struct CategoriesRequest: APIRequest {
    typealias Response = [Category]
    
    let parentId: Int?
    
    var path: APIEndpoint { .categories }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { false }
    var body: Encodable? { nil }
    
    var queryParameters: [String: String]? {
        guard let parentId = parentId else { return nil }
        return ["parent_id": String(parentId)]
    }
}

// MARK: - Category Details Request
struct CategoryDetailsRequest: APIRequest {
    typealias Response = Category
    
    let categoryId: Int
    
    var path: APIEndpoint { .categories }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { false }
    var body: Encodable? { nil }
    
    var customPath: String? {
        return "/categories/\(categoryId)"
    }
}

// MARK: - Category Children Request
struct CategoryChildrenRequest: APIRequest {
    typealias Response = [Category]
    
    let parentId: Int
    
    var path: APIEndpoint { .categories }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { false }
    var body: Encodable? { nil }
    
    var customPath: String? {
        return "/categories/\(parentId)/children"
    }
}

// MARK: - Category Products Count Request
struct CategoryProductsCountRequest: APIRequest {
    typealias Response = CategoryProductsCount
    
    let categoryId: Int
    
    var path: APIEndpoint { .categories }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { false }
    var body: Encodable? { nil }
    
    var customPath: String? {
        return "/categories/\(categoryId)/products-count"
    }
}
