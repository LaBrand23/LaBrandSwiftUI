//
//  ProductsAPI.swift
//  LaBrandSwiftUI
//
//  API service for products
//

import Foundation

// MARK: - Product Models (API)
struct APIProduct: Codable, Identifiable {
    let id: String
    let brandId: String
    let categoryId: String
    let name: String
    let slug: String
    let description: String?
    let price: Double
    let salePrice: Double?
    let isNew: Bool
    let isFeatured: Bool
    let isOnSale: Bool
    let stockQuantity: Int
    let ratingAverage: Double
    let ratingCount: Int
    let isActive: Bool
    let createdAt: String
    
    // Relations
    var brand: APIBrand?
    var category: APICategory?
    var variants: [APIProductVariant]?
    var images: [APIProductImage]?
    
    // Computed
    var displayPrice: Double {
        salePrice ?? price
    }
    
    var primaryImageUrl: String? {
        images?.first(where: { $0.isPrimary })?.imageUrl ?? images?.first?.imageUrl
    }
    
    var discountPercentage: Int? {
        guard let sale = salePrice, sale < price else { return nil }
        return Int(((price - sale) / price) * 100)
    }
}

struct APIProductVariant: Codable, Identifiable {
    let id: String
    let productId: String
    let size: String?
    let color: String?
    let colorHex: String?
    let stock: Int
    let sku: String?
    let priceAdjustment: Double
    let isActive: Bool
    let createdAt: String
}

struct APIProductImage: Codable, Identifiable {
    let id: String
    let productId: String
    let imageUrl: String
    let altText: String?
    let position: Int
    let isPrimary: Bool
    let createdAt: String
}

struct APIBrand: Codable, Identifiable {
    let id: String
    let name: String
    let slug: String
    let logoUrl: String?
    let description: String?
    let isActive: Bool?
    let createdAt: String?
}

// MARK: - Product Filters
struct ProductFilters {
    var categoryId: String?
    var brandId: String?
    var isNew: Bool?
    var isFeatured: Bool?
    var isOnSale: Bool?
    var minPrice: Double?
    var maxPrice: Double?
    var search: String?
    var page: Int = 1
    var limit: Int = 20
    var sortBy: String = "created_at"
    var sortOrder: String = "desc"
    
    func toQueryItems() -> [URLQueryItem] {
        var items: [URLQueryItem] = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "limit", value: "\(limit)"),
            URLQueryItem(name: "sort_by", value: sortBy),
            URLQueryItem(name: "sort_order", value: sortOrder)
        ]
        
        if let categoryId = categoryId {
            items.append(URLQueryItem(name: "category_id", value: categoryId))
        }
        if let brandId = brandId {
            items.append(URLQueryItem(name: "brand_id", value: brandId))
        }
        if let isNew = isNew, isNew {
            items.append(URLQueryItem(name: "is_new", value: "true"))
        }
        if let isFeatured = isFeatured, isFeatured {
            items.append(URLQueryItem(name: "is_featured", value: "true"))
        }
        if let isOnSale = isOnSale, isOnSale {
            items.append(URLQueryItem(name: "is_on_sale", value: "true"))
        }
        if let minPrice = minPrice {
            items.append(URLQueryItem(name: "min_price", value: "\(minPrice)"))
        }
        if let maxPrice = maxPrice {
            items.append(URLQueryItem(name: "max_price", value: "\(maxPrice)"))
        }
        if let search = search, !search.isEmpty {
            items.append(URLQueryItem(name: "search", value: search))
        }
        
        return items
    }
}

// MARK: - Products API
enum ProductsAPI {
    
    /// Get products with filters and pagination
    static func getProducts(filters: ProductFilters = ProductFilters()) async throws -> (products: [APIProduct], hasMore: Bool, total: Int) {
        let (items, pagination): ([APIProduct], PaginatedResponse<APIProduct>.Pagination?) = try await APIClient.shared.requestPaginated(
            "/products",
            method: .get,
            queryItems: filters.toQueryItems(),
            requiresAuth: false
        )
        return (items, pagination?.hasNext ?? false, pagination?.total ?? items.count)
    }
    
    /// Get product by ID
    static func getProduct(id: String) async throws -> APIProduct {
        try await APIClient.shared.request(
            "/products/\(id)",
            method: .get,
            requiresAuth: false
        )
    }
    
    /// Get new arrivals
    static func getNewArrivals(limit: Int = 10) async throws -> [APIProduct] {
        var filters = ProductFilters()
        filters.isNew = true
        filters.limit = limit
        let (products, _, _) = try await getProducts(filters: filters)
        return products
    }
    
    /// Get featured products
    static func getFeaturedProducts(limit: Int = 10) async throws -> [APIProduct] {
        var filters = ProductFilters()
        filters.isFeatured = true
        filters.limit = limit
        let (products, _, _) = try await getProducts(filters: filters)
        return products
    }
    
    /// Get sale products
    static func getSaleProducts(limit: Int = 10) async throws -> [APIProduct] {
        var filters = ProductFilters()
        filters.isOnSale = true
        filters.limit = limit
        let (products, _, _) = try await getProducts(filters: filters)
        return products
    }
    
    /// Search products
    static func searchProducts(query: String, page: Int = 1) async throws -> (products: [APIProduct], hasMore: Bool) {
        var filters = ProductFilters()
        filters.search = query
        filters.page = page
        let (products, hasMore, _) = try await getProducts(filters: filters)
        return (products, hasMore)
    }
}

