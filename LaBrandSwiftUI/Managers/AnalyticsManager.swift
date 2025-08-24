//
//  AnalyticsManager.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation
import OSLog
import UIKit
import SwiftUI

// MARK: - Logger Extensions

extension Logger {
    private static var subsystem = Bundle.main.bundleIdentifier ?? "com.labrand.app"
    
    // MARK: - Category Loggers
    static let viewCycle = Logger(subsystem: subsystem, category: "ViewCycle")
    static let api = Logger(subsystem: subsystem, category: "API")
    static let auth = Logger(subsystem: subsystem, category: "Authentication")
    static let user = Logger(subsystem: subsystem, category: "User")
    static let network = Logger(subsystem: subsystem, category: "Network")
    static let performance = Logger(subsystem: subsystem, category: "Performance")
    static let error = Logger(subsystem: subsystem, category: "Error")
    static let debug = Logger(subsystem: subsystem, category: "Debug")
    static let analytics = Logger(subsystem: subsystem, category: "Analytics")
    static let storage = Logger(subsystem: subsystem, category: "Storage")
    static let ui = Logger(subsystem: subsystem, category: "UI")
}

// MARK: - Analytics Event Types

public enum AnalyticsEventType: String, CaseIterable, Codable {
    // User Actions
    case userLogin = "user_login"
    case userLogout = "user_logout"
    case userRegistration = "user_registration"
    case userProfileUpdate = "user_profile_update"
    
    // Screen Views
    case screenView = "screen_view"
    case screenExit = "screen_exit"
    
    // Network Events
    case networkRequest = "network_request"
    case networkResponse = "network_response"
    case networkError = "network_error"
    
    // Performance
    case appLaunch = "app_launch"
    case appBackground = "app_background"
    case appForeground = "app_foreground"
    case performanceMetric = "performance_metric"
    
    // UI Events
    case buttonTap = "button_tap"
    case gesturePerformed = "gesture_performed"
    case viewAppear = "view_appear"
    case viewDisappear = "view_disappear"
    
    // Business Logic
    case purchaseAttempt = "purchase_attempt"
    case purchaseSuccess = "purchase_success"
    case purchaseFailure = "purchase_failure"
    case featureUsage = "feature_usage"
    
    // Error Events
    case errorOccurred = "error_occurred"
    case crashReported = "crash_reported"
    case validationFailed = "validation_failed"
}

// MARK: - Analytics Log Level

public enum AnalyticsLogLevel: String, CaseIterable, Codable {
    case debug = "DEBUG"
    case info = "INFO"
    case warning = "WARNING"
    case error = "ERROR"
    case critical = "CRITICAL"
    
    var osLogType: OSLogType {
        switch self {
        case .debug: return .debug
        case .info: return .info
        case .warning: return .default
        case .error: return .error
        case .critical: return .fault
        }
    }
    
    var emoji: String {
        switch self {
        case .debug: return "🐞"
        case .info: return "ℹ️"
        case .warning: return "⚠️"
        case .error: return "❌"
        case .critical: return "🚨"
        }
    }
}

// MARK: - Analytics Context

public struct AnalyticsContext: Codable {
    public let sessionId: String
    public let userId: String?
    public let deviceInfo: DeviceInfo
    public let appVersion: String
    public let timestamp: Date
    
    public init(userId: String? = nil) {
        self.sessionId = UUID().uuidString
        self.userId = userId
        self.deviceInfo = DeviceInfo.current
        self.appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown"
        self.timestamp = Date()
    }
}

// MARK: - Device Info

public struct DeviceInfo: Codable {
    public let model: String
    public let systemVersion: String
    public let systemName: String
    public let identifierForVendor: String?
    
    public static var current: DeviceInfo {
        DeviceInfo(
            model: UIDevice.current.model,
            systemVersion: UIDevice.current.systemVersion,
            systemName: UIDevice.current.systemName,
            identifierForVendor: UIDevice.current.identifierForVendor?.uuidString
        )
    }
}

// MARK: - Analytics Event

public struct AnalyticsEvent: Codable {
    public let id: String
    public let type: AnalyticsEventType
    public let name: String
    public let parameters: [String: String]
    public let context: AnalyticsContext
    public let level: AnalyticsLogLevel
    public let timestamp: Date
    
    public init(
        type: AnalyticsEventType,
        name: String,
        parameters: [String: String] = [:],
        context: AnalyticsContext,
        level: AnalyticsLogLevel = .info
    ) {
        self.id = UUID().uuidString
        self.type = type
        self.name = name
        self.parameters = parameters
        self.context = context
        self.level = level
        self.timestamp = Date()
    }
}

