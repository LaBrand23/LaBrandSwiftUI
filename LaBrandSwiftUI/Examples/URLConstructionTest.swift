//
//  URLConstructionTest.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 19/04/2025.
//

import Foundation

// MARK: - URL Construction Test

/// Simple test to verify URL construction with API versioning
class URLConstructionTest {
    
    static func testURLConstruction() {
        print("🔗 Testing URL Construction with API Versioning")
        print("=" * 50)
        
        // Test 1: Check configuration
        print("📋 Configuration:")
        print("  Base URL: \(Config.baseURL)")
        print("  API Version: \(Config.apiVersion.rawValue)")
        print("  API Base URL: \(Config.apiBaseURL)")
        
        // Test 2: Test URL construction for different endpoints
        print("\n🌐 URL Construction Test:")
        
        let endpoints: [APIEndpoint] = [.register, .login, .refresh, .me, .logout]
        
        for endpoint in endpoints {
            let fullPath = Config.apiVersion.path + endpoint.rawValue
            let url = URL(string: fullPath, relativeTo: URL(string: Config.baseURL))
            
            print("  \(endpoint.rawValue):")
            print("    Full Path: \(fullPath)")
            print("    Final URL: \(url?.absoluteString ?? "Invalid")")
        }
        
        // Test 3: Expected vs Actual
        print("\n✅ Expected Results:")
        print("  Register: \(Config.baseURL)\(Config.apiVersion.path)/auth/register")
        print("  Login: \(Config.baseURL)\(Config.apiVersion.path)/auth/login")
        print("  Refresh: \(Config.baseURL)\(Config.apiVersion.path)/auth/refresh")
        print("  Me: \(Config.baseURL)\(Config.apiVersion.path)/auth/me")
        print("  Logout: \(Config.baseURL)\(Config.apiVersion.path)/auth/logout")
        
        print("\n🎯 Test completed!")
    }
}

// MARK: - String Extension for Repeat

extension String {
    static func * (left: String, right: Int) -> String {
        return String(repeating: left, count: right)
    }
}
