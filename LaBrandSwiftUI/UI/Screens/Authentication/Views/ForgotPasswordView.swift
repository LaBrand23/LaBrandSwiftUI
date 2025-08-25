import SwiftUI

struct ForgotPasswordView: View {
    @StateObject private var viewModel = ForgotPasswordViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
//        NavigationView {
            VStack(spacing: 24) {
                // Header
                Text("Forgot password")
                    .font(.title)
                    .fontWeight(.bold)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                Text("Enter your email address to receive a password reset link")
                    .foregroundColor(.gray)
                    .frame(maxWidth: .infinity, alignment: .leading)
                
                // Email input
                CustomTextField(
                    text: $viewModel.email,
                    placeholder: "Email",
                    icon: "envelope"
                )
                
                // Reset button
                Button {
                    Task {
                        await viewModel.resetPassword()
                    }
                } label: {
                    if viewModel.isLoading {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text("Send Reset Link")
                    }
                }
                .fontWeight(.semibold)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.red)
                .cornerRadius(25)
                .disabled(viewModel.isLoading)
                
                Spacer()
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
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
//        }
    }
}

class ForgotPasswordViewModel: ObservableObject {
    @Published var email = ""
    @Published var isLoading = false
    @Published var showError = false
    @Published var showSuccess = false
    @Published var errorMessage = ""
    
    func resetPassword() async {
        guard validate() else { return }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            // TODO: Implement actual password reset
            try await Task.sleep(nanoseconds: 1_000_000_000)
            showSuccess = true
        } catch {
            showError = true
            errorMessage = error.localizedDescription
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
