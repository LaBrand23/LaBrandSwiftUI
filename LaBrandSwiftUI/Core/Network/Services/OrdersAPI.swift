//
//  OrdersAPI.swift
//  LaBrandSwiftUI
//
//  API service for orders
//

import Foundation

// MARK: - Order Models
struct APIOrder: Codable, Identifiable {
    let id: String
    let userId: String
    let brandId: String?
    let orderNumber: String
    let status: String
    let subtotal: Double
    let shippingFee: Double
    let discount: Double
    let total: Double
    let shippingAddress: ShippingAddress
    let promoCode: String?
    let notes: String?
    let estimatedDelivery: String?
    let deliveredAt: String?
    let createdAt: String
    let updatedAt: String?
    
    var items: [APIOrderItem]?
    
    struct ShippingAddress: Codable {
        let fullName: String
        let phone: String
        let street: String
        let city: String
        let state: String?
        let postalCode: String
        let country: String
    }
}

struct APIOrderItem: Codable, Identifiable {
    let id: String
    let orderId: String
    let productId: String
    let variantId: String?
    let productName: String
    let variantInfo: VariantInfo?
    let quantity: Int
    let unitPrice: Double
    let totalPrice: Double
    let createdAt: String
    
    struct VariantInfo: Codable {
        let size: String?
        let color: String?
    }
}

// MARK: - Create Order Input
struct CreateOrderInput: Encodable {
    let items: [OrderItemInput]
    let shippingAddress: ShippingAddressInput
    let promoCode: String?
    let notes: String?
    
    struct OrderItemInput: Encodable {
        let productId: String
        let variantId: String?
        let quantity: Int
    }
    
    struct ShippingAddressInput: Encodable {
        let fullName: String
        let phone: String
        let street: String
        let city: String
        let state: String?
        let postalCode: String
        let country: String
    }
}

// MARK: - Orders API
// Note: OrderStatus enum is defined in ProfileModels.swift
enum OrdersAPI {
    
    /// Get user's orders
    static func getOrders(page: Int = 1, status: String? = nil) async throws -> (orders: [APIOrder], hasMore: Bool) {
        var queryItems = [
            URLQueryItem(name: "page", value: "\(page)"),
            URLQueryItem(name: "limit", value: "20")
        ]
        
        if let status = status {
            queryItems.append(URLQueryItem(name: "status", value: status))
        }
        
        let (items, pagination): ([APIOrder], PaginatedResponse<APIOrder>.Pagination?) = try await APIClient.shared.requestPaginated(
            "/orders",
            method: .get,
            queryItems: queryItems,
            requiresAuth: true
        )
        
        return (items, pagination?.hasNext ?? false)
    }
    
    /// Get order by ID
    static func getOrder(id: String) async throws -> APIOrder {
        try await APIClient.shared.request(
            "/orders/\(id)",
            method: .get,
            requiresAuth: true
        )
    }
    
    /// Create a new order
    static func createOrder(input: CreateOrderInput) async throws -> APIOrder {
        try await APIClient.shared.request(
            "/orders",
            method: .post,
            body: input,
            requiresAuth: true
        )
    }
    
    /// Cancel an order
    static func cancelOrder(id: String) async throws -> APIOrder {
        try await APIClient.shared.request(
            "/orders/\(id)/cancel",
            method: .post,
            requiresAuth: true
        )
    }
}

