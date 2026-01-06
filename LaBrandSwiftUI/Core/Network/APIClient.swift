//
//  APIClient.swift
//  LaBrandSwiftUI
//
//  Generic API client for making HTTP requests
//

import Foundation
import FirebaseAuth

// MARK: - HTTP Method
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
    case patch = "PATCH"
}

// MARK: - API Error
enum APIError: LocalizedError {
    case invalidURL
    case invalidResponse
    case unauthorized
    case forbidden
    case notFound
    case serverError(String)
    case decodingError(Error)
    case networkError(Error)
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .unauthorized:
            return "Please sign in to continue"
        case .forbidden:
            return "You don't have permission to access this resource"
        case .notFound:
            return "Resource not found"
        case .serverError(let message):
            return message
        case .decodingError(let error):
            return "Failed to process response: \(error.localizedDescription)"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        case .unknown:
            return "An unknown error occurred"
        }
    }
}

// MARK: - API Response
struct APIResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: T?
    let error: String?
    let message: String?
}

struct PaginatedResponse<T: Decodable>: Decodable {
    let success: Bool
    let data: [T]?
    let error: String?
    let pagination: Pagination?
    
    struct Pagination: Decodable {
        let page: Int
        let limit: Int
        let total: Int
        let totalPages: Int
        let hasNext: Bool
        let hasPrev: Bool
    }
}

// MARK: - API Client
actor APIClient {
    static let shared = APIClient()
    
    private let session: URLSession
    private let decoder: JSONDecoder
    private let encoder: JSONEncoder
    
    private init() {
        let config = URLSessionConfiguration.default
        config.timeoutIntervalForRequest = NetworkConfig.requestTimeout
        config.timeoutIntervalForResource = NetworkConfig.resourceTimeout
        self.session = URLSession(configuration: config)
        
        self.decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        
        self.encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        encoder.dateEncodingStrategy = .iso8601
    }
    
    // MARK: - Request Methods
    
    /// Make a request and decode response
    func request<T: Decodable>(
        _ endpoint: String,
        method: HTTPMethod = .get,
        body: Encodable? = nil,
        queryItems: [URLQueryItem]? = nil,
        requiresAuth: Bool = false
    ) async throws -> T {
        let request = try await buildRequest(
            endpoint: endpoint,
            method: method,
            body: body,
            queryItems: queryItems,
            requiresAuth: requiresAuth
        )
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        try handleStatusCode(httpResponse.statusCode, data: data)
        
        do {
            let apiResponse = try decoder.decode(APIResponse<T>.self, from: data)
            if apiResponse.success, let responseData = apiResponse.data {
                return responseData
            } else if let error = apiResponse.error {
                throw APIError.serverError(error)
            }
            throw APIError.invalidResponse
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.decodingError(error)
        }
    }
    
    /// Make a request and return array with pagination
    func requestPaginated<T: Decodable>(
        _ endpoint: String,
        method: HTTPMethod = .get,
        queryItems: [URLQueryItem]? = nil,
        requiresAuth: Bool = false
    ) async throws -> (items: [T], pagination: PaginatedResponse<T>.Pagination?) {
        let request = try await buildRequest(
            endpoint: endpoint,
            method: method,
            body: nil,
            queryItems: queryItems,
            requiresAuth: requiresAuth
        )
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        try handleStatusCode(httpResponse.statusCode, data: data)
        
        do {
            let apiResponse = try decoder.decode(PaginatedResponse<T>.self, from: data)
            if apiResponse.success {
                return (apiResponse.data ?? [], apiResponse.pagination)
            } else if let error = apiResponse.error {
                throw APIError.serverError(error)
            }
            throw APIError.invalidResponse
        } catch let error as APIError {
            throw error
        } catch {
            throw APIError.decodingError(error)
        }
    }
    
    /// Make a request without expecting a response body
    func requestVoid(
        _ endpoint: String,
        method: HTTPMethod,
        body: Encodable? = nil,
        requiresAuth: Bool = true
    ) async throws {
        let request = try await buildRequest(
            endpoint: endpoint,
            method: method,
            body: body,
            queryItems: nil,
            requiresAuth: requiresAuth
        )
        
        let (data, response) = try await session.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.invalidResponse
        }
        
        try handleStatusCode(httpResponse.statusCode, data: data)
    }
    
    // MARK: - Private Helpers
    
    private func buildRequest(
        endpoint: String,
        method: HTTPMethod,
        body: Encodable?,
        queryItems: [URLQueryItem]?,
        requiresAuth: Bool
    ) async throws -> URLRequest {
        guard var urlComponents = URLComponents(string: "\(NetworkConfig.apiBaseURL)\(endpoint)") else {
            throw APIError.invalidURL
        }
        
        if let queryItems = queryItems, !queryItems.isEmpty {
            urlComponents.queryItems = queryItems
        }
        
        guard let url = urlComponents.url else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = method.rawValue
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        
        // Add auth token if required
        if requiresAuth {
            if let token = try? await Auth.auth().currentUser?.getIDToken() {
                request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            } else {
                throw APIError.unauthorized
            }
        }
        
        if let body = body {
            request.httpBody = try encoder.encode(AnyEncodable(body))
        }
        
        return request
    }
    
    private func handleStatusCode(_ statusCode: Int, data: Data) throws {
        switch statusCode {
        case 200...299:
            return
        case 401:
            throw APIError.unauthorized
        case 403:
            throw APIError.forbidden
        case 404:
            throw APIError.notFound
        case 400...499:
            if let response = try? decoder.decode(APIResponse<String>.self, from: data) {
                throw APIError.serverError(response.error ?? "Request failed")
            }
            throw APIError.serverError("Request failed with status \(statusCode)")
        case 500...599:
            throw APIError.serverError("Server error. Please try again later.")
        default:
            throw APIError.unknown
        }
    }
}

// MARK: - Type Erasing Encodable
private struct AnyEncodable: Encodable {
    private let encode: (Encoder) throws -> Void
    
    init<T: Encodable>(_ value: T) {
        self.encode = { encoder in
            try value.encode(to: encoder)
        }
    }
    
    func encode(to encoder: Encoder) throws {
        try encode(encoder)
    }
}

