//
//  NetworkLoggingTest.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import Foundation
import SwiftUI

/// Test class to demonstrate enhanced network logging
class NetworkLoggingTest: ObservableObject {
    private let analyticsManager = AnalyticsManager.shared
    private let networkManager = NetworkManager.shared
    
    @Published var logOutput: String = ""
    
    /// Test the enhanced network logging
    func testNetworkLogging() {
        // Enable detailed logging
        analyticsManager.setDetailedNetworkLogging(true)
        
        // Log a test event
        analyticsManager.logTestNetworkRequest()
        
        // Test detailed request logging
        analyticsManager.logDetailedNetworkRequest(
            url: "/api/test",
            method: "POST",
            headers: [
                "Content-Type": "application/json",
                "Authorization": "Bearer test-token",
                "User-Agent": "LaBrandSwiftUI/1.0"
            ],
            body: """
            {
                "email": "test@example.com",
                "password": "***MASKED***",
                "fullName": "Test User"
            }
            """.data(using: .utf8),
            requiresAuth: true
        )
        
        // Test detailed response logging
        analyticsManager.logDetailedNetworkResponse(
            url: "/api/test",
            statusCode: 200,
            responseTime: 0.245,
            headers: [
                "Content-Type": "application/json",
                "Cache-Control": "no-cache",
                "X-Request-ID": "req-12345"
            ],
            data: """
            {
                "success": true,
                "message": "Test response",
                "data": {
                    "userId": "123",
                    "token": "***MASKED***"
                }
            }
            """.data(using: .utf8)
        )
        
        updateLogOutput("✅ Network logging test completed. Check console for detailed logs.")
    }
    
    /// Clear logs
    func clearLogs() {
        analyticsManager.clearStoredEvents()
        updateLogOutput("🗑️ Logs cleared")
    }
    
    /// Export logs
    func exportLogs() {
        let exportedLogs = analyticsManager.exportEvents()
        updateLogOutput("📤 Exported logs:\n\(exportedLogs)")
    }
    
    private func updateLogOutput(_ message: String) {
        DispatchQueue.main.async {
            self.logOutput = message
        }
    }
}

/// SwiftUI view for testing network logging
struct NetworkLoggingTestView: View {
    @StateObject private var testManager = NetworkLoggingTest()
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Network Logging Test")
                .font(.title)
                .fontWeight(.bold)
            
            VStack(spacing: 15) {
                Button("Test Network Logging") {
                    testManager.testNetworkLogging()
                }
                .buttonStyle(.borderedProminent)
                
                Button("Clear Logs") {
                    testManager.clearLogs()
                }
                .buttonStyle(.bordered)
                
                Button("Export Logs") {
                    testManager.exportLogs()
                }
                .buttonStyle(.bordered)
            }
            
            ScrollView {
                Text(testManager.logOutput)
                    .font(.system(.body, design: .monospaced))
                    .padding()
                    .background(Color.gray.opacity(0.1))
                    .cornerRadius(8)
            }
            .frame(maxHeight: 300)
            
            Spacer()
        }
        .padding()
        .navigationTitle("Network Logging Test")
    }
}

#Preview {
    NetworkLoggingTestView()
}
