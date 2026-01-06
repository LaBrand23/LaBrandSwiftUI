//
//  UserAPI.swift
//  LaBrandSwiftUI
//
//  API service for user profile
//

import Foundation

// MARK: - User Models
struct APIUser: Codable, Identifiable {
    let id: String
    let firebaseUid: String
    let email: String?
    let phone: String?
    let fullName: String?
    let avatarUrl: String?
    let role: String
    let brandId: String?
    let addresses: [APIAddress]
    let isActive: Bool
    let createdAt: String
    let updatedAt: String?
}

struct APIAddress: Codable, Identifiable {
    var id: String?
    let label: String
    let fullName: String
    let phone: String
    let street: String
    let city: String
    let state: String?
    let postalCode: String
    let country: String
    var isDefault: Bool?
}

// MARK: - Update Profile Input
struct UpdateProfileInput: Encodable {
    let fullName: String?
    let phone: String?
    let avatarUrl: String?
}

// MARK: - User API
enum UserAPI {
    
    /// Get current user profile
    static func getProfile() async throws -> APIUser {
        try await APIClient.shared.request(
            "/users/me",
            method: .get,
            requiresAuth: true
        )
    }
    
    /// Update current user profile
    static func updateProfile(input: UpdateProfileInput) async throws -> APIUser {
        try await APIClient.shared.request(
            "/users/me",
            method: .put,
            body: input,
            requiresAuth: true
        )
    }
    
    /// Add address
    static func addAddress(_ address: APIAddress) async throws -> APIUser {
        try await APIClient.shared.request(
            "/users/me/addresses",
            method: .post,
            body: address,
            requiresAuth: true
        )
    }
    
    /// Update address
    static func updateAddress(id: String, address: APIAddress) async throws -> APIUser {
        try await APIClient.shared.request(
            "/users/me/addresses/\(id)",
            method: .put,
            body: address,
            requiresAuth: true
        )
    }
    
    /// Delete address
    static func deleteAddress(id: String) async throws -> APIUser {
        try await APIClient.shared.request(
            "/users/me/addresses/\(id)",
            method: .delete,
            requiresAuth: true
        )
    }
}

