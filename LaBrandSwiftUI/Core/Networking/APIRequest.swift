//
//  APIRequest.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation

public protocol APIRequest {
    associatedtype Response: Decodable
    var path: APIEndpoint { get }
    var method: HTTPMethod { get }
    var requiresAuth: Bool { get }
    var body: Encodable? { get }
    var queryParameters: [String: String]? { get }
    var customPath: String? { get }
}

extension APIRequest {
    var requiresAuth: Bool { true }
    var body: Encodable? { nil }
    var queryParameters: [String: String]? { nil }
    var customPath: String? { nil }
}
