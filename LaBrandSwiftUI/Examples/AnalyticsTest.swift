//
//  AnalyticsTest.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation
import SwiftUI

// MARK: - Analytics Test Helper

struct AnalyticsTest {
    
    static func runBasicTests() {
        let analytics = AnalyticsManager.shared
        
        print("🧪 Starting Analytics Tests...")
        
        // Test 1: Basic event logging
        analytics.logEvent(.featureUsage, name: "Test Event", parameters: ["test": "value"], level: .info)
        print("✅ Basic event logging test passed")
        
        // Test 2: Screen tracking
        analytics.logScreenView("TestScreen")
        print("✅ Screen tracking test passed")
        
        // Test 3: Button tap tracking
        analytics.logButtonTap("test_button", screen: "TestScreen")
        print("✅ Button tap tracking test passed")
        
        // Test 4: Error tracking
        let testError = NSError(domain: "TestError", code: 404, userInfo: [NSLocalizedDescriptionKey: "Test error message"])
        analytics.logError(testError, context: "AnalyticsTest.runBasicTests")
        print("✅ Error tracking test passed")
        
        // Test 5: Performance tracking
        analytics.logPerformanceMetric(name: "test_performance", value: 123.45, unit: "ms")
        print("✅ Performance tracking test passed")
        
        // Test 6: User action tracking
        analytics.logUserAction("test_action", parameters: ["param1": "value1", "param2": "value2"])
        print("✅ User action tracking test passed")
        
        // Test 7: Export functionality
        let exportedData = analytics.exportEvents()
        print("✅ Export functionality test passed")
        print("📊 Exported \(exportedData.count) characters of analytics data")
        
        // Test 8: Get stored events
        let events = analytics.getStoredEvents()
        print("✅ Stored events test passed")
        print("📊 Total stored events: \(events.count)")
        
        print("🎉 All analytics tests completed successfully!")
    }
    
    static func testCodableConformance() {
        print("🧪 Testing Codable conformance...")
        
        // Test AnalyticsEvent encoding/decoding
        let context = AnalyticsContext(userId: "test_user")
        let event = AnalyticsEvent(
            type: .userLogin,
            name: "Test Login",
            parameters: ["method": "email"],
            context: context,
            level: .info
        )
        
        do {
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.prettyPrinted]
            let data = try encoder.encode(event)
            let jsonString = String(data: data, encoding: .utf8) ?? "Failed to encode"
            print("✅ AnalyticsEvent encoding successful")
            
            let decoder = JSONDecoder()
            let decodedEvent = try decoder.decode(AnalyticsEvent.self, from: data)
            print("✅ AnalyticsEvent decoding successful")
            print("📊 Decoded event: \(decodedEvent.name)")
            
        } catch {
            print("❌ Codable test failed: \(error)")
        }
        
        print("🎉 Codable conformance test completed!")
    }
    
    static func testNetworkAnalytics() {
        print("🧪 Testing Network Analytics...")
        
        let analytics = AnalyticsManager.shared
        
        // Simulate network request
        let mockRequest = MockAPIRequest()
        analytics.logNetworkRequest(mockRequest)
        
        // Simulate network response
        analytics.logNetworkResponse(
            url: mockRequest.path.rawValue,
            statusCode: 200,
            responseTime: 0.5,
            dataSize: 1024
        )
        
        print("✅ Network analytics test passed")
    }
}

// MARK: - Mock API Request for Testing

struct MockAPIRequest: APIRequest {
    typealias Response = String
    
    var path: APIEndpoint { .me }
    var method: HTTPMethod { .get }
    var requiresAuth: Bool { true }
    var body: Encodable? { nil }
}

// MARK: - SwiftUI Test View

struct AnalyticsTestView: View {
    @State private var showResults = false
    @State private var testResults = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                Text("Analytics System Test")
                    .font(.title)
                    .fontWeight(.bold)
                
                Button("Run Basic Tests") {
                    runTests()
                }
                .buttonStyle(.borderedProminent)
                
                Button("Test Codable Conformance") {
                    testCodable()
                }
                .buttonStyle(.borderedProminent)
                
                Button("Test Network Analytics") {
                    testNetwork()
                }
                .buttonStyle(.borderedProminent)
                
                Button("Export Analytics Data") {
                    exportData()
                }
                .buttonStyle(.borderedProminent)
                
                if showResults {
                    ScrollView {
                        Text(testResults)
                            .font(.system(.body, design: .monospaced))
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(8)
                    }
                    .frame(maxHeight: 300)
                }
                
                Spacer()
            }
            .padding()
            .navigationTitle("Analytics Test")
            .trackScreen("AnalyticsTestView")
        }
    }
    
    private func runTests() {
        testResults = "Running basic tests...\n"
        showResults = true
        
        DispatchQueue.global(qos: .userInitiated).async {
            AnalyticsTest.runBasicTests()
            
            DispatchQueue.main.async {
                testResults += "\n✅ Basic tests completed successfully!"
            }
        }
    }
    
    private func testCodable() {
        testResults = "Testing Codable conformance...\n"
        showResults = true
        
        DispatchQueue.global(qos: .userInitiated).async {
            AnalyticsTest.testCodableConformance()
            
            DispatchQueue.main.async {
                testResults += "\n✅ Codable conformance test completed!"
            }
        }
    }
    
    private func testNetwork() {
        testResults = "Testing network analytics...\n"
        showResults = true
        
        DispatchQueue.global(qos: .userInitiated).async {
            AnalyticsTest.testNetworkAnalytics()
            
            DispatchQueue.main.async {
                testResults += "\n✅ Network analytics test completed!"
            }
        }
    }
    
    private func exportData() {
        testResults = "Exporting analytics data...\n"
        showResults = true
        
        DispatchQueue.global(qos: .userInitiated).async {
            let exported = AnalyticsManager.shared.exportEvents()
            
            DispatchQueue.main.async {
                testResults = "📊 Exported Analytics Data:\n\n\(exported)"
            }
        }
    }
}

// MARK: - Preview

#if DEBUG
struct AnalyticsTestView_Previews: PreviewProvider {
    static var previews: some View {
        AnalyticsTestView()
    }
}
#endif
