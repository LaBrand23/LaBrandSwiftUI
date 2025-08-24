import SwiftUI

struct SignUpView: View {
    @StateObject private var viewModel = SignUpViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 24) {
            // Header
            Text("Sign up")
                .font(.title)
                .fontWeight(.bold)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.top)
            
            // Input fields
            VStack(spacing: 16) {
                CustomTextField(
                    text: $viewModel.email,
                    placeholder: "Email",
                    icon: "envelope"
                )
                
                CustomSecureField(
                    text: $viewModel.password,
                    placeholder: "Password",
                    icon: "lock"
                )
                
                CustomSecureField(
                    text: $viewModel.confirmPassword,
                    placeholder: "Confirm Password",
                    icon: "lock"
                )
            }
            
            // Sign up button
            Button {
                Task {
                    await viewModel.signUp()
                }
            } label: {
                if viewModel.isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text("Sign up")
                }
            }
            .fontWeight(.semibold)
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.red)
            .cornerRadius(25)
            .disabled(viewModel.isLoading)
            
            // Social sign up
            VStack(spacing: 16) {
                Text("Or sign up with")
                    .foregroundColor(.gray)
                
                HStack(spacing: 20) {
                    SocialSignInButton(image: "google", action: viewModel.signUpWithGoogle)
                    SocialSignInButton(image: "facebook", action: viewModel.signUpWithFacebook)
                }
            }
            
            Spacer()
            
            // Sign in prompt
            HStack {
                Text("Already have an account?")
                    .foregroundColor(.gray)
                Button("Sign in") {
                    dismiss()
                }
                .foregroundColor(.red)
            }
        }
        .padding()
        .alert("Error", isPresented: $viewModel.showError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
    }
}

class SignUpViewModel: ObservableObject {
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var isLoading = false
    @Published var showError = false
    @Published var errorMessage = ""
    
    func signUp() async {
        guard validate() else { return }
        
        isLoading = true
        defer { isLoading = false }
        
        do {
            // TODO: Implement actual sign up
            try await Task.sleep(nanoseconds: 1_000_000_000)
        } catch {
            showError = true
            errorMessage = error.localizedDescription
        }
    }
    
    func signUpWithGoogle() {
        // TODO: Implement Google sign up
        print("Google sign up tapped")
    }
    
    func signUpWithFacebook() {
        // TODO: Implement Facebook sign up
        print("Facebook sign up tapped")
    }
    
    private func validate() -> Bool {
        guard !email.isEmpty else {
            showError = true
            errorMessage = "Please enter your email"
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
