//
//  CategoriesAPI.swift
//  LaBrandSwiftUI
//
//  API service for categories
//

import Foundation

// MARK: - Category Model (API)
struct APICategory: Codable, Identifiable {
    let id: String
    let parentId: String?
    let name: String
    let slug: String
    let imageUrl: String?
    let gender: String?
    let position: Int
    let isActive: Bool
    let createdAt: String
    var children: [APICategory]?
}

// MARK: - Categories API
enum CategoriesAPI {
    
    /// Get category tree (all categories hierarchically)
    static func getCategoryTree() async throws -> [APICategory] {
        try await APIClient.shared.request(
            "/categories",
            method: .get,
            requiresAuth: false
        )
    }
    
    /// Get category by ID
    static func getCategory(id: String) async throws -> APICategory {
        try await APIClient.shared.request(
            "/categories/\(id)",
            method: .get,
            requiresAuth: false
        )
    }
    
    /// Get category by slug
    static func getCategoryBySlug(_ slug: String) async throws -> APICategory {
        try await APIClient.shared.request(
            "/categories/slug/\(slug)",
            method: .get,
            requiresAuth: false
        )
    }
}