// MARK: - Analytics Manager

public final class AnalyticsManager: ObservableObject {
    
    // MARK: - Singleton
    public static let shared = AnalyticsManager()
    
    // MARK: - Properties
    private let queue = DispatchQueue(label: "analytics.manager.queue", qos: .utility)
    private let storage = AnalyticsStorage()
    private var currentContext: AnalyticsContext
    private var isEnabled = true
    
    // MARK: - Initialization
    private init() {
        self.currentContext = AnalyticsContext()
        setupCrashHandling()
        logAppLaunch()
    }
    
    // MARK: - Configuration
    public var enableConsoleLogging = true
    public var enableFileLogging = true
    public var enableRemoteLogging = false
    public var maxStoredEvents = 1000
    
    // MARK: - Initialization
    private func setupCrashHandling() {
        // Setup crash handling if needed
        Logger.error.info("Analytics Manager initialized")
    }
    
    private func logAppLaunch() {
        let event = AnalyticsEvent(
            type: .appLaunch,
            name: "App Launched",
            context: currentContext,
            level: .info
        )
        logEvent(event)
        
        // Log configuration information
        logConfigurationInfo()
    }
    
    private func logConfigurationInfo() {
        let configEvent = AnalyticsEvent(
            type: .performanceMetric,
            name: "App Configuration",
            parameters: [
                "baseURL": Config.baseURL,
                "appVersion": Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "Unknown",
                "buildNumber": Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "Unknown"
            ],
            context: currentContext,
            level: .debug
        )
        logEvent(configEvent)
        
        Logger.debug.debug("🔧 App Configuration - Base URL: \(Config.baseURL)")
    }
    
    // MARK: - Public API
    
    /// Update user context
    public func updateUserContext(userId: String?) {
        currentContext = AnalyticsContext(userId: userId)
        Logger.auth.info("User context updated: \(userId ?? "anonymous")")
    }
    
    /// Log a simple event
    public func logEvent(
        _ type: AnalyticsEventType,
        name: String,
        parameters: [String: String] = [:],
        level: AnalyticsLogLevel = .info
    ) {
        let event = AnalyticsEvent(
            type: type,
            name: name,
            parameters: parameters,
            context: currentContext,
            level: level
        )
        logEvent(event)
    }
    
    /// Log with Codable model
    public func logEvent<T: Encodable>(
        _ type: AnalyticsEventType,
        name: String,
        model: T,
        level: AnalyticsLogLevel = .info
    ) {
        let parameters = encodeModelToParameters(model)
        let event = AnalyticsEvent(
            type: type,
            name: name,
            parameters: parameters,
            context: currentContext,
            level: level
        )
        logEvent(event)
    }
    
    /// Log network request
    public func logNetworkRequest(_ request: any APIRequest) {
        // Get the full URL
        let fullURL = URL(string: request.path.rawValue, relativeTo: URL(string: Config.baseURL)!)?.absoluteString ?? request.path.rawValue
        
        var parameters = [
            "url": request.path.rawValue,
            "fullUrl": fullURL,
            "method": request.method.rawValue,
            "requiresAuth": String(request.requiresAuth)
        ]
        
        // Add request body information (masking sensitive data)
        if let encodableBody = request.body {
            let bodyParameters = extractBodyParameters(from: encodableBody)
            parameters["requestBody"] = bodyParameters
        }
        
        let event = AnalyticsEvent(
            type: .networkRequest,
            name: "Network Request",
            parameters: parameters,
            context: currentContext,
            level: .info
        )
        logEvent(event)
        
        // Also log to network category with full URL
        Logger.network.info("🌐 \(request.method.rawValue) \(fullURL)")
    }
    
    /// Log network response
    public func logNetworkResponse(
        url: String,
        statusCode: Int,
        responseTime: TimeInterval,
        dataSize: Int?
    ) {
        // Get the full URL if it's a relative path
        let fullURL = url.hasPrefix("http") ? url : URL(string: url, relativeTo: URL(string: Config.baseURL)!)?.absoluteString ?? url
        
        var parameters = [
            "url": url,
            "fullUrl": fullURL,
            "statusCode": String(statusCode),
            "responseTime": String(format: "%.3f", responseTime)
        ]
        
        if let dataSize = dataSize {
            parameters["dataSize"] = String(dataSize)
        }
        
        let event = AnalyticsEvent(
            type: .networkResponse,
            name: "Network Response",
            parameters: parameters,
            context: currentContext,
            level: statusCode >= 400 ? .error : .info
        )
        logEvent(event)
        
        // Also log to network category with full URL
        let statusEmoji = statusCode >= 400 ? "❌" : "✅"
        Logger.network.info("\(statusEmoji) \(statusCode) - \(fullURL) (\(String(format: "%.3fs", responseTime)))")
    }
    
