//
//  NetworkManager.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation
import Combine

final class NetworkManager {
    static let shared = NetworkManager()
    
    private var cancellables = Set<AnyCancellable>()
    private let session = URLSession.shared
    private let tokenStorage = TokenStorage(storageManager: KeychainManager.shared)
    private let analyticsManager = AnalyticsManager.shared
    
    private init() {}
    
    // MARK: - Private Helper Methods
    
    private func configureRequestHeaders(_ urlRequest: inout URLRequest, requiresAuth: Bool) {
        urlRequest.setValue(HTTPConstants.contentType, forHTTPHeaderField: HTTPConstants.Headers.contentType)
        urlRequest.setValue(HTTPConstants.acceptHeader, forHTTPHeaderField: HTTPConstants.Headers.accept)
        urlRequest.setValue(AppConstants.userAgent, forHTTPHeaderField: HTTPConstants.Headers.userAgent)
        urlRequest.setValue(Config.apiVersion.rawValue, forHTTPHeaderField: HTTPConstants.Headers.apiVersion)
        
        if requiresAuth, let token = tokenStorage.getToken()?.accessToken {
            urlRequest.setValue(HTTPConstants.bearerPrefix + token, forHTTPHeaderField: HTTPConstants.Headers.authorization)
        }
    }
    
    // MARK: - Combine version
    func perform<T: APIRequest>(_ request: T) -> AnyPublisher<T.Response, Error> {
        // Construct the full URL with version
        let fullPath = "/api" + Config.apiVersion.path + request.path.rawValue
        guard let url = URL(string: fullPath, relativeTo: URL(string: Config.baseURL)) else {
            self.analyticsManager.logEvent(.networkError, name: "Invalid URL", level: .error)
            self.analyticsManager.logError(
                NetworkError.invalidURL,
                context: "NetworkManager.perform",
                additionalInfo: ["error": "Invalid URL"]
            )
            return Fail(error: NetworkError.invalidURL).eraseToAnyPublisher()
        }
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = request.method.rawValue
        configureRequestHeaders(&urlRequest, requiresAuth: request.requiresAuth)
        
        if let encodableBody = request.body {
            urlRequest.httpBody = try? JSONEncoder().encode(AnyEncodable(encodableBody))
        }
        
        let startTime = Date()
        
        // Log detailed request information
        let headers = urlRequest.allHTTPHeaderFields ?? [:]
        analyticsManager.logDetailedNetworkRequest(
            url: urlRequest.url?.absoluteString ?? "",
            method: urlRequest.httpMethod ?? "",
            headers: headers,
            body: urlRequest.httpBody,
            requiresAuth: request.requiresAuth
        )
        
        // Also log the standard request
        analyticsManager.logNetworkRequest(request)
        
        return session.dataTaskPublisher(for: urlRequest)
            .tryMap { data, response -> Data in
                let responseTime = Date().timeIntervalSince(startTime)
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    self.analyticsManager.logNetworkResponse(
                        url: urlRequest.url?.absoluteString ?? "",
                        statusCode: -1,
                        responseTime: responseTime,
                        dataSize: nil
                    )
                    throw NetworkError.serverError(status: -1)
                }
                
                // Log detailed response
                let responseHeaders = httpResponse.allHeaderFields.compactMapKeys { $0 as? String }.compactMapValues { String(describing: $0) }
                self.analyticsManager.logDetailedNetworkResponse(
                    url: urlRequest.url?.absoluteString ?? "",
                    statusCode: httpResponse.statusCode,
                    responseTime: responseTime,
                    headers: responseHeaders,
                    data: data
                )
                
                switch httpResponse.statusCode {
                case 200...299:
                    return data
                case 401:
                    self.analyticsManager.logError(
                        NetworkError.unauthorized,
                        context: "NetworkManager.perform",
                        additionalInfo: ["statusCode": String(httpResponse.statusCode)]
                    )
                    throw NetworkError.unauthorized
                default:
                    self.analyticsManager.logError(
                        NetworkError.serverError(status: httpResponse.statusCode),
                        context: "NetworkManager.perform",
                        additionalInfo: ["statusCode": String(httpResponse.statusCode)]
                    )
                    throw NetworkError.serverError(status: httpResponse.statusCode)
                }
            }
            .decode(type: T.Response.self, decoder: JSONDecoder())
            .catch { [weak self] error -> AnyPublisher<T.Response, Error> in
                guard case NetworkError.unauthorized = error else {
                    self?.analyticsManager.logEvent(.networkError, name: "Unauthorized", level: .error)
                    self?.analyticsManager.logError(
                        NetworkError.unauthorized,
                        context: "NetworkManager.perform",
                        additionalInfo: ["error": "Unauthorized"]
                    )
                    return Fail(error: error).eraseToAnyPublisher()
                }
                // Refresh token flow
                return self?.refreshToken()
                    .flatMap { _ in self!.perform(request) }
                    .eraseToAnyPublisher() ?? Fail(error: NetworkError.refreshFailed).eraseToAnyPublisher()
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Async/Await version
    @discardableResult
    func performAsync<T: APIRequest>(_ request: T) async throws -> T.Response {
        // Construct the full URL with version
        let fullPath = "/api" + Config.apiVersion.path + request.path.rawValue
        guard let url = URL(string: fullPath, relativeTo: URL(string: Config.baseURL)) else {
            self.analyticsManager.logEvent(.networkError, name: "Invalid URL", level: .error)
            self.analyticsManager.logError(
                NetworkError.invalidURL,
                context: "NetworkManager.performAsync",
                additionalInfo: ["error": "Invalid URL"]
            )
            throw NetworkError.invalidURL
        }
        
        var urlRequest = URLRequest(url: url)
        urlRequest.httpMethod = request.method.rawValue
        configureRequestHeaders(&urlRequest, requiresAuth: request.requiresAuth)
        
        if let encodableBody = request.body {
            urlRequest.httpBody = try? JSONEncoder().encode(AnyEncodable(encodableBody))
        }
        
        let startTime = Date()
        
        // Log detailed request information
        let headers = urlRequest.allHTTPHeaderFields ?? [:]
        analyticsManager.logDetailedNetworkRequest(
            url: urlRequest.url?.absoluteString ?? "",
            method: urlRequest.httpMethod ?? "",
            headers: headers,
            body: urlRequest.httpBody,
            requiresAuth: request.requiresAuth
        )
        
        do {
            let (data, response) = try await session.data(for: urlRequest)
            let responseTime = Date().timeIntervalSince(startTime)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                self.analyticsManager.logError(
                    NetworkError.serverError(status: -1),
                    context: "NetworkManager.performAsync",
                    additionalInfo: ["error": "Invalid response"]
                )
                throw NetworkError.serverError(status: -1)
            }
            
            // Log detailed response
            let responseHeaders = httpResponse.allHeaderFields.compactMapKeys { $0 as? String }.compactMapValues { String(describing: $0) }
            self.analyticsManager.logDetailedNetworkResponse(
                url: urlRequest.url?.absoluteString ?? "",
                statusCode: httpResponse.statusCode,
                responseTime: responseTime,
                headers: responseHeaders,
                data: data
            )
            
            switch httpResponse.statusCode {
            case 200...299:
                return try JSONDecoder().decode(T.Response.self, from: data)
            case 401:
                self.analyticsManager.logError(
                    NetworkError.unauthorized,
                    context: "NetworkManager.performAsync",
                    additionalInfo: ["statusCode": String(httpResponse.statusCode)]
                )
                try await refreshTokenAsync()
                return try await performAsync(request) // retry once
            default:
                self.analyticsManager.logError(
                    NetworkError.serverError(status: httpResponse.statusCode),
                    context: "NetworkManager.performAsync",
                    additionalInfo: ["statusCode": String(httpResponse.statusCode)]
                )
                throw NetworkError.serverError(status: httpResponse.statusCode)
            }
        } catch {
            let responseTime = Date().timeIntervalSince(startTime)
            self.analyticsManager.logNetworkResponse(
                url: urlRequest.url?.absoluteString ?? "",
                statusCode: -1,
                responseTime: responseTime,
                dataSize: nil
            )
            throw NetworkError.unknown(error)
        }
    }
    
