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
}

extension APIRequest {
    var requiresAuth: Bool { true }
    var body: Encodable? { nil }
}
