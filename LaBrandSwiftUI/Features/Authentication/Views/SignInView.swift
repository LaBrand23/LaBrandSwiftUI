import SwiftUI

struct SignInView: View {
    @EnvironmentObject private var authManager: AuthenticationManager
    @StateObject private var viewModel = SignInViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 24) {
            // Header
            Text("Login")
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
                
                Button("Forgot your password?") {
                    viewModel.showForgotPassword = true
                }
                .font(.subheadline)
                .foregroundColor(.gray)
                .frame(maxWidth: .infinity, alignment: .trailing)
            }
            
            // Sign in button
            Button {
                Task {
                    await viewModel.signIn()
                }
            } label: {
                Text("Sign in")
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 50)
                    .background(Color.red)
                    .cornerRadius(25)
            }
            .disabled(viewModel.isLoading)
            
            // Social sign in
            VStack(spacing: 16) {
                Text("Or sign in with")
                    .foregroundColor(.gray)
                
                HStack(spacing: 20) {
                    SocialSignInButton(image: "google", action: viewModel.signInWithGoogle)
                    SocialSignInButton(image: "facebook", action: viewModel.signInWithFacebook)
                }
            }
            
            Spacer()
            
            // Sign up prompt
            HStack {
                Text("Don't have an account?")
                    .foregroundColor(.gray)
                Button("Sign up") {
                    viewModel.showSignUp = true
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
        .sheet(isPresented: $viewModel.showForgotPassword) {
            ForgotPasswordView()
        }
        .fullScreenCover(isPresented: $viewModel.showSignUp) {
            SignUpView()
        }
        .task {
            viewModel.inject(authManager: authManager)
        }
    }
}

// Custom TextField with icon
struct CustomTextField: View {
    @Binding var text: String
    let placeholder: String
    let icon: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.gray)
            TextField(placeholder, text: $text)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// Custom SecureField with icon
struct CustomSecureField: View {
    @Binding var text: String
    let placeholder: String
    let icon: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(.gray)
            SecureField(placeholder, text: $text)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// Social sign in button
struct SocialSignInButton: View {
    let image: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Image(image)
                .resizable()
                .scaledToFit()
                .frame(width: 24, height: 24)
                .frame(width: 60, height: 60)
                .background(Color(.systemGray6))
                .clipShape(Circle())
        }
    }
} 