    // MARK: - Refresh Token
    private func refreshToken() -> AnyPublisher<Void, Error> {
        guard let refreshToken = tokenStorage.getToken()?.refreshToken else {
            self.analyticsManager.logEvent(.networkError, name: "No refresh token", level: .error)
            return Fail(error: NetworkError.refreshFailed).eraseToAnyPublisher()
        }
        
        // Construct the full URL with version for refresh token
        let fullPath = "/api" + Config.apiVersion.path + APIEndpoint.refresh.rawValue
        guard let refreshURL = URL(string: fullPath, relativeTo: URL(string: Config.baseURL)) else {
            return Fail(error: NetworkError.invalidURL).eraseToAnyPublisher()
        }
        
        var req = URLRequest(url: refreshURL)
        req.httpMethod = "POST"
        req.setValue(HTTPConstants.contentType, forHTTPHeaderField: HTTPConstants.Headers.contentType)
        req.setValue(HTTPConstants.bearerPrefix + refreshToken, forHTTPHeaderField: HTTPConstants.Headers.authorization)
        
        return session.dataTaskPublisher(for: req)
            .tryMap { [weak self] data, response in
                let token = try JSONDecoder().decode(Token.self, from: data)
                self?.tokenStorage.save(token: token)
                return ()
            }
            .eraseToAnyPublisher()
    }
    
    private func refreshTokenAsync() async throws {
        guard let refreshToken = tokenStorage.getToken()?.refreshToken else {
            self.analyticsManager.logEvent(.networkError, name: "No refresh token", level: .error)
            throw NetworkError.refreshFailed
        }
        
        // Construct the full URL with version for refresh token
        let fullPath = "/api" + Config.apiVersion.path + APIEndpoint.refresh.rawValue
        guard let refreshURL = URL(string: fullPath, relativeTo: URL(string: Config.baseURL)) else {
            throw NetworkError.invalidURL
        }
        
        var req = URLRequest(url: refreshURL)
        req.httpMethod = "POST"
        req.setValue(HTTPConstants.contentType, forHTTPHeaderField: HTTPConstants.Headers.contentType)
        req.setValue(HTTPConstants.bearerPrefix + refreshToken, forHTTPHeaderField: HTTPConstants.Headers.authorization)
        
        let (data, _) = try await session.data(for: req)
        let json = try JSONDecoder().decode(Token.self, from: data)
        tokenStorage.save(token: json)
    }
}

// MARK: - Dictionary Extension for Header Conversion
extension Dictionary where Key == AnyHashable, Value == Any {
    func compactMapKeys<T>(_ transform: (Key) throws -> T?) rethrows -> [T: Value] {
        var result: [T: Value] = [:]
        for (key, value) in self {
            if let transformedKey = try transform(key) {
                result[transformedKey] = value
            }
        }
        return result
    }
}
