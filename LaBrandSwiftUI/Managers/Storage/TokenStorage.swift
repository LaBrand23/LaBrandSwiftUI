//
//  TokenStorage.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation

/// Handles secure storage and retrieval of authentication tokens.
/// Uses dependency-injected storage and logs analytics events for all operations.
struct TokenStorage {
    private let key = "secret_token_key"
    private let storageManager: StorageManagerProtocol
    private let analyticsManager = AnalyticsManager.shared

    init(storageManager: StorageManagerProtocol) {
        self.storageManager = storageManager
    }

    func save(token: Token) {
        analyticsManager.logEvent(
            .featureUsage,
            name: "TokenSaved",
            parameters: ["tokenType": String(describing: type(of: token))]
        )
        storageManager.save(data: token, forKey: key)
    }

    func getToken() -> Token? {
        let token: Token? = storageManager.get(forKey: key)
        analyticsManager.logEvent(
            .featureUsage,
            name: "TokenRetrieved",
            parameters: ["tokenFound": token == nil ? "false" : "true"]
        )
        return token
    }

    func removeToken() {
        analyticsManager.logEvent(
            .featureUsage,
            name: "TokenRemoved"
        )
        storageManager.remove(forKey: key)
    }

    func clear() {
        analyticsManager.logEvent(
            .featureUsage,
            name: "TokenCleared"
        )
        storageManager.clear()
    }
}
