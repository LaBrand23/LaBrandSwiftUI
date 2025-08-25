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
        self.client = client
        storageManager.save(data: client, forKey: key)
        analyticsManager.logEvent(.userLogin, name: "ClientCreated", model: client, level: .info)
    }

    func getClient() -> Client? {
        let storedClient: Client? = storageManager.get(forKey: key)
        self.client = storedClient
        analyticsManager.logEvent(.userLogin, name: "ClientRetrieved", model: client, level: .info)
        return storedClient
    }
    
    func updateClient(client: Client) {
        self.client = client
        storageManager.update(data: client, forKey: key)
        analyticsManager.logEvent(.userLogin, name: "ClientUpdated", model: client, level: .info)
    }

    func deleteClient() {
        client = nil
        storageManager.clear()
        analyticsManager.logEvent(.userLogin, name: "ClientDeleted", model: client, level: .info)
    }
    
}
