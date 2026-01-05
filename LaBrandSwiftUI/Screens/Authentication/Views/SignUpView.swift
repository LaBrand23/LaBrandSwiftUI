//
//  SignUpView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct SignUpView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = SignUpViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Close Button
                HStack {
                    Spacer()
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundStyle(Color(hex: "666666"))
                            .frame(width: 40, height: 40)
                    }
                }
                .padding(.top, 16)
                
                // Header
                headerSection
                    .padding(.top, 20)
                
                // Form Fields
                formSection
                    .padding(.top, 40)
                
                // Sign Up Button
                PrimaryAuthButton(
                    title: "Create Account",
                    isLoading: viewModel.isLoading,
                    action: {
                        Task { await viewModel.signUp() }
                    }
                )
                .padding(.top, 32)
                .opacity(hasAppeared ? 1 : 0)
                .offset(y: hasAppeared ? 0 : 20)
                .animation(.easeOut(duration: 0.5).delay(0.4), value: hasAppeared)
                
                // Terms
                termsSection
                    .padding(.top, 20)
                
                // Divider with text
                dividerSection
                    .padding(.top, 28)
                
                // Social Sign Up
                socialSection
                    .padding(.top, 24)
                
                Spacer(minLength: 40)
                
                // Sign In Prompt
                signInPrompt
                    .padding(.bottom, 32)
            }
            .padding(.horizontal, 24)
        }
        .background(Color(hex: "FAFAFA"))
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension SignUpView {
    
    var headerSection: some View {
        VStack(spacing: 16) {
            // Brand
            Text("LABRAND")
                .font(.custom("Georgia", size: 28))
                .fontWeight(.medium)
                .tracking(8)
                .foregroundStyle(Color(hex: "1A1A1A"))
            
            // Decorative line
            Rectangle()
                .fill(Color(hex: "C4A77D"))
                .frame(width: 40, height: 2)
            
            // Title
            Text("Create Account")
                .font(.custom("Georgia", size: 24))
                .fontWeight(.regular)
                .foregroundStyle(Color(hex: "1A1A1A"))
                .padding(.top, 24)
            
            Text("Join our exclusive fashion community")
                .font(.system(size: 14))
                .foregroundStyle(Color(hex: "666666"))
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : -20)
        .animation(.easeOut(duration: 0.6), value: hasAppeared)
    }
    
    var formSection: some View {
        VStack(spacing: 16) {
            AuthTextField(
                text: $viewModel.name,
                placeholder: "Full Name",
                icon: "person",
                textContentType: .name,
                autocapitalization: .words
            )
            
            AuthTextField(
                text: $viewModel.email,
                placeholder: "Email Address",
                icon: "envelope",
                keyboardType: .emailAddress,
                textContentType: .emailAddress
            )
            
            AuthSecureField(
                text: $viewModel.password,
                placeholder: "Password",
                icon: "lock",
                textContentType: .newPassword
            )
            
            AuthSecureField(
                text: $viewModel.confirmPassword,
                placeholder: "Confirm Password",
                icon: "lock",
                textContentType: .newPassword
            )
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
    }
    
    var termsSection: some View {
        Text("By creating an account, you agree to our ")
            .foregroundStyle(Color(hex: "999999"))
        +
        Text("Terms of Service")
            .foregroundStyle(Color(hex: "1A1A1A"))
        +
        Text(" and ")
            .foregroundStyle(Color(hex: "999999"))
        +
        Text("Privacy Policy")
            .foregroundStyle(Color(hex: "1A1A1A"))
    }
    
    var dividerSection: some View {
        HStack(spacing: 16) {
            Rectangle()
                .fill(Color(hex: "E8E8E8"))
                .frame(height: 1)
            
            Text("OR")
                .font(.system(size: 11, weight: .medium))
                .tracking(2)
                .foregroundStyle(Color(hex: "999999"))
            
            Rectangle()
                .fill(Color(hex: "E8E8E8"))
                .frame(height: 1)
        }
        .opacity(hasAppeared ? 1 : 0)
        .animation(.easeOut(duration: 0.5).delay(0.5), value: hasAppeared)
    }
    
    var socialSection: some View {
        VStack(spacing: 16) {
            Text("Sign up with")
                .font(.system(size: 13))
                .foregroundStyle(Color(hex: "666666"))
            
            HStack(spacing: 20) {
                SocialAuthButton(provider: .google, action: viewModel.signUpWithGoogle)
                SocialAuthButton(provider: .facebook, action: viewModel.signUpWithFacebook)
                SocialAuthButton(provider: .apple, action: {})
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .animation(.easeOut(duration: 0.5).delay(0.6), value: hasAppeared)
    }
    
    var signInPrompt: some View {
        HStack(spacing: 4) {
            Text("Already have an account?")
                .font(.system(size: 14))
                .foregroundStyle(Color(hex: "666666"))
            
            Button {
                dismiss()
            } label: {
                Text("Sign In")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color(hex: "1A1A1A"))
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .animation(.easeOut(duration: 0.5).delay(0.7), value: hasAppeared)
    }
}

// MARK: - ViewModel
class SignUpViewModel: ObservableObject {
    @Published var name = ""
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""
    
    func signUp() async {
        guard validate() else { return }
        
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }
        
        do {
            // TODO: Implement actual sign up
            try await Task.sleep(nanoseconds: 1_000_000_000)
        } catch {
            await MainActor.run {
                showError = true
                errorMessage = error.localizedDescription
            }
        }
    }
    
    func signUpWithGoogle() {
        // TODO: Implement Google sign up
    }
    
    func signUpWithFacebook() {
        // TODO: Implement Facebook sign up
    }
    
    private func validate() -> Bool {
        guard !name.isEmpty else {
            showError = true
            errorMessage = "Please enter your name"
            return false
        }
        
        guard !email.isEmpty else {
            showError = true
            errorMessage = "Please enter your email"
            return false
        }
        
        guard email.contains("@") else {
            showError = true
            errorMessage = "Please enter a valid email"
            return false
        }
        
        guard !password.isEmpty else {
            showError = true
            errorMessage = "Please enter your password"
            return false
        }
        
        guard password == confirmPassword else {
            showError = true
            errorMessage = "Passwords do not match"
            return false
        }
        
        guard password.count >= 8 else {
            showError = true
            errorMessage = "Password must be at least 8 characters"
            return false
        }
        
        return true
    }
}

// MARK: - Preview
#Preview {
    SignUpView()
}