    /// Log screen view
    public func logScreenView(_ screenName: String) {
        let event = AnalyticsEvent(
            type: .screenView,
            name: "Screen View",
            parameters: ["screen": screenName],
            context: currentContext,
            level: .debug
        )
        logEvent(event)
        
        // Also log to view cycle category
        Logger.viewCycle.info("📱 Screen: \(screenName)")
    }
    
    /// Log error
    public func logError(
        _ error: Error,
        context: String = "",
        additionalInfo: [String: String] = [:]
    ) {
        var parameters = [
            "error": error.localizedDescription,
            "errorType": String(describing: type(of: error))
        ]
        
        if !context.isEmpty {
            parameters["context"] = context
        }
        
        parameters.merge(additionalInfo) { _, new in new }
        
        let event = AnalyticsEvent(
            type: .errorOccurred,
            name: "Error Occurred",
            parameters: parameters,
            context: currentContext,
            level: .error
        )
        logEvent(event)
        
        // Also log to error category
        Logger.error.error("❌ Error in \(context): \(error.localizedDescription)")
    }
    
    /// Log performance metric
    public func logPerformanceMetric(
        name: String,
        value: Double,
        unit: String = "ms"
    ) {
        let parameters = [
            "value": String(value),
            "unit": unit
        ]
        
        let event = AnalyticsEvent(
            type: .performanceMetric,
            name: name,
            parameters: parameters,
            context: currentContext,
            level: .info
        )
        logEvent(event)
        
        // Also log to performance category
        Logger.performance.info("⚡ \(name): \(value)\(unit)")
    }
    
    /// Get stored events
    public func getStoredEvents() -> [AnalyticsEvent] {
        return storage.getEvents()
    }
    
    /// Clear stored events
    public func clearStoredEvents() {
        storage.clearEvents()
        Logger.analytics.info("Analytics events cleared")
    }
    
    /// Export events for debugging
    public func exportEvents() -> String {
        let events = getStoredEvents()
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        
        do {
            let data = try encoder.encode(events)
            return String(data: data, encoding: .utf8) ?? "Failed to encode events"
        } catch {
            return "Failed to export events: \(error.localizedDescription)"
        }
    }
    
    // MARK: - Private Methods
    
    private func logEvent(_ event: AnalyticsEvent) {
        guard isEnabled else { return }
        
        queue.async { [weak self] in
            self?.processEvent(event)
        }
    }
    
    private func processEvent(_ event: AnalyticsEvent) {
        // Store event
        if enableFileLogging {
            storage.storeEvent(event)
        }
        
        // Console logging
        if enableConsoleLogging {
            logToConsole(event)
        }
        
        // Remote logging (if enabled)
        if enableRemoteLogging {
            sendToRemote(event)
        }
    }
    
    private func logToConsole(_ event: AnalyticsEvent) {
        let timestamp = formattedTimestamp(event.timestamp)
        let userInfo = event.context.userId ?? "anonymous"
        
        let message = """
        \(event.level.emoji) [\(timestamp)] [\(event.level.rawValue)]
        Event: \(event.name) (\(event.type.rawValue))
        User: \(userInfo)
        Parameters: \(event.parameters.isEmpty ? "none" : event.parameters.map { "\($0.key): \($0.value)" }.joined(separator: ", "))
        """
        
        switch event.level {
        case .debug:
            Logger.debug.debug("\(message)")
        case .info:
            Logger.analytics.info("\(message)")
        case .warning:
            Logger.analytics.warning("\(message)")
        case .error:
            Logger.analytics.error("\(message)")
        case .critical:
            Logger.analytics.critical("\(message)")
        }
    }
    
    private func sendToRemote(_ event: AnalyticsEvent) {
        // Implement remote logging here (Firebase, Crashlytics, etc.)
        // This is a placeholder for future implementation
    }
    
