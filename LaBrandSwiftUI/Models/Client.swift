//
//  Client.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation

// MARK: - Client

struct Client: Codable {
    let id: Int
    var email: String
    var fullName: String
    var imageUrl: String?
    var phoneNumber: String?
    var addressLine1: String?
    var addressLine2: String?
    var city: String?
    var state: String?
    var postalCode: String?
    var country: String?
    
    // MARK: - CodingKeys
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case fullName = "full_name"
        case imageUrl = "image_url"
        case phoneNumber = "phone_number"
        case addressLine1 = "address_line1"
        case addressLine2 = "address_line2"
        case city
        case state
        case postalCode = "postal_code"
        case country
    }
}


// MARK: - RegisterRequest

struct ClientCreate: Encodable {
    let fullName: String
    let email: String
    let password: String

    enum CodingKeys: String, CodingKey {
        case fullName = "full_name"
        case email
        case password
    }
}

struct RegisterRequest: APIRequest {
    typealias Response = Client
    let model: ClientCreate

    var path: APIEndpoint { .register }
    var method: HTTPMethod { .post }
    var requiresAuth: Bool { false }
    var body: Encodable? { model }
}

// MARK: - LoginRequest

struct LoginRequest: APIRequest {
    typealias Response = Token
    let model: [String: String]

    var path: APIEndpoint { .login }
    var method: HTTPMethod { .post }
    var requiresAuth: Bool { false }
    var body: Encodable? { model }
}