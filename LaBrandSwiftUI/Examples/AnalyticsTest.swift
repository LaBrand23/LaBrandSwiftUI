//
//  AnalyticsTest.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/2025
//

import Foundation

/// Test class to demonstrate enhanced analytics functionality
class AnalyticsTest {
    
    private let analyticsManager = AnalyticsManager.shared
    private let networkManager = NetworkManager.shared
    
    /// Test network request logging with full URL and request body
    func testNetworkRequestLogging() async {
        print("🧪 Testing Enhanced Network Analytics...")
        
        // Test login request
        let loginModel: [String: String] = [
            "email": "test@example.com",
            "password": "secretpassword123"
        ]
        
        let loginRequest = LoginRequest(model: loginModel)
        
        // This will trigger the enhanced analytics logging
        do {
            _ = try await networkManager.performAsync(loginRequest)
        } catch {
            print("Expected error for test: \(error.localizedDescription)")
        }
        
        // Test registration request
        let registerModel = ClientCreate(
            fullName: "John Doe",
            email: "john@example.com",
            password: "securepassword456"
        )
        
        let registerRequest = RegisterRequest(model: registerModel)
        
        do {
            _ = try await networkManager.performAsync(registerRequest)
        } catch {
            print("Expected error for test: \(error.localizedDescription)")
        }
        
        // Export and display analytics events
        print("\n📊 Analytics Events:")
        print(analyticsManager.exportEvents())
    }
    
    /// Test manual logging of network requests
    func testManualNetworkLogging() {
        print("🧪 Testing Manual Network Logging...")
        
        // Simulate a login request
        let loginModel: [String: String] = [
            "email": "user@example.com",
            "password": "mypassword123"
        ]
        
        let loginRequest = LoginRequest(model: loginModel)
        analyticsManager.logNetworkRequest(loginRequest)
        
        // Simulate a registration request
        let registerModel = ClientCreate(
            fullName: "Jane Smith",
            email: "jane@example.com",
            password: "janespassword789"
        )
        
        let registerRequest = RegisterRequest(model: registerModel)
        analyticsManager.logNetworkRequest(registerRequest)
        
        print("✅ Manual network logging completed")
    }
    
    /// Test sensitive data masking
    func testSensitiveDataMasking() {
        print("🧪 Testing Sensitive Data Masking...")
        
        let sensitiveData: [String: String] = [
            "email": "test@example.com",
            "password": "secretpassword",
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "refresh_token_here",
            "api_key": "sk-1234567890abcdef"
        ]
        
        // This would normally be logged by the network manager
        // For testing, we'll simulate the masking
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        
        do {
            let data = try encoder.encode(sensitiveData)
            if let jsonString = String(data: data, encoding: .utf8) {
                print("Original JSON: \(jsonString)")
                
                // Apply masking (this is what the analytics system does)
                let maskedString = maskSensitiveData(jsonString)
                print("Masked JSON: \(maskedString)")
            }
        } catch {
            print("Error encoding data: \(error)")
        }
    }
    
    /// Helper function to mask sensitive data (same as in AnalyticsManager)
    private func maskSensitiveData(_ jsonString: String) -> String {
        var maskedString = jsonString
        
        let sensitiveFields = ["password", "token", "access_token", "refresh_token", "secret", "key"]
        
        for field in sensitiveFields {
            let pattern = "\"\(field)\"\\s*:\\s*\"[^\"]*\""
            let replacement = "\"\(field)\": \"***MASKED***\""
            maskedString = maskedString.replacingOccurrences(of: pattern, with: replacement, options: .regularExpression)
        }
        
        return maskedString
    }
    
    /// Run all tests
    func runAllTests() async {
        print("🚀 Starting Analytics Tests...\n")
        
        testSensitiveDataMasking()
        print()
        
        testManualNetworkLogging()
        print()
        
        await testNetworkRequestLogging()
        print()
        
        print("✅ All analytics tests completed!")
    }
}

// MARK: - Usage Example

/*
 To use this test class:
 
 let test = AnalyticsTest()
 await test.runAllTests()
 
 This will demonstrate:
 1. Full URL logging (base URL + endpoint)
 2. Request body logging with sensitive data masking
 3. Enhanced network response logging
 4. Configuration information logging
 */
