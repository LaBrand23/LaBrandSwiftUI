//
//  TokenStorage.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

//│   ├── Persistence
//│   │   ├── LocalStorage.swift
//│   │   └── CacheManager.swift

import Foundation

final class TokenStorage {

    private let key = "secret_token_key"
    private let storageManager: StorageManagerProtocol

    init(storageManager: StorageManagerProtocol) {
        self.storageManager = storageManager
    }

    func save(token: Token) {
        storageManager.save(data: token, forKey: key)
    }

    func getToken() -> Token? {
        storageManager.get(forKey: key)
    }

    func removeToken() {
        storageManager.remove(forKey: key)
    }

    func clear() {
        storageManager.clear()
    }
}
