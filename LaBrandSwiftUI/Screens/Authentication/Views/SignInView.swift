//
//  SignInView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct SignInView: View {
    
    // MARK: - Properties
    @EnvironmentObject private var authManager: AuthenticationManager
    @StateObject private var viewModel = SignInViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Header
                headerSection
                    .padding(.top, 40)
                
                // Form Fields
                formSection
                    .padding(.top, 40)
                
                // Sign In Button
                PrimaryAuthButton(
                    title: "Sign In",
                    isLoading: viewModel.isLoading,
                    action: {
                        Task { await viewModel.signIn() }
                    }
                )
                .padding(.top, 32)
                .opacity(hasAppeared ? 1 : 0)
                .offset(y: hasAppeared ? 0 : 20)
                .animation(.easeOut(duration: 0.5).delay(0.4), value: hasAppeared)
                
                // Divider with text
                dividerSection
                    .padding(.top, 32)
                
                // Social Sign In
                socialSection
                    .padding(.top, 24)
                
                Spacer(minLength: 40)
                
                // Sign Up Prompt
                signUpPrompt
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
        .sheet(isPresented: $viewModel.showForgotPassword) {
            ForgotPasswordView()
        }
        .fullScreenCover(isPresented: $viewModel.showSignUp) {
            SignUpView()
        }
        .task {
            viewModel.inject(authManager: authManager)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension SignInView {
    
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
            Text("Welcome Back")
                .font(.custom("Georgia", size: 24))
                .fontWeight(.regular)
                .foregroundStyle(Color(hex: "1A1A1A"))
                .padding(.top, 24)
            
            Text("Sign in to continue shopping")
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
                textContentType: .password
            )
            
            // Forgot Password
            HStack {
                Spacer()
                Button {
                    viewModel.showForgotPassword = true
                } label: {
                    Text("Forgot Password?")
                        .font(.system(size: 13))
                        .foregroundStyle(Color(hex: "666666"))
                }
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
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
            Text("Sign in with")
                .font(.system(size: 13))
                .foregroundStyle(Color(hex: "666666"))
            
            HStack(spacing: 20) {
                SocialAuthButton(provider: .google, action: viewModel.signInWithGoogle)
                SocialAuthButton(provider: .facebook, action: viewModel.signInWithFacebook)
                SocialAuthButton(provider: .apple, action: {})
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .animation(.easeOut(duration: 0.5).delay(0.6), value: hasAppeared)
    }
    
    var signUpPrompt: some View {
        HStack(spacing: 4) {
            Text("Don't have an account?")
                .font(.system(size: 14))
                .foregroundStyle(Color(hex: "666666"))
            
            Button {
                viewModel.showSignUp = true
            } label: {
                Text("Sign Up")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Color(hex: "1A1A1A"))
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .animation(.easeOut(duration: 0.5).delay(0.7), value: hasAppeared)
    }
}

// MARK: - Preview
#Preview {
    SignInView()
        .environmentObject(AuthenticationManager())
}
