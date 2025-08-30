// //
// //  NetworkURLTest.swift
// //  LaBrandSwiftUI
// //
// //  Created by Shaxzod on 19/04/25
// //

// import Foundation

// // MARK: - Network URL Test
// class NetworkURLTest {
    
//     static func testURLConstruction() {
//         print("🔗 Testing Network URL Construction")
//         print("=" * 50)
        
//         // Test configuration
//         print("📋 Configuration:")
//         print("  Base URL: \(Config.baseURL)")
//         print("  API Version: \(Config.apiVersion.rawValue)")
//         print("  API Version Path: \(Config.apiVersion.path)")
        
//         // Test the corrected URL construction logic
//         print("\n🔧 Corrected URL Construction Test:")
//         let baseURLWithVersion = Config.baseURL + Config.apiVersion.path
//         print("  Base URL with Version: \(baseURLWithVersion)")
        
//         // Test endpoint URL construction
//         print("\n🌐 Endpoint URL Construction Test:")
//         let testEndpoints: [APIEndpoint] = [
//             .mobileQuickCategories,
//             .mobileNewArrivals,
//             .mobileCategoryCollections,
//             .mobileTrendingProducts
//         ]
        
//         for endpoint in testEndpoints {
//             testEndpointURL(endpoint)
//         }
        
//         // Test with query parameters
//         print("\n🔍 Query Parameters Test:")
//         testEndpointWithQueryParameters()
        
//         print("\n🎯 URL Construction Test completed!")
//     }
    
//     private static func testEndpointURL(_ endpoint: APIEndpoint) {
//         print("  Testing: \(endpoint.rawValue)")
        
//         // Simulate the corrected NetworkManager URL construction logic
//         let baseURLWithVersion = Config.baseURL + Config.apiVersion.path
//         let fullPath = endpoint.rawValue
//         let fullURLString = baseURLWithVersion + fullPath
        
//         print("    Base URL with Version: \(baseURLWithVersion)")
//         print("    Full Path: \(fullPath)")
//         print("    Full URL String: \(fullURLString)")
        
//         if let url = URL(string: fullURLString) {
//             print("    ✅ URL: \(url.absoluteString)")
//         } else {
//             print("    ❌ Failed to create URL")
//         }
//     }
    
//     private static func testEndpointWithQueryParameters() {
//         print("  Testing: /mobile/new-arrivals with query parameters")
        
//         let baseURLWithVersion = Config.baseURL + Config.apiVersion.path
//         let fullPath = "/mobile/new-arrivals"
//         let fullURLString = baseURLWithVersion + fullPath
//         let queryParams = ["days": "7", "page": "1", "limit": "10"]
        
//         var urlComponents = URLComponents(string: fullURLString)
//         urlComponents?.queryItems = queryParams.map { URLQueryItem(name: $0.key, value: $0.value) }
        
//         if let url = urlComponents?.url {
//             print("    ✅ URL: \(url.absoluteString)")
//         } else {
//             print("    ❌ Failed to create URL with query parameters")
//         }
//     }
// }

// // MARK: - String Extension for Repeat
// extension String {
//     static func * (left: String, right: Int) -> String {
//         return String(repeating: left, count: right)
//     }
// }

// // MARK: - Usage Example
// /*
 
//  // Run the test:
//  NetworkURLTest.testURLConstruction()
 
//  // Expected output should show URLs like:
//  // http://192.168.1.114:8000/api/v1/mobile/quick-categories
//  // http://192.168.1.114:8000/api/v1/mobile/new-arrivals?days=7&page=1&limit=10
 
//  */
