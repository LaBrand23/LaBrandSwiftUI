//
//  APIVersionHelper.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 19/04/2025.
//

import Foundation

// MARK: - API Version Helper

/// Helper class for managing API versioning and migration
public final class APIVersionHelper {
    
    // MARK: - Singleton
    static let shared = APIVersionHelper()
    
    // MARK: - Private Properties
    private let userDefaults = UserDefaults.standard
    private let apiVersionKey = "preferred_api_version"
    
    // MARK: - Initialization
    private init() {}
    
    // MARK: - Public Methods
    
    /// Get the current preferred API version for the user
    public var preferredVersion: APIVersion {
        get {
            if let versionString = userDefaults.string(forKey: apiVersionKey),
               let version = APIVersion(rawValue: versionString) {
                return version
            }
            return Config.apiVersion
        }
        set {
            userDefaults.set(newValue.rawValue, forKey: apiVersionKey)
        }
    }
    
    /// Check if a specific API version is supported
    public func isVersionSupported(_ version: APIVersion) -> Bool {
        return APIConstants.supportedVersions.contains(version)
    }
    
    /// Get the appropriate API version for a specific endpoint
    public func getVersionForEndpoint(_ endpoint: APIEndpoint) -> APIVersion {
        // You can add logic here to use different versions for different endpoints
        // For example, some endpoints might only be available in newer versions
        
        switch endpoint {
        case .register, .login, .refresh, .me, .logout:
            // Auth endpoints are available in all versions
            return preferredVersion
        }
    }
    
    /// Build a versioned URL for an endpoint
    public func buildVersionedURL(for endpoint: APIEndpoint, version: APIVersion? = nil) -> URL? {
        let targetVersion = version ?? getVersionForEndpoint(endpoint)
        let endpointPath = targetVersion.path + endpoint.rawValue
        return URL(string: endpointPath, relativeTo: URL(string: Config.baseURL))
    }
    
    /// Migrate to a new API version
    public func migrateToVersion(_ newVersion: APIVersion) -> Bool {
        guard isVersionSupported(newVersion) else {
            print("⚠️ API version \(newVersion.rawValue) is not supported")
            return false
        }
        
        // Here you could add logic to:
        // 1. Check if the new version is compatible with current data
        // 2. Perform any necessary data migration
        // 3. Update stored preferences
        
        preferredVersion = newVersion
        print("✅ Successfully migrated to API version \(newVersion.rawValue)")
        return true
    }
    
    /// Check if migration to a newer version is recommended
    public func shouldRecommendMigration() -> (recommended: Bool, targetVersion: APIVersion?) {
        let currentVersion = preferredVersion
        let latestVersion = APIConstants.supportedVersions.last ?? .v1
        
        guard currentVersion != latestVersion else {
            return (false, nil)
        }
        
        // Add your logic here to determine if migration is recommended
        // This could be based on:
        // - Server requirements
        // - New features available
        // - Security updates
        // - Performance improvements
        
        return (true, latestVersion)
    }
    
    /// Get version information for debugging
    public func getVersionInfo() -> [String: Any] {
        return [
            "current_version": preferredVersion.rawValue,
            "config_version": Config.apiVersion.rawValue,
            "supported_versions": APIConstants.supportedVersions.map { $0.rawValue },
            "base_url": Config.baseURL,
            "api_base_url": Config.apiBaseURL
        ]
    }
}

// MARK: - API Version Extensions

extension APIVersion {
    /// Get the display name for the API version
    var displayName: String {
        switch self {
        case .v1:
            return "Version 1.0"
        }
    }
    
    /// Check if this version supports a specific feature
    func supportsFeature(_ feature: APIFeature) -> Bool {
        switch (self, feature) {
        case (.v1, .basicAuth):
            return true
//        case (.v1, .socialLogin):
//            return false
//        case (.v2, .basicAuth):
//            return true
//        case (.v2, .socialLogin):
//            return true
//        case (_, .biometricAuth):
//            <#code#>
//        case (_, .pushNotifications):
//            <#code#>
//        case (_, .realTimeUpdates):
//            <#code#>
        }
    }
}

// MARK: - API Features

public enum APIFeature: String, CaseIterable {
    case basicAuth = "basic_auth"
//    case socialLogin = "social_login"
//    case biometricAuth = "biometric_auth"
//    case pushNotifications = "push_notifications"
//    case realTimeUpdates = "real_time_updates"
}
