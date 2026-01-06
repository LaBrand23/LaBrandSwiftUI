//
//  AuthenticationManager.swift
//  LaBrandSwiftUI
//
//  Manages Firebase Authentication state
//

import SwiftUI
import Combine
import FirebaseAuth

// MARK: - App User Model
struct AppUser: Identifiable, Codable {
    let id: String
    let email: String?
    let phone: String?
    var fullName: String?
    var avatarUrl: String?
    var role: String
    var addresses: [APIAddress]
    
    init(from apiUser: APIUser) {
        self.id = apiUser.id
        self.email = apiUser.email
        self.phone = apiUser.phone
        self.fullName = apiUser.fullName
        self.avatarUrl = apiUser.avatarUrl
        self.role = apiUser.role
        self.addresses = apiUser.addresses
    }
    
    init(from firebaseUser: FirebaseAuth.User) {
        self.id = firebaseUser.uid
        self.email = firebaseUser.email
        self.phone = firebaseUser.phoneNumber
        self.fullName = firebaseUser.displayName
        self.avatarUrl = firebaseUser.photoURL?.absoluteString
        self.role = "client"
        self.addresses = []
    }
}

// MARK: - Auth Error
enum AuthError: LocalizedError {
    case invalidCredentials
    case networkError(Error)
    case invalidEmail
    case weakPassword
    case emailAlreadyInUse
    case userNotFound
    case wrongPassword
    case tooManyRequests
    case unknown(Error)
    
    var errorDescription: String? {
        switch self {
        case .invalidCredentials:
            return "Invalid email or password"
        case .networkError:
            return "Network error occurred. Please try again."
        case .invalidEmail:
            return "Please enter a valid email address"
        case .weakPassword:
            return "Password must be at least 8 characters"
        case .emailAlreadyInUse:
            return "This email is already registered"
        case .userNotFound:
            return "No account found with this email"
        case .wrongPassword:
            return "Incorrect password"
        case .tooManyRequests:
            return "Too many attempts. Please try again later."
        case .unknown(let error):
            return error.localizedDescription
        }
    }
}

// MARK: - Authentication Manager
@MainActor
class AuthenticationManager: ObservableObject {
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var currentUser: AppUser?
    @Published var authError: AuthError?
    
    private var authStateHandler: AuthStateDidChangeListenerHandle?
    
    init() {
        setupAuthStateListener()
    }
    
    deinit {
        if let handler = authStateHandler {
            Auth.auth().removeStateDidChangeListener(handler)
        }
    }
    
    // MARK: - Auth State Listener
    private func setupAuthStateListener() {
        authStateHandler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            Task { @MainActor in
                self?.isAuthenticated = user != nil
                if let user = user {
                    // Create basic user from Firebase
                    self?.currentUser = AppUser(from: user)
                    // Fetch full profile from backend
                    await self?.fetchUserProfile()
                } else {
                    self?.currentUser = nil
                }
            }
        }
    }
    
    // MARK: - Fetch User Profile
    private func fetchUserProfile() async {
        do {
            let apiUser = try await UserAPI.getProfile()
            self.currentUser = AppUser(from: apiUser)
        } catch {
            // Profile fetch failed, but user is still authenticated
            print("Failed to fetch user profile: \(error)")
        }
    }
    
    // MARK: - Sign In
    func signIn(email: String, password: String) async throws {
        guard !email.isEmpty, !password.isEmpty else {
            throw AuthError.invalidCredentials
        }
        
        isLoading = true
        authError = nil
        
        do {
            let result = try await Auth.auth().signIn(withEmail: email, password: password)
            currentUser = AppUser(from: result.user)
            isAuthenticated = true
            await fetchUserProfile()
        } catch let error as NSError {
            let authError = mapFirebaseError(error)
            self.authError = authError
            throw authError
        }
        
        isLoading = false
    }
    
    // MARK: - Sign Up
    func signUp(email: String, password: String, fullName: String? = nil) async throws {
        guard email.contains("@") else {
            throw AuthError.invalidEmail
        }
        
        guard password.count >= 8 else {
            throw AuthError.weakPassword
        }
        
        isLoading = true
        authError = nil
        
        do {
            let result = try await Auth.auth().createUser(withEmail: email, password: password)
            
            // Update display name if provided
            if let fullName = fullName {
                let changeRequest = result.user.createProfileChangeRequest()
                changeRequest.displayName = fullName
                try await changeRequest.commitChanges()
            }
            
            currentUser = AppUser(from: result.user)
            isAuthenticated = true
            await fetchUserProfile()
        } catch let error as NSError {
            let authError = mapFirebaseError(error)
            self.authError = authError
            throw authError
        }
        
        isLoading = false
    }
    
    // MARK: - Sign Out
    func signOut() {
        do {
            try Auth.auth().signOut()
            isAuthenticated = false
            currentUser = nil
        } catch {
            print("Sign out error: \(error)")
        }
    }
    
    // MARK: - Reset Password
    func resetPassword(email: String) async throws {
        guard email.contains("@") else {
            throw AuthError.invalidEmail
        }
        
        isLoading = true
        authError = nil
        
        do {
            try await Auth.auth().sendPasswordReset(withEmail: email)
        } catch let error as NSError {
            let authError = mapFirebaseError(error)
            self.authError = authError
            throw authError
        }
        
        isLoading = false
    }
    
    // MARK: - Update Profile
    func updateProfile(fullName: String?, phone: String?, avatarUrl: String?) async throws {
        isLoading = true
        
        do {
            // Update Firebase display name
            if let fullName = fullName, let user = Auth.auth().currentUser {
                let changeRequest = user.createProfileChangeRequest()
                changeRequest.displayName = fullName
                try await changeRequest.commitChanges()
            }
            
            // Update backend profile
            let input = UpdateProfileInput(
                fullName: fullName,
                phone: phone,
                avatarUrl: avatarUrl
            )
            let updatedUser = try await UserAPI.updateProfile(input: input)
            self.currentUser = AppUser(from: updatedUser)
        } catch {
            throw error
        }
        
        isLoading = false
    }
    
    // MARK: - Helper Methods
    private func mapFirebaseError(_ error: NSError) -> AuthError {
        let errorCode = AuthErrorCode(rawValue: error.code)
        
        switch errorCode {
        case .invalidEmail:
            return .invalidEmail
        case .wrongPassword:
            return .wrongPassword
        case .userNotFound:
            return .userNotFound
        case .emailAlreadyInUse:
            return .emailAlreadyInUse
        case .weakPassword:
            return .weakPassword
        case .tooManyRequests:
            return .tooManyRequests
        case .networkError:
            return .networkError(error)
        default:
            return .unknown(error)
        }
    }
    
    // MARK: - Check if user is signed in
    var isUserSignedIn: Bool {
        Auth.auth().currentUser != nil
    }
    
    // MARK: - Get current Firebase user
    var firebaseUser: FirebaseAuth.User? {
        Auth.auth().currentUser
    }
}
