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
    
    private let baseURL = URL(string: Config.baseURL)!
    private var cancellables = Set<AnyCancellable>()
    private let session = URLSession.shared
    private let tokenStorage = TokenStorage(storageManager: KeychainManager.shared)
    private let analyticsManager = AnalyticsManager.shared
    
    private init() {}
    
    // MARK: - Combine version
    func perform<T: APIRequest>(_ request: T) -> AnyPublisher<T.Response, Error> {
        guard let url = URL(string: request.path.rawValue, relativeTo: baseURL) else {
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
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if request.requiresAuth, let token = tokenStorage.getToken()?.accessToken {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let encodableBody = request.body {
            urlRequest.httpBody = try? JSONEncoder().encode(AnyEncodable(encodableBody))
        }
        
        let startTime = Date()
        analyticsManager.logNetworkRequest(request)
        
        return session.dataTaskPublisher(for: urlRequest)
            .tryMap { data, response -> Data in
                let responseTime = Date().timeIntervalSince(startTime)
                
                guard let httpResponse = response as? HTTPURLResponse else {
                    self.analyticsManager.logNetworkResponse(
                        url: request.path.rawValue,
                        statusCode: -1,
                        responseTime: responseTime,
                        dataSize: nil
                    )
                    self.analyticsManager.logError(
                        NetworkError.serverError(status: -1),
                        context: "NetworkManager.perform",
                        additionalInfo: ["error": "Invalid response"]
                    )
                    throw NetworkError.serverError(status: -1)
                }
                
                // Log response
                self.analyticsManager.logNetworkResponse(
                    url: request.path.rawValue,
                    statusCode: httpResponse.statusCode,
                    responseTime: responseTime,
                    dataSize: data.count
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
        guard let url = URL(string: request.path.rawValue, relativeTo: baseURL) else {
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
        urlRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        if request.requiresAuth, let token = tokenStorage.getToken()?.accessToken {
            urlRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        
        if let encodableBody = request.body {
            urlRequest.httpBody = try? JSONEncoder().encode(AnyEncodable(encodableBody))
        }
        
        let startTime = Date()
        analyticsManager.logNetworkRequest(request)

        do {
            let (data, response) = try await session.data(for: urlRequest)
            let responseTime = Date().timeIntervalSince(startTime)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                self.analyticsManager.logNetworkResponse(
                    url: request.path.rawValue,
                    statusCode: -1,
                    responseTime: responseTime,
                    dataSize: nil
                )
                self.analyticsManager.logError(
                    NetworkError.serverError(status: -1),
                    context: "NetworkManager.performAsync",
                    additionalInfo: ["error": "Invalid response"]
                )
                throw NetworkError.serverError(status: -1)
            }
            
            // Log response
            self.analyticsManager.logNetworkResponse(
                url: request.path.rawValue,
                statusCode: httpResponse.statusCode,
                responseTime: responseTime,
                dataSize: data.count
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
                url: request.path.rawValue,
                statusCode: -1,
                responseTime: responseTime,
                dataSize: nil
            )
            self.analyticsManager.logError(
                NetworkError.unknown(error),
                context: "NetworkManager.performAsync",
                additionalInfo: ["error": "Unknown error"]
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
        
        var req = URLRequest(url: baseURL.appendingPathComponent("auth/refresh"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(refreshToken)", forHTTPHeaderField: "Authorization")
        
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
        
        var req = URLRequest(url: baseURL.appendingPathComponent("auth/refresh"))
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("Bearer \(refreshToken)", forHTTPHeaderField: "Authorization")
        
        let (data, _) = try await session.data(for: req)
        let json = try JSONDecoder().decode(Token.self, from: data)
        tokenStorage.save(token: json)
    }
}
