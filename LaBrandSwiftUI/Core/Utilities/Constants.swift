//
//  Constants.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation
import UIKit

// MARK: - API Constants

struct APIConstants {
    // MARK: - Version Management
    static let currentVersion: APIVersion = Config.apiVersion
    static let supportedVersions: [APIVersion] = [.v1]
    
    // MARK: - Endpoint Helpers
    static func endpoint(_ path: APIEndpoint) -> String {
        return path.rawValue
    }
    
    static func versionedEndpoint(_ path: APIEndpoint, version: APIVersion? = nil) -> String {
        let apiVersion = version ?? currentVersion
        return apiVersion.path + path.rawValue
    }
    
    // MARK: - URL Construction
    static func buildURL(for endpoint: APIEndpoint, version: APIVersion? = nil) -> URL? {
        let endpointPath = versionedEndpoint(endpoint, version: version)
        return URL(string: endpointPath, relativeTo: URL(string: Config.baseURL))
    }
    
    // MARK: - Version Migration
    static func shouldMigrateToVersion(_ newVersion: APIVersion) -> Bool {
        // Add logic here to determine when to migrate to a new API version
        // This could be based on user preferences, server requirements, etc.
        return false
    }
}

// MARK: - HTTP Constants

struct HTTPConstants {
    static let contentType = "application/json"
    static let acceptHeader = "application/json"
    static let authorizationHeader = "Authorization"
    static let bearerPrefix = "Bearer "
    
    // MARK: - Status Codes
    struct StatusCode {
        static let ok = 200
        static let created = 201
        static let noContent = 204
        static let badRequest = 400
        static let unauthorized = 401
        static let forbidden = 403
        static let notFound = 404
        static let conflict = 409
        static let unprocessableEntity = 422
        static let internalServerError = 500
        static let serviceUnavailable = 503
    }
    
    // MARK: - Headers
    struct Headers {
        static let contentType = "Content-Type"
        static let accept = "Accept"
        static let authorization = "Authorization"
        static let userAgent = "User-Agent"
        static let apiVersion = "X-API-Version"
    }
}

// MARK: - App Constants

struct AppConstants {
    // MARK: - App Information
    static let appName = "LaBrand"
    static let appVersion = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0.0"
    static let buildNumber = Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "1"
    
    // MARK: - User Agent
    static let userAgent: String = {
        let device = UIDevice.current
        let systemVersion = device.systemVersion
        let model = device.model
        return "\(appName)/\(appVersion) (\(model); iOS \(systemVersion))"
    }()
    
    // MARK: - Validation
    struct Validation {
        static let minPasswordLength = 8
        static let maxPasswordLength = 128
        static let minNameLength = 2
        static let maxNameLength = 50
        static let maxEmailLength = 254
        static let maxPhoneLength = 20
    }
    
    // MARK: - UI Constants
    struct UI {
        static let cornerRadius: CGFloat = 12
        static let buttonHeight: CGFloat = 50
        static let textFieldHeight: CGFloat = 50
        static let spacing: CGFloat = 16
        static let smallSpacing: CGFloat = 8
        static let largeSpacing: CGFloat = 24
    }
}