    private func encodeModelToParameters<T: Encodable>(_ model: T) -> [String: String] {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        
        do {
            let data = try encoder.encode(model)
            if let jsonString = String(data: data, encoding: .utf8) {
                return ["model": jsonString]
            }
        } catch {
            return ["modelError": error.localizedDescription]
        }
        
        return ["model": "Failed to encode"]
    }
    
    private func formattedTimestamp(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm:ss.SSS"
        formatter.timeZone = TimeZone.current
        return formatter.string(from: date)
    }
    
    /// Extract and mask sensitive data from request body
    private func extractBodyParameters(from encodableBody: Encodable) -> String {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        
        do {
            let data = try encoder.encode(AnyEncodable(encodableBody))
            if let jsonString = String(data: data, encoding: .utf8) {
                // Mask sensitive fields
                return maskSensitiveData(jsonString)
            }
        } catch {
            return "Failed to encode body: \(error.localizedDescription)"
        }
        
        return "Failed to extract body parameters"
    }
    
    /// Mask sensitive data in JSON string
    private func maskSensitiveData(_ jsonString: String) -> String {
        var maskedString = jsonString
        
        // Define sensitive fields to mask
        let sensitiveFields = ["password", "token", "access_token", "refresh_token", "secret", "key"]
        
        for field in sensitiveFields {
            // Pattern to match field names in JSON
            let pattern = "\"\(field)\"\\s*:\\s*\"[^\"]*\""
            let replacement = "\"\(field)\": \"***MASKED***\""
            maskedString = maskedString.replacingOccurrences(of: pattern, with: replacement, options: .regularExpression)
        }
        
        return maskedString
    }
}

// MARK: - Analytics Storage

private final class AnalyticsStorage {
    private let userDefaults = UserDefaults.standard
    private let eventsKey = "analytics_events"
    private let maxEvents = 1000
    
    func storeEvent(_ event: AnalyticsEvent) {
        var events = getEvents()
        events.append(event)
        
        // Keep only the last maxEvents
        if events.count > maxEvents {
            events = Array(events.suffix(maxEvents))
        }
        
        saveEvents(events)
    }
    
    func getEvents() -> [AnalyticsEvent] {
        guard let data = userDefaults.data(forKey: eventsKey),
              let events = try? JSONDecoder().decode([AnalyticsEvent].self, from: data) else {
            return []
        }
        return events
    }
    
    func clearEvents() {
        userDefaults.removeObject(forKey: eventsKey)
    }
    
    private func saveEvents(_ events: [AnalyticsEvent]) {
        guard let data = try? JSONEncoder().encode(events) else { return }
        userDefaults.set(data, forKey: eventsKey)
    }
}

// MARK: - Convenience Extensions

public extension AnalyticsManager {
    
    /// Quick logging methods for common events
    func logButtonTap(_ buttonName: String, screen: String? = nil) {
        var parameters = ["button": buttonName]
        if let screen = screen {
            parameters["screen"] = screen
        }
        
        logEvent(.buttonTap, name: "Button Tap", parameters: parameters, level: .debug)
    }
    
    func logViewAppear(_ viewName: String) {
        logEvent(.viewAppear, name: "View Appear", parameters: ["view": viewName], level: .debug)
        Logger.ui.debug("👁️ View appeared: \(viewName)")
    }
    
    func logViewDisappear(_ viewName: String) {
        logEvent(.viewDisappear, name: "View Disappear", parameters: ["view": viewName], level: .debug)
        Logger.ui.debug("👁️ View disappeared: \(viewName)")
    }
    
    func logUserAction(_ action: String, parameters: [String: String] = [:]) {
        logEvent(.featureUsage, name: action, parameters: parameters, level: .info)
        Logger.user.info("👤 User action: \(action)")
    }
    
    func logAppStateChange(_ state: String) {
        let eventType: AnalyticsEventType = state == "background" ? .appBackground : .appForeground
        logEvent(eventType, name: "App \(state.capitalized)", level: .info)
        Logger.debug.info("📱 App \(state): \(state)")
    }
}



// MARK: - Debug Helper

#if DEBUG
extension AnalyticsManager {
    /// Debug helper to print all stored events
    func debugPrintEvents() {
        let events = getStoredEvents()
        print("=== ANALYTICS EVENTS (\(events.count)) ===")
        
        for (index, event) in events.enumerated() {
            print("\(index + 1). [\(event.timestamp)] \(event.type.rawValue) - \(event.name)")
            if !event.parameters.isEmpty {
                print("   Parameters: \(event.parameters)")
            }
        }
        print("=== END ANALYTICS EVENTS ===")
    }
}
#endif
