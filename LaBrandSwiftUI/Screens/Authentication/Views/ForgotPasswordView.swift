//
//  ForgotPasswordView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct ForgotPasswordView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = ForgotPasswordViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    // Header
                    headerSection
                        .padding(.top, 40)
                    
                    // Illustration
                    illustrationSection
                        .padding(.top, 32)
                    
                    // Email Input
                    AuthTextField(
                        text: $viewModel.email,
                        placeholder: "Email Address",
                        icon: "envelope",
                        keyboardType: .emailAddress,
                        textContentType: .emailAddress
                    )
                    .padding(.top, 32)
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.3), value: hasAppeared)
                    
                    // Reset Button
                    PrimaryAuthButton(
                        title: "Send Reset Link",
                        isLoading: viewModel.isLoading,
                        action: {
                            Task { await viewModel.resetPassword() }
                        }
                    )
                    .padding(.top, 24)
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.4), value: hasAppeared)
                    
                    // Back to Sign In
                    Button {
                        dismiss()
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "arrow.left")
                                .font(.system(size: 12, weight: .medium))
                            Text("Back to Sign In")
                                .font(.system(size: 14, weight: .medium))
                        }
                        .foregroundStyle(AppColors.Text.tertiary)
                    }
                    .padding(.top, 24)
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.5), value: hasAppeared)
                    
                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 24)
            }
            .background(AppColors.Background.primary)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.Text.tertiary)
                    }
                }
            }
            .alert("Error", isPresented: $viewModel.showError) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(viewModel.errorMessage)
            }
            .alert("Success", isPresented: $viewModel.showSuccess) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Password reset link has been sent to your email")
            }
            .onAppear {
                withAnimation(.easeOut(duration: 0.6)) {
                    hasAppeared = true
                }
            }
        }
    }
}

// MARK: - Subviews
private extension ForgotPasswordView {
    
    var headerSection: some View {
        VStack(spacing: 16) {
            Text("Forgot Password?")
                .font(.custom("Georgia", size: 28))
                .fontWeight(.regular)
                .foregroundStyle(AppColors.Text.primary)
            
            Text("Enter your email address and we'll send you\na link to reset your password")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.Text.tertiary)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : -20)
        .animation(.easeOut(duration: 0.6), value: hasAppeared)
    }
    
    var illustrationSection: some View {
        ZStack {
            // Decorative circles
            Circle()
                .stroke(AppColors.Border.primary, lineWidth: 1)
                .frame(width: 140, height: 140)
            
            Circle()
                .stroke(AppColors.Accent.gold.opacity(0.3), lineWidth: 1)
                .frame(width: 100, height: 100)
            
            // Lock icon
            ZStack {
                Circle()
                    .fill(AppColors.Background.secondary)
                    .frame(width: 70, height: 70)
                
                Image(systemName: "lock.shield")
                    .font(.system(size: 28))
                    .foregroundStyle(AppColors.Accent.gold)
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .scaleEffect(hasAppeared ? 1 : 0.8)
        .animation(.spring(response: 0.6, dampingFraction: 0.8).delay(0.2), value: hasAppeared)
    }
}

// MARK: - ViewModel
class ForgotPasswordViewModel: ObservableObject {
    @Published var email = ""
    @Published var isLoading = false
    @Published var showError = false
    @Published var showSuccess = false
    @Published var errorMessage = ""
    
    func resetPassword() async {
        guard validate() else { return }
        
        await MainActor.run { isLoading = true }
        defer { Task { @MainActor in isLoading = false } }
        
        do {
            // TODO: Implement actual password reset
            try await Task.sleep(nanoseconds: 1_500_000_000)
            await MainActor.run { showSuccess = true }
        } catch {
            await MainActor.run {
                showError = true
                errorMessage = error.localizedDescription
            }
        }
    }
    
    private func validate() -> Bool {
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
        
        return true
    }
}

// MARK: - Preview
#Preview {
    ForgotPasswordView()
        .withAppTheme()
}
