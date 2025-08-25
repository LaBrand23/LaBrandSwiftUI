//
//  SignUpViewModel.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//
import SwiftUI
import Combine

// MARK: - SignUpViewModel

@MainActor
final class SignUpViewModel: ObservableObject {
    
    // MARK: - Dependencies
    private let authService: AuthNetworkServiceProtocol
    private let clientStorage = UserStorage()
    private let analyticsManager: AnalyticsManager
    private let validator: SignUpValidator
    
    // MARK: - Published Properties
    @Published private(set) var state: SignUpState = .idle
    @Published var formData = SignUpFormData()
    @Published private(set) var validationState = ValidationState()
    
    // MARK: - Private Properties
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    init(
        authService: AuthNetworkServiceProtocol = AuthNetworkService(),
        analyticsManager: AnalyticsManager = .shared,
        validator: SignUpValidator = SignUpValidator(),
    ) {
        self.authService = authService
        self.analyticsManager = analyticsManager
        self.validator = validator
        
        setupBindings()
        setupAnalytics()

        #if DEBUG
        formData = makeMockClient()
        #endif
    }
    
    // MARK: - Public Methods
    
    func signUp() async {
        guard case .idle = state else { return }
        
        do {
            try await performSignUp()
        } catch {
            await handleSignUpError(error)
        }
    }
    
    func signUpWithGoogle() {
        analyticsManager.logButtonTap("sign_up_google", screen: "SignUp")
        analyticsManager.logUserAction("social_signup_attempt", parameters: ["provider": "google"])
        
        // TODO: Implement Google sign up
        state = .error(.init(message: "Google sign up is not implemented yet", type: .featureNotAvailable))
    }
    
    func signUpWithFacebook() {
        analyticsManager.logButtonTap("sign_up_facebook", screen: "SignUp")
        analyticsManager.logUserAction("social_signup_attempt", parameters: ["provider": "facebook"])
        
        // TODO: Implement Facebook sign up
        state = .error(.init(message: "Facebook sign up is not implemented yet", type: .featureNotAvailable))
    }
    
    func validateField(_ field: ValidationField) {
        let errors = validator.validateField(field, in: formData)
        validationState.updateErrors(for: field, errors: errors)
    }
    
    func clearValidationErrors() {
        validationState.clearErrors()
    }
    
    func clearForm() {
        formData = SignUpFormData()
        validationState = ValidationState()
        state = .idle
    }
    
    // MARK: - Debug Methods
    func debugValidation() {
        print("🔍 DEBUG VALIDATION:")
        print("  FormData: \(formData)")
        print("  ValidationState: \(validationState)")
        print("  State: \(state)")
        
        let allErrors = validator.validateAllFields(in: formData)
        print("  Validation Errors: \(allErrors.count)")
        for error in allErrors {
            print("    - \(error.field.rawValue): \(error.message)")
        }
    }
    
    // MARK: - Private Methods
    
    private func setupBindings() {
        // Real-time validation using the published formData
        $formData
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .map { [weak self] formData in
                return self?.validator.validateAllFields(in: formData).isEmpty ?? false
            }
            .receive(on: DispatchQueue.main)
            .assign(to: \.validationState.isFormValid, on: self)
            .store(in: &cancellables)
    }
    
    private func setupAnalytics() {
        analyticsManager.logScreenView("SignUp")
        analyticsManager.logEvent(.viewAppear, name: "SignUp Screen", level: .debug)
    }
    
    private func performSignUp() async throws {
        state = .loading
        
        analyticsManager.logButtonTap("sign_up", screen: "SignUp")
        analyticsManager.logUserAction("signup_attempt", parameters: [
            "email_domain": formData.emailDomain,
            "has_phone": !formData.phoneNumber.isEmpty ? "true" : "false",
            "accepts_marketing": formData.acceptMarketing ? "true" : "false"
        ])
        
        let startTime = Date()
        
        let client = try await authService.register(
            fullName: formData.fullName.trimmingCharacters(in: .whitespacesAndNewlines),
            email: formData.email.trimmingCharacters(in: .whitespacesAndNewlines).lowercased(),
            password: formData.password
        )
        
        let responseTime = Date().timeIntervalSince(startTime)
        
        // Log successful registration
        analyticsManager.logPerformanceMetric(name: "signup_response_time", value: responseTime * 1000, unit: "ms")
        analyticsManager.logEvent(.userRegistration, name: "Registration Success", parameters: [
            "user_id": String(client.id),
            "email_domain": formData.emailDomain,
            "response_time": String(format: "%.3f", responseTime)
        ])
        
        state = .success(.init(
            message: "Welcome, \(client.fullName)! Your account has been created successfully.",
            client: client
        ))

        clientStorage.createClient(client: client)
    }
    
    private func handleSignUpError(_ error: Error) async {
        let signUpError = SignUpError.from(error)
        
        analyticsManager.logError(error, context: "SignUp", additionalInfo: signUpError.analyticsParameters)
        analyticsManager.logEvent(.userRegistration, name: "Registration Failed", parameters: signUpError.analyticsParameters, level: .error)
        
        state = .error(signUpError)
    }
    
    private func makeMockClient() -> SignUpFormData {
        return SignUpFormData(
            fullName: "John Doe \(Int.random(in: 1...1000000))",
            email: "shaxzod\(Int.random(in: 1...1000000))@example.com",
            password: "Password123!",
            confirmPassword: "Password123!",
            phoneNumber: "+998901234567",
            acceptTerms: true,
            acceptMarketing: true
        )
    }
}

// MARK: - SignUpState

enum SignUpState: Equatable {
    case idle
    case loading
    case success(SignUpSuccess)
    case error(SignUpError)
    
    var isLoading: Bool {
        if case .loading = self { return true }
        return false
    }
    
    var isSuccess: Bool {
        if case .success = self { return true }
        return false
    }
    
    var isError: Bool {
        if case .error = self { return true }
        return false
    }
}

// MARK: - SignUpFormData

struct SignUpFormData: Equatable {
    var fullName = ""
    var email = ""
    var password = ""
    var confirmPassword = ""
    var phoneNumber = ""
    var acceptTerms = false
    var acceptMarketing = false
    
    var emailDomain: String {
        let components = email.components(separatedBy: "@")
        return components.count > 1 ? components[1] : "unknown"
    }
}

// MARK: - ValidationState

@MainActor
final class ValidationState: ObservableObject {
    @Published var errors: [ValidationError] = []
    @Published var isFormValid = false
    
    func updateErrors(for field: ValidationField, errors: [ValidationError]) {
        self.errors.removeAll { $0.field == field }
        self.errors.append(contentsOf: errors)
    }
    
    func clearErrors() {
        errors.removeAll()
    }
}

// MARK: - SignUpSuccess

struct SignUpSuccess: Equatable {
    let message: String
    let client: Client
    
    static func == (lhs: SignUpSuccess, rhs: SignUpSuccess) -> Bool {
        return lhs.message == rhs.message && lhs.client.id == rhs.client.id
    }
}

// MARK: - SignUpError

struct SignUpError: Equatable, LocalizedError {
    let message: String
    let type: ErrorType
    
    enum ErrorType: String, CaseIterable {
        case networkError = "network_error"
        case serverError = "server_error"
        case validationError = "validation_error"
        case featureNotAvailable = "feature_not_available"
        case unknown = "unknown"
    }
    
    var errorDescription: String? { message }
    
    var analyticsParameters: [String: String] {
        ["error_type": type.rawValue, "error_message": message]
    }
    
    static func from(_ error: Error) -> SignUpError {
        if let networkError = error as? NetworkError {
            return SignUpError.from(networkError)
        }
        
        return SignUpError(
            message: error.localizedDescription,
            type: .unknown
        )
    }
    
    private static func from(_ networkError: NetworkError) -> SignUpError {
        switch networkError {
        case .invalidURL:
            return SignUpError(message: "Invalid URL. Please try again.", type: .serverError)
        case .serverError(let statusCode):
            return SignUpError(message: "Server error (\(statusCode)). Please try again later.", type: .serverError)
        case .decodingError:
            return SignUpError(message: "Data processing error. Please try again.", type: .serverError)
        case .unauthorized:
            return SignUpError(message: "Unauthorized. Please check your credentials.", type: .validationError)
        case .refreshFailed:
            return SignUpError(message: "Authentication refresh failed. Please sign in again.", type: .validationError)
        case .unknown(let error):
            return SignUpError(message: "An unexpected error occurred: \(error.localizedDescription)", type: .unknown)
        }
    }
}

// MARK: - SignUpValidator

final class SignUpValidator {
    
    // MARK: - Validation Properties
    private let emailRegex = #"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"#
    private let passwordRegex = #"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$"#
    
    // MARK: - Validation Methods
    
    func validateAllFields(in formData: SignUpFormData) -> [ValidationError] {
        var errors: [ValidationError] = []
        
        errors.append(contentsOf: validateField(.fullName, in: formData))
        errors.append(contentsOf: validateField(.email, in: formData))
        errors.append(contentsOf: validateField(.password, in: formData))
        errors.append(contentsOf: validateField(.confirmPassword, in: formData))
        errors.append(contentsOf: validateField(.phoneNumber, in: formData))
        errors.append(contentsOf: validateField(.terms, in: formData))
        
        return errors
    }
    
