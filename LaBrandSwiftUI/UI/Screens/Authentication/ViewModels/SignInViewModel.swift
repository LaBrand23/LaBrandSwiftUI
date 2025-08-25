import SwiftUI

@MainActor
final class SignInViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""
    @Published var showForgotPassword = false
    @Published var showSignUp = false

    private var authService: AuthNetworkServiceProtocol
    private var analyticsManager = AnalyticsManager.shared
    private var tokenStorage = TokenStorage(storageManager: KeychainManager.shared)
    private var clientStorage: UserStorage = UserStorage()

    // Dependency injection for testability and flexibility
    init(authService: AuthNetworkServiceProtocol = AuthNetworkService()) {
        self.authService = authService
    }

    func inject(authService: AuthNetworkServiceProtocol) {
        self.authService = authService
    }

    func signIn() async {
        isLoading = true
        defer { isLoading = false }
        do {
            guard !email.isEmpty, !password.isEmpty else {
                showError = true
                errorMessage = "Email and password must not be empty."
                return
            }
            
            let token = try await authService.login(email: email, password: password)
            tokenStorage.save(token: token)
            analyticsManager.logEvent(.userLogin, name: "Login Success", model: token, level: .info)
            
        } catch let error as NetworkError {
            showError = true
            errorMessage = error.localizedDescription
            analyticsManager.logError(
                error,
                context: "SignInViewModel.signIn",
                additionalInfo: ["email": email]
            )
        } catch {
            showError = true
            errorMessage = "An unexpected error occurred"
            analyticsManager.logError(
                error,
                context: "SignInViewModel.signIn",
                additionalInfo: ["email": email, "error": "An unexpected error occurred"]
            )      
        }
    }

    func getClient() async {
        do {
            let client = try await authService.loginByToken()
            clientStorage.createClient(client: client)
        } catch let error as NetworkError {
            analyticsManager.logError(
                error,
                context: "SignInViewModel.getClient",
                additionalInfo: ["error": error.localizedDescription]
            )
            showError = true
            errorMessage = error.localizedDescription
        } catch {
            analyticsManager.logError(
                error,
                context: "SignInViewModel.getClient",
                additionalInfo: ["error": "An unexpected error occurred"]
            )
            showError = true
            errorMessage = "An unexpected error occurred"
        }
    }

    func signInWithGoogle() {
        // TODO: Implement Google Sign In
        analyticsManager.logEvent(.featureUsage, name: "GoogleSignInTapped")
    }

    func signInWithFacebook() {
        // TODO: Implement Facebook Sign In
        analyticsManager.logEvent(.featureUsage, name: "FacebookSignInTapped")
    }
}
