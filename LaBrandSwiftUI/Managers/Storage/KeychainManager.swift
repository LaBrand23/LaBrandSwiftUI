//
//  KeychainManager.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation
import Security

/// A strongly-typed wrapper around Keychain for storing Codable objects securely.
final class KeychainManager: StorageManagerProtocol {
    
    static let shared = KeychainManager()
    private init() {}
    
    // MARK: - Save
    /// Save data to keychain
    func save<T: Codable>(data: T, forKey key: String) {
        do {
            let encodedData = try JSONEncoder().encode(data)
            
            // If key already exists → remove first
            remove(forKey: key)
            
            let query: [CFString: Any] = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrAccount: key,
                kSecValueData: encodedData,
                kSecAttrAccessible: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            ]
            
            let status = SecItemAdd(query as CFDictionary, nil)
            if status != errSecSuccess {
                print("🔒 Keychain Save Error (\(key)): \(status.description)")
            }
        } catch {
            print("🔒 Keychain Encoding Error: \(error)")
        }
    }
    
    // MARK: - Get
    /// Get data from keychain
    func get<T: Codable>(forKey key: String) -> T? {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccount: key,
            kSecReturnData: true,
            kSecMatchLimit: kSecMatchLimitOne
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data else {
            return nil
        }
        
        do {
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            print("🔒 Keychain Decoding Error: \(error)")
            return nil
        }
    }
    
    // MARK: - Update
    /// Update data in keychain
    func update<T: Codable>(data: T, forKey key: String) {
        do {
            let encodedData = try JSONEncoder().encode(data)
            
            let query: [CFString: Any] = [
                kSecClass: kSecClassGenericPassword,
                kSecAttrAccount: key
            ]
            
            let attributesToUpdate: [CFString: Any] = [
                kSecValueData: encodedData
            ]
            
            let status = SecItemUpdate(query as CFDictionary, attributesToUpdate as CFDictionary)
            
            if status == errSecItemNotFound {
                // If the key does not exist, fall back to save
                save(data: data, forKey: key)
            } else if status != errSecSuccess {
                print("🔒 Keychain Update Error (\(key)): \(status.description)")
            }
        } catch {
            print("🔒 Keychain Encoding Error: \(error)")
        }
    }
    
    
    // MARK: - Remove
    /// Remove data from keychain
    func remove(forKey key: String) {
        let query: [CFString: Any] = [
            kSecClass: kSecClassGenericPassword,
            kSecAttrAccount: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        if status != errSecSuccess && status != errSecItemNotFound {
            print("🔒 Keychain Remove Error (\(key)): \(status.description)")
        }
    }
    
    // MARK: - Clear all
    /// Clear all data from keychain
    func clear() {
        let query: [CFString: Any] = [kSecClass: kSecClassGenericPassword]
        let status = SecItemDelete(query as CFDictionary)
        
        if status != errSecSuccess && status != errSecItemNotFound {
            print("🔒 Keychain Clear Error: \(status.description)")
        }
    }
}

// MARK: - Helpers
private extension OSStatus {
    var description: String {
        if let message = SecCopyErrorMessageString(self, nil) as String? {
            return message
        }
        return "OSStatus: \(self)"
    }
}