    func validateField(_ field: ValidationField, in formData: SignUpFormData) -> [ValidationError] {
        switch field {
        case .fullName:
            return validateFullName(formData.fullName)
        case .email:
            return validateEmail(formData.email)
        case .password:
            return validatePassword(formData.password)
        case .confirmPassword:
            return validateConfirmPassword(formData.password, confirmPassword: formData.confirmPassword)
        case .phoneNumber:
            return validatePhoneNumber(formData.phoneNumber)
        case .terms:
            return validateTerms(formData.acceptTerms)
        }
    }
    
    // MARK: - Private Validation Methods
    
    private func validateFullName(_ fullName: String) -> [ValidationError] {
        var errors: [ValidationError] = []
        
        if fullName.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            errors.append(ValidationError(field: .fullName, message: "Full name is required"))
        } else if fullName.trimmingCharacters(in: .whitespacesAndNewlines).count < 2 {
            errors.append(ValidationError(field: .fullName, message: "Full name must be at least 2 characters"))
        } else if fullName.trimmingCharacters(in: .whitespacesAndNewlines).count > 50 {
            errors.append(ValidationError(field: .fullName, message: "Full name must be less than 50 characters"))
        }
        
        return errors
    }
    
    private func validateEmail(_ email: String) -> [ValidationError] {
        var errors: [ValidationError] = []
        
        if email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            errors.append(ValidationError(field: .email, message: "Email is required"))
        } else if !isValidEmail(email) {
            errors.append(ValidationError(field: .email, message: "Please enter a valid email address"))
        }
        
        return errors
    }
    
    private func validatePassword(_ password: String) -> [ValidationError] {
        var errors: [ValidationError] = []
        
        if password.isEmpty {
            errors.append(ValidationError(field: .password, message: "Password is required"))
        } else if password.count < 8 {
            errors.append(ValidationError(field: .password, message: "Password must be at least 8 characters"))
        } else if !isValidPassword(password) {
            errors.append(ValidationError(field: .password, message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"))
        }
        
        return errors
    }
    
    private func validateConfirmPassword(_ password: String, confirmPassword: String) -> [ValidationError] {
        var errors: [ValidationError] = []
        
        if confirmPassword.isEmpty {
            errors.append(ValidationError(field: .confirmPassword, message: "Please confirm your password"))
        } else if password != confirmPassword {
            errors.append(ValidationError(field: .confirmPassword, message: "Passwords do not match"))
        }
        
        return errors
    }
    
    private func validatePhoneNumber(_ phoneNumber: String) -> [ValidationError] {
        var errors: [ValidationError] = []
        
        if !phoneNumber.isEmpty && !isValidPhoneNumber(phoneNumber) {
            errors.append(ValidationError(field: .phoneNumber, message: "Please enter a valid phone number"))
        }
        
        return errors
    }
    
    private func validateTerms(_ acceptTerms: Bool) -> [ValidationError] {
        var errors: [ValidationError] = []
        
        if !acceptTerms {
            errors.append(ValidationError(field: .terms, message: "You must accept the terms and conditions"))
        }
        
        return errors
    }
    
    // MARK: - Validation Helpers
    
    private func isValidEmail(_ email: String) -> Bool {
        let emailPredicate = NSPredicate(format: "SELF MATCHES %@", emailRegex)
        return emailPredicate.evaluate(with: email)
    }
    
    private func isValidPassword(_ password: String) -> Bool {
        let passwordPredicate = NSPredicate(format: "SELF MATCHES %@", passwordRegex)
        return passwordPredicate.evaluate(with: password)
    }
    
    private func isValidPhoneNumber(_ phoneNumber: String) -> Bool {
        let phoneRegex = #"^[\+]?[1-9][\d]{0,15}$"#
        let phonePredicate = NSPredicate(format: "SELF MATCHES %@", phoneRegex)
        return phonePredicate.evaluate(with: phoneNumber.replacingOccurrences(of: " ", with: ""))
    }
}

// MARK: - Validation Models

enum ValidationField: String, CaseIterable {
    case fullName = "full_name"
    case email = "email"
    case password = "password"
    case confirmPassword = "confirm_password"
    case phoneNumber = "phone_number"
    case terms = "terms"
}

struct ValidationError: Identifiable, Equatable {
    let id = UUID()
    let field: ValidationField
    let message: String
}
