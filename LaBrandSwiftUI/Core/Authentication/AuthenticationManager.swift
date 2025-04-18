import SwiftUI
import Combine

class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    @Published var authError: AuthError?
    
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
    
    func signIn(email: String, password: String) async throws {
        // TODO: Implement actual authentication
        if email.isEmpty || password.isEmpty {
            DispatchQueue.main.async {
                self.authError = .invalidCredentials
            }
            throw AuthError.invalidCredentials
        }
        
        // Simulate network request
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        DispatchQueue.main.async {
            self.isAuthenticated = true
            self.currentUser = User(id: UUID(), email: email)
        }
    }
    
    func signUp(email: String, password: String) async throws {
        // Validate input
        guard email.contains("@") else {
            DispatchQueue.main.async {
                self.authError = .invalidEmail
            }
            throw AuthError.invalidEmail
        }
        
        guard password.count >= 8 else {
            DispatchQueue.main.async {
                self.authError = .weakPassword
            }
            throw AuthError.weakPassword
        }
        
        // Simulate network request
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        DispatchQueue.main.async {
            self.isAuthenticated = true
            self.currentUser = User(id: UUID(), email: email)
        }
    }
    
    func signOut() {
        isAuthenticated = false
        currentUser = nil
    }
    
    func resetPassword(email: String) async throws {
        // TODO: Implement password reset
        guard email.contains("@") else {
            DispatchQueue.main.async {
                self.authError = .invalidEmail
            }
            throw AuthError.invalidEmail
        }
        
        // Simulate network request
        try await Task.sleep(nanoseconds: 1_000_000_000)
    }
}

struct User: Identifiable {
    let id: UUID
    let email: String
} 