//
//  HomeNetworkService.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import Foundation

// MARK: - Home Network Service Protocol
protocol HomeNetworkServiceProtocol {
    func fetchQuickCategories() async throws -> [QuickCategoryResponse]
    func fetchNewArrivals(days: Int?, page: Int?, limit: Int?) async throws -> NewArrivalsResponse
    func fetchCategoryCollections() async throws -> [CategoryCollectionResponse]
    func fetchTrendingProducts(days: Int?, page: Int?, limit: Int?) async throws -> TrendingProductsResponse
}

// MARK: - Home Network Service
class HomeNetworkService: HomeNetworkServiceProtocol {
    private let networkManager: NetworkManager
    
    init(networkManager: NetworkManager = NetworkManager.shared) {
        self.networkManager = networkManager
    }
    
    // MARK: - Quick Categories
    func fetchQuickCategories() async throws -> [QuickCategoryResponse] {
        let request = QuickCategoriesRequest()
        return try await networkManager.performAsync(request)
    }
    
    // MARK: - New Arrivals
    func fetchNewArrivals(days: Int? = nil, page: Int? = nil, limit: Int? = nil) async throws -> NewArrivalsResponse {
        let request = NewArrivalsRequest(days: days, page: page, limit: limit)
        return try await networkManager.performAsync(request)
    }
    
    // MARK: - Category Collections
    func fetchCategoryCollections() async throws -> [CategoryCollectionResponse] {
        let request = CategoryCollectionsRequest()
        return try await networkManager.performAsync(request)
    }
    
    // MARK: - Trending Products
    func fetchTrendingProducts(days: Int? = nil, page: Int? = nil, limit: Int? = nil) async throws -> TrendingProductsResponse {
        let request = TrendingProductsRequest(days: days, page: page, limit: limit)
        return try await networkManager.performAsync(request)
    }
}

// MARK: - API Request Models

// MARK: - Quick Categories Request
struct QuickCategoriesRequest: APIRequest {
    typealias Response = [QuickCategoryResponse]
    
    var path: APIEndpoint { .mobileQuickCategories }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { false }
    var body: Encodable? { nil }
}

// MARK: - New Arrivals Request
struct NewArrivalsRequest: APIRequest {
    typealias Response = NewArrivalsResponse
    
    let days: Int?
    let page: Int?
    let limit: Int?
    
    var path: APIEndpoint { .mobileNewArrivals }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { false }
    var body: Encodable? { nil }
    
    var queryParameters: [String: String]? {
        var params: [String: String] = [:]
        
        if let days = days {
            params["days"] = String(days)
        }
        
        if let page = page {
            params["page"] = String(page)
        }
        
        if let limit = limit {
            params["limit"] = String(limit)
        }
        
        return params.isEmpty ? nil : params
    }
}

// MARK: - Category Collections Request
struct CategoryCollectionsRequest: APIRequest {
    typealias Response = [CategoryCollectionResponse]
    
    var path: APIEndpoint { .mobileCategoryCollections }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { false }
    var body: Encodable? { nil }
}

// MARK: - Trending Products Request
struct TrendingProductsRequest: APIRequest {
    typealias Response = TrendingProductsResponse
    
    let days: Int?
    let page: Int?
    let limit: Int?
    
    var path: APIEndpoint { .mobileTrendingProducts }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { false }
    var body: Encodable? { nil }
    
    var queryParameters: [String: String]? {
        var params: [String: String] = [:]
        
        if let days = days {
            params["days"] = String(days)
        }
        
        if let page = page {
            params["page"] = String(page)
        }
        
        if let limit = limit {
            params["limit"] = String(limit)
        }
        
        return params.isEmpty ? nil : params
    }
}

// MARK: - Response Models

// MARK: - Quick Category Response
struct QuickCategoryResponse: Codable, Identifiable {
    let id: Int
    let name: String
    let imageUrl: String?
    let position: Int
    let subcategories: [QuickCategoryResponse]
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case imageUrl = "image_url"
        case position
        case subcategories
    }
}

// MARK: - Mobile Product Response
struct MobileProductResponse: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String?
    let price: Double
    let originalPrice: Double?
    let imageUrl: String?
    let categoryName: String
    let brandName: String?
    let rating: Double?
    let reviewCount: Int
    let isNew: Bool
    let stockQuantity: Int
    let createdAt: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case price
        case originalPrice = "original_price"
        case imageUrl = "image_url"
        case categoryName = "category_name"
        case brandName = "brand_name"
        case rating
        case reviewCount = "review_count"
        case isNew = "is_new"
        case stockQuantity = "stock_quantity"
        case createdAt = "created_at"
    }
}

// MARK: - New Arrivals Response
struct NewArrivalsResponse: Codable {
    let products: [MobileProductResponse]
    let totalCount: Int
    let hasMore: Bool
    
    enum CodingKeys: String, CodingKey {
        case products
        case totalCount = "total_count"
        case hasMore = "has_more"
    }
}

// MARK: - Category Collection Response
struct CategoryCollectionResponse: Codable, Identifiable {
    let id: Int
    let name: String
    let description: String?
    let imageUrl: String?
    let productCount: Int
    let products: [MobileProductResponse]
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case imageUrl = "image_url"
        case productCount = "product_count"
        case products
    }
}

// MARK: - Trending Products Response
struct TrendingProductsResponse: Codable {
    let products: [MobileProductResponse]
    let totalCount: Int
    let hasMore: Bool
    
    enum CodingKeys: String, CodingKey {
        case products
        case totalCount = "total_count"
        case hasMore = "has_more"
    }
}

// MARK: - Model Extensions for Conversion

extension MobileProductResponse {
    func toProduct() -> Product {
        let dateFormatter = ISO8601DateFormatter()
        let createdAt = dateFormatter.date(from: self.createdAt) ?? Date()
        
        return Product(
            id: UUID(uuidString: String(id)) ?? UUID(),
            name: name,
            description: description ?? "",
            price: price,
            originalPrice: originalPrice.map { Decimal($0) },
            images: imageUrl.map { [$0] } ?? [],
            category: Category(
                id: UUID(),
                name: categoryName,
                image: imageUrl ?? "",
                parentCategoryID: nil,
                subcategories: nil
            ),
            brand: Brand(
                id: String(id),
                name: brandName ?? "Unknown Brand",
                category: nil
            ),
            rating: rating ?? 0.0,
            reviewCount: reviewCount,
            colors: [],
            sizes: [],
            isNew: isNew,
            isFavorite: false,
            createdAt: createdAt,
            subcategory: .tshirts // Default subcategory, should be mapped from API
        )
    }
}

extension QuickCategoryResponse {
    func toCategory() -> Category {
        return Category(
            id: UUID(uuidString: String(id)) ?? UUID(),
            name: name,
            image: imageUrl ?? "",
            parentCategoryID: nil,
            subcategories: subcategories.map { $0.toCategory() }
        )
    }
}

extension CategoryCollectionResponse {
    func toCategoryCollection() -> CategoryCollection {
        return CategoryCollection(
            id: UUID(uuidString: String(id)) ?? UUID(),
            name: name,
            products: products.map { $0.toProduct() }
        )
    }
}