//
//  SignUpView.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//
import SwiftUI

struct SignUpView: View {
    @StateObject private var viewModel = SignUpViewModel()
    @Environment(\.dismiss) private var dismiss
    
    // MARK: - Computed Properties
    
    private var errorMessage: String {
        if case .error(let error) = viewModel.state {
            return error.message
        }
        return "An error occurred"
    }
    
    private var successMessage: String {
        if case .success(let success) = viewModel.state {
            return success.message
        }
        return "Success"
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Input fields
                    VStack(spacing: 16) {
                        // Full Name
                        CustomTextField(
                            text: $viewModel.formData.fullName,
                            placeholder: "Full Name",
                            icon: "person"
                        )
                        .onChange(of: viewModel.formData.fullName) { _,_ in
                            viewModel.validateField(.fullName)
                        }
                        
                        // Email
                        CustomTextField(
                            text: $viewModel.formData.email,
                            placeholder: "Email",
                            icon: "envelope"
                        )
                        .textInputAutocapitalization(.never)
                        .keyboardType(.emailAddress)
                        .onChange(of: viewModel.formData.email) { _,_ in
                            viewModel.validateField(.email)
                        }
                        
                        // Password
                        CustomSecureField(
                            text: $viewModel.formData.password,
                            placeholder: "Password",
                            icon: "lock"
                        )
                        .onChange(of: viewModel.formData.password) { _,_ in
                            viewModel.validateField(.password)
                        }
                        
                        // Confirm Password
                        CustomSecureField(
                            text: $viewModel.formData.confirmPassword,
                            placeholder: "Confirm Password",
                            icon: "lock"
                        )
                        .onChange(of: viewModel.formData.confirmPassword) { _,_ in
                            viewModel.validateField(.confirmPassword)
                        }
                        
                        // Phone Number (Optional)
                        CustomTextField(
                            text: $viewModel.formData.phoneNumber,
                            placeholder: "Phone Number (Optional)",
                            icon: "phone"
                        )
                        .keyboardType(.phonePad)
                        .onChange(of: viewModel.formData.phoneNumber) { _,_ in
                            viewModel.validateField(.phoneNumber)
                        }
                    }
                    
                    // Validation Errors
                    if !viewModel.validationState.errors.isEmpty {
                        VStack(alignment: .leading, spacing: 8) {
                            ForEach(viewModel.validationState.errors) { error in
                                HStack(spacing: 8) {
                                    Image(systemName: "exclamationmark.triangle.fill")
                                        .foregroundColor(.orange)
                                        .font(.caption)
                                    
                                    Text(error.message)
                                        .font(.caption)
                                        .foregroundColor(.orange)
                                }
                                .frame(maxWidth: .infinity, alignment: .leading)
                            }
                        }
                        .padding(.horizontal)
                    }
                    
                    // Terms and Marketing
                    VStack(spacing: 12) {
                        // Terms and Conditions
                        HStack(alignment: .top, spacing: 12) {
                            Button {
                                viewModel.formData.acceptTerms.toggle()
                                viewModel.validateField(.terms)
                            } label: {
                                Image(systemName: viewModel.formData.acceptTerms ? "checkmark.square.fill" : "square")
                                    .foregroundColor(viewModel.formData.acceptTerms ? .red : .gray)
                                    .font(.title3)
                            }
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text("I agree to the ")
                                    .font(.caption)
                                    .foregroundColor(.secondary) +
                                Text("Terms of Service")
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .underline() +
                                Text(" and ")
                                    .font(.caption)
                                    .foregroundColor(.secondary) +
                                Text("Privacy Policy")
                                    .font(.caption)
                                    .foregroundColor(.red)
                                    .underline()
                            }
                        }
                        
                        // Marketing Preferences
                        HStack(alignment: .top, spacing: 12) {
                            Button {
                                viewModel.formData.acceptMarketing.toggle()
                            } label: {
                                Image(systemName: viewModel.formData.acceptMarketing ? "checkmark.square.fill" : "square")
                                    .foregroundColor(viewModel.formData.acceptMarketing ? .red : .gray)
                                    .font(.title3)
                            }
                            
                            Text("I would like to receive marketing communications about new products and offers")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal)
                    
                    // Sign up button
                    Button {
                        Task {
                            await viewModel.signUp()
                        }
                    } label: {
                        HStack {
                            if viewModel.state.isLoading {
                                ProgressView()
                                    .tint(.white)
                                    .scaleEffect(0.8)
                            } else {
                                Text("Create Account")
                                    .fontWeight(.semibold)
                            }
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                    }
                    .background(viewModel.validationState.isFormValid ? Color.red : Color.gray)
                    .cornerRadius(25)
                    .disabled(viewModel.state.isLoading || !viewModel.validationState.isFormValid)
                    
                    // Social sign up
                    VStack(spacing: 16) {
                        HStack {
                            Rectangle()
                                .frame(height: 1)
                                .foregroundColor(.gray.opacity(0.3))
                            
                            Text("Or continue with")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .padding(.horizontal, 16)
                            
                            Rectangle()
                                .frame(height: 1)
                                .foregroundColor(.gray.opacity(0.3))
                        }
                        
                        HStack(spacing: 20) {
                            SocialSignInButton(
                                image: "google",
                                title: "Google",
                                action: viewModel.signUpWithGoogle
                            )
                            
                            SocialSignInButton(
                                image: "facebook",
                                title: "Facebook",
                                action: viewModel.signUpWithFacebook
                            )
                        }
                    }
                    
                    Spacer(minLength: 20)
                    
                    // Sign in prompt
                    HStack {
                        Text("Already have an account?")
                            .foregroundColor(.secondary)
                        Button("Sign in") {
                            dismiss()
                        }
                        .foregroundColor(.red)
                        .fontWeight(.medium)
                    }
                }
                .padding()
            }
            .navigationTitle("Create Account")
        }
        .alert("Error", isPresented: .constant(viewModel.state.isError)) {
            Button("OK", role: .cancel) {
                viewModel.clearForm()
            }
        } message: {
            Text(errorMessage)
        }
        .alert("Success", isPresented: .constant(viewModel.state.isSuccess)) {
            Button("Continue") {
                viewModel.clearForm()
                dismiss()
            }
        } message: {
            Text(successMessage)
        }
        .onAppear {
            // Analytics are automatically set up in the view model init
        }
    }
}

// MARK: - Custom Components

struct CustomTextField: View {
    @Binding var text: String
    let placeholder: String
    let icon: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.gray)
                .frame(width: 20)
            
            TextField(placeholder, text: $text)
                .textFieldStyle(PlainTextFieldStyle())
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct CustomSecureField: View {
    @Binding var text: String
    let placeholder: String
    let icon: String
    @State private var isSecure = true
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(.gray)
                .frame(width: 20)
            
            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
            }
            .textFieldStyle(PlainTextFieldStyle())
            
            Button {
                isSecure.toggle()
            } label: {
                Image(systemName: isSecure ? "eye.slash" : "eye")
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(12)
    }
}

struct SocialSignInButton: View {
    let image: String
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(image)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 20, height: 20)
                
                Text(title)
                    .font(.caption)
                    .fontWeight(.medium)
            }
            .foregroundColor(.primary)
            .frame(maxWidth: .infinity)
            .frame(height: 44)
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
        }
    }
}

// MARK: - Preview
#Preview {
    SignUpView()
}


