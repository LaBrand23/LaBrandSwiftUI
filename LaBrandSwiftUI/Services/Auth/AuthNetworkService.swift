//
//  AuthNetworkService.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation

protocol AuthNetworkServiceProtocol {
    func register(fullName: String, email: String, password: String) async throws -> Client
    func login(email: String, password: String) async throws -> Token
    func logout(refreshToken: String) async throws
}

final class AuthNetworkService: AuthNetworkServiceProtocol {

    private let baseURL = Config.baseURL

    private let session = URLSession.shared

    private let tokenStorage = TokenStorage(storageManager: KeychainManager.shared)

    private let analyticsManager = AnalyticsManager.shared

    private let networkManager = NetworkManager.shared

    // MARK: - Methods

    func register(fullName: String, email: String, password: String) async throws -> Client {
        let createModel = ClientCreate(fullName: fullName, email: email, password: password)
        let request = RegisterRequest(model: createModel)
        let response = try await networkManager.performAsync(request)
        return response
    }

    func login(email: String, password: String) async throws -> Token {
        let loginModel: [String: String] = [
            "email": email,
            "password": password
        ]
        let request = LoginRequest(model: loginModel)
        let response = try await networkManager.performAsync(request)
        return response
    }

    func logout(refreshToken: String) async throws {
        struct LogoutRequest: APIRequest {
            typealias Response = String
            var path: APIEndpoint { .logout }
            var method: HTTPMethod { .post }
            var requiresAuth: Bool { true }
        }
        let request = LogoutRequest()
        try await networkManager.performAsync(request)
    }
    
}
