//
//  FavoritesAPI.swift
//  LaBrandSwiftUI
//
//  API service for favorites/wishlist
//

import Foundation

// MARK: - Favorite Model
struct APIFavorite: Codable, Identifiable {
    let id: String
    let createdAt: String
    let product: APIProduct?
}

// MARK: - Favorites API
enum FavoritesAPI {
    
    /// Get user's favorites
    static func getFavorites() async throws -> [APIFavorite] {
        try await APIClient.shared.request(
            "/favorites",
            method: .get,
            requiresAuth: true
        )
    }
    
    /// Add product to favorites
    static func addToFavorites(productId: String) async throws {
        try await APIClient.shared.requestVoid(
            "/favorites/\(productId)",
            method: .post,
            requiresAuth: true
        )
    }
    
    /// Remove product from favorites
    static func removeFromFavorites(productId: String) async throws {
        try await APIClient.shared.requestVoid(
            "/favorites/\(productId)",
            method: .delete,
            requiresAuth: true
        )
    }
    
    /// Check if product is in favorites
    static func checkFavorite(productId: String) async throws -> Bool {
        struct FavoriteCheck: Codable {
            let isFavorite: Bool
        }
        let result: FavoriteCheck = try await APIClient.shared.request(
            "/favorites/check/\(productId)",
            method: .get,
            requiresAuth: true
        )
        return result.isFavorite
    }
}

