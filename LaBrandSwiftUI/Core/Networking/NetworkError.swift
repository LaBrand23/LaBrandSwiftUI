//
//  NetworkError.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation

enum NetworkError: Error {
    case invalidURL
    case decodingError
    case unauthorized
    case refreshFailed
    case serverError(status: Int)
    case unknown(Error)

    var localizedDescription: String {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .decodingError:
            return "Decoding error"
        case .unauthorized:
            return "Unauthorized"
        case .refreshFailed:
            return "Refresh failed"
        case .serverError(let status):
            return "Server error: \(status)"
        case .unknown(let error):
            return "Unknown error: \(error.localizedDescription)"
        }
    }
}
