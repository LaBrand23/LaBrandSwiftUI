import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var authManager: AuthenticationManager
    
    var body: some View {
        NavigationView {
            List {
                Section {
                    if let user = authManager.currentUser {
                        Text(user.email)
                            .foregroundColor(.gray)
                    }
                } header: {
                    Text("Account")
                }
                
                Section {
                    Button("Sign Out", role: .destructive) {
                        authManager.signOut()
                    }
                }
            }
            .navigationTitle("Profile")
        }
    }
} 