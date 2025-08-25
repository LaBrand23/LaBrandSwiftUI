//
//  Config.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//
import Foundation

struct Config {
    // MARK: - Environment Configuration
    static let environment: EnvironmentConfig = EnvironmentConfig.current
    
    // MARK: - Base URL Configuration
    static let baseURL: String = {
        // First try to get from Info.plist, fallback to environment configuration
        if let infoPlistURL = Bundle.main.object(forInfoDictionaryKey: "BASE_URL") as? String, !infoPlistURL.isEmpty {
            return infoPlistURL
        }
        return environment.baseURL
    }()
    
    // MARK: - API Version Configuration
    static let apiVersion: APIVersion = environment.apiVersion
    
    // MARK: - API Base URL with Version
    static var apiBaseURL: String {
        return baseURL + apiVersion.path
    }
    
    // MARK: - Timeout Configuration
    static let requestTimeout: TimeInterval = 30.0
    static let resourceTimeout: TimeInterval = 60.0
    
    // MARK: - Retry Configuration
    static let maxRetryAttempts: Int = 3
    static let retryDelay: TimeInterval = 1.0
    
    // MARK: - Cache Configuration
    static let cacheTimeout: TimeInterval = 300.0 // 5 minutes
    static let maxCacheSize: Int = 50 * 1024 * 1024 // 50 MB
}
