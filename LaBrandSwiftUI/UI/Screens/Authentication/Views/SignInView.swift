import SwiftUI

struct SignInView: View {
    @StateObject private var viewModel = SignInViewModel()
    @EnvironmentObject var clientStorage: UserStorage
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
                    if let client = await viewModel.getClient() {
                        clientStorage.createClient(client: client)
                    }
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
                    SocialSignInButton(image: "google", title: "Google", action: viewModel.signInWithGoogle)
                    SocialSignInButton(image: "facebook", title: "Facebook", action: viewModel.signInWithFacebook)
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
                .environmentObject(clientStorage)
        }
        .task {
            #if DEBUG
                $viewModel.email.wrappedValue = "test123@example.com"
                $viewModel.password.wrappedValue = "Password123!"
            #endif
        }
    }
}

#Preview {
    SignInView()
        .environmentObject(UserStorage())
}
