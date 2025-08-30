//
//  Environment.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation

// MARK: - API Versioning

public enum APIVersion: String, CaseIterable {
    case v1 = "v1"
    // case v2 = "v2"
    
    var path: String {
        return "/\(rawValue)"
    }
}

// MARK: - Environment Configuration

public enum EnvironmentConfig {
    case development
    case staging
    case production
    
    var apiVersion: APIVersion {
        switch self {
        case .development:
            return .v1
        case .staging:
            return .v1
        case .production:
            return .v1
        }
    }
    
    var baseURL: String {
        switch self {
        case .development:
            return "http://192.168.1.114:8000/api"
        case .staging:
            return "http://192.168.1.114:8000/api"
        case .production:
            return "http://192.168.1.114:8000/api"
        }
    }

    var baseURLMedia: String {
        switch self {
        case .development:
            return "http://192.168.1.114:8000"
        case .staging:
            return "http://192.168.1.114:8000"
        case .production:
            return "http://192.168.1.114:8000"
        }
    }
}

// MARK: - Current Environment

extension EnvironmentConfig {
    static var current: EnvironmentConfig {
        #if DEBUG
        return .development
        #else
        // You can add logic here to determine environment based on bundle identifier or other criteria
        return .production
        #endif
    }
}
