//
//  AuthError.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//
import Foundation

enum AuthError: Error {
        case invalidCredentials
        case networkError
        case invalidEmail
        case weakPassword
        
        var message: String {
            switch self {
            case .invalidCredentials:
                return "Invalid email or password"
            case .networkError:
                return "Network error occurred"
            case .invalidEmail:
                return "Please enter a valid email"
            case .weakPassword:
                return "Password must be at least 8 characters"
            }
        }
    }
