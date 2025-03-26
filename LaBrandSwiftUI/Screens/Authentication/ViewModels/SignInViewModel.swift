import SwiftUI

@MainActor
class SignInViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""
    @Published var showForgotPassword = false
    @Published var showSignUp = false
    
    private var authManager: AuthenticationManager?
    
    func inject(authManager: AuthenticationManager) {
        self.authManager = authManager
    }
    
    func signIn() async {
        guard let authManager = authManager else { return }
        
        isLoading = true
        do {
            try await authManager.signIn(email: email, password: password)
        } catch let error as AuthenticationManager.AuthError {
            showError = true
            errorMessage = error.message
        } catch {
            showError = true
            errorMessage = "An unexpected error occurred"
        }
        isLoading = false
    }
    
    func signInWithGoogle() {
        // TODO: Implement Google Sign In
        print("Google sign in tapped")
    }
    
    func signInWithFacebook() {
        // TODO: Implement Facebook Sign In
        print("Facebook sign in tapped")
    }
} 