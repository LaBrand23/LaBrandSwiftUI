//
//  StorageManager.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation

/// Protocol defining the requirements for a storage manager that handles saving, retrieving, updating, and removing Codable data.
protocol StorageManagerProtocol {
    /// Saves a Codable object to storage for the specified key.
    /// - Parameters:
    ///   - data: The Codable object to save.
    ///   - key: The key under which to store the data.
    func save<T: Codable>(data: T, forKey key: String)
    
    /// Retrieves a Codable object from storage for the specified key.
    /// - Parameter key: The key associated with the stored data.
    /// - Returns: The Codable object if found, otherwise nil.
    func get<T: Codable>(forKey key: String) -> T?
    
    /// Updates an existing Codable object in storage for the specified key.
    /// - Parameters:
    ///   - data: The updated Codable object.
    ///   - key: The key associated with the data to update.
    func update<T: Codable>(data: T, forKey key: String)
    
    /// Removes the object associated with the specified key from storage.
    /// - Parameter key: The key of the data to remove.
    func remove(forKey key: String)
    
    /// Clears all stored data.
    func clear()
}
