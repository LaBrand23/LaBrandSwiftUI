//
//  UserStorage.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 25/08/2025.
//

import SwiftUI

@MainActor
class UserStorage: ObservableObject {

    // MARK: - Properties
    @Published var client: Client?
    
    private let analyticsManager = AnalyticsManager.shared
    private let storageManager: StorageManagerProtocol
    private let key = "client_secret_key"
    
    // MARK: - Init
    init(storageManager: StorageManagerProtocol = KeychainManager.shared) {
        self.storageManager = storageManager
        
    }
    
    // MARK: - Methods

    func createClient(client: Client) {
        analyticsManager.logEvent(.userLogin, name: "ClientCreated", model: client, level: .info)
        self.client = client
        storageManager.save(data: client, forKey: key)
    }

    func getClient() -> Client? {
        analyticsManager.logEvent(.userLogin, name: "ClientRetrieved", model: client, level: .info)
        return storageManager.get(forKey: key)
    }
    
    func updateClient(client: Client) {
        analyticsManager.logEvent(.userLogin, name: "ClientUpdated", model: client, level: .info)
        self.client = client
        storageManager.update(data: client, forKey: key)
    }

    func deleteClient() {
        analyticsManager.logEvent(.userLogin, name: "ClientDeleted", model: client, level: .info)
        client = nil
        storageManager.clear()
    }
    
}
