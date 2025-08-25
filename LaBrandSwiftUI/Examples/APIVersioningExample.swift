////
////  APIVersioningExample.swift
////  LaBrandSwiftUI
////
////  Created by Shakzod on 19/04/2025.
////
//
//import Foundation
//import Combine
//
//// MARK: - API Versioning Example
//
///// Example demonstrating how to use the new API versioning system
//class APIVersioningExample {
//    
//    // MARK: - Properties
//    private let networkManager = NetworkManager.shared
//    private let versionHelper = APIVersionHelper.shared
//    private var cancellables = Set<AnyCancellable>()
//    
//    // MARK: - Example Methods
//    
//    /// Example: Basic API call with current version
//    func exampleBasicAPICall() {
//        print("🔗 Example: Basic API call with current version")
//        print("Current API Version: \(Config.apiVersion.rawValue)")
//        print("API Base URL: \(Config.apiBaseURL)")
//        
//        // The NetworkManager automatically uses the configured API version
//        // No changes needed to existing code!
//    }
//    
//    /// Example: Check API version information
//    func exampleCheckVersionInfo() {
//        print("\n📊 Example: Check API version information")
//        
//        let versionInfo = versionHelper.getVersionInfo()
//        for (key, value) in versionInfo {
//            print("  \(key): \(value)")
//        }
//    }
//    
//    /// Example: Check feature support
//    func exampleCheckFeatureSupport() {
//        print("\n✨ Example: Check feature support")
//        
//        let currentVersion = Config.apiVersion
//        let features: [APIFeature] = [.basicAuth, .socialLogin, .biometricAuth]
//        
//        for feature in features {
//            let isSupported = currentVersion.supportsFeature(feature)
//            print("  \(feature.rawValue): \(isSupported ? "✅" : "❌")")
//        }
//    }
//    
//    /// Example: Migrate to a different API version
//    func exampleMigrateToVersion() {
//        print("\n🔄 Example: Migrate to a different API version")
//        
//        let currentVersion = versionHelper.preferredVersion
//        let targetVersion: APIVersion = currentVersion == .v1 ? .v2 : .v1
//        
//        print("Current version: \(currentVersion.rawValue)")
//        print("Target version: \(targetVersion.rawValue)")
//        
//        let success = versionHelper.migrateToVersion(targetVersion)
//        print("Migration result: \(success ? "Success" : "Failed")")
//        
//        // Reset to original version for demo
//        versionHelper.migrateToVersion(currentVersion)
//    }
//    
//    /// Example: Build versioned URLs
//    func exampleBuildVersionedURLs() {
//        print("\n🌐 Example: Build versioned URLs")
//        
//        let endpoints: [APIEndpoint] = [.register, .login, .me]
//        
//        for endpoint in endpoints {
//            if let url = versionHelper.buildVersionedURL(for: endpoint) {
//                print("  \(endpoint.rawValue): \(url)")
//            }
//        }
//    }
//    
//    /// Example: Check migration recommendations
//    func exampleCheckMigrationRecommendations() {
//        print("\n💡 Example: Check migration recommendations")
//        
//        let (recommended, targetVersion) = versionHelper.shouldRecommendMigration()
//        
//        if recommended, let target = targetVersion {
//            print("  Migration recommended to: \(target.rawValue)")
//            print("  Target version display name: \(target.displayName)")
//        } else {
//            print("  No migration recommended")
//        }
//    }
//    
//    /// Example: Use different versions for different endpoints
//    func exampleUseDifferentVersions() {
//        print("\n🎯 Example: Use different versions for different endpoints")
//        
//        // You can specify different versions for different endpoints
//        let v1URL = versionHelper.buildVersionedURL(for: .login, version: .v1)
////        let v2URL = versionHelper.buildVersionedURL(for: .login, version: .v2)
//        
//        print("  V1 Login URL: \(v1URL?.absoluteString ?? "Invalid")")
////        print("  V2 Login URL: \(v2URL?.absoluteString ?? "Invalid")")
//    }
//    
//    /// Example: Environment-specific configuration
//    func exampleEnvironmentConfiguration() {
//        print("\n🏗️ Example: Environment-specific configuration")
//        
//        let environment = Environment.current
//        print("  Current Environment: \(environment)")
//        print("  Environment Base URL: \(environment.baseURL)")
//        print("  Environment API Version: \(environment.apiVersion.rawValue)")
//    }
//    
//    /// Run all examples
//    func runAllExamples() {
//        print("🚀 API Versioning Examples")
//        print("=" * 50)
//        
//        exampleBasicAPICall()
//        exampleCheckVersionInfo()
//        exampleCheckFeatureSupport()
//        exampleMigrateToVersion()
//        exampleBuildVersionedURLs()
//        exampleCheckMigrationRecommendations()
//        exampleUseDifferentVersions()
//        exampleEnvironmentConfiguration()
//        
//        print("\n✅ All examples completed!")
//    }
//}
//
//// MARK: - String Extension for Repeat
//
//extension String {
//    static func * (left: String, right: Int) -> String {
//        return String(repeating: left, count: right)
//    }
//}
//
//// MARK: - Usage Example
//
///*
// 
// // How to use in your code:
// 
// let example = APIVersioningExample()
// example.runAllExamples()
// 
// // In a real service:
// class UserService {
//     private let networkManager = NetworkManager.shared
//     private let versionHelper = APIVersionHelper.shared
//     
//     func getUserProfile() async throws -> User {
//         // Automatically uses the configured API version
//         let request = GetUserProfileRequest()
//         return try await networkManager.performAsync(request)
//     }
//     
//     func getUserProfileWithSpecificVersion(_ version: APIVersion) async throws -> User {
//         // Use a specific version if needed
//         if let url = versionHelper.buildVersionedURL(for: .me, version: version) {
//             // Custom implementation for specific version
//             // ...
//         }
//         return try await getUserProfile()
//     }
// }
// 
// */
