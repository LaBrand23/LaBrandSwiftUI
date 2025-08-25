import SwiftUI

struct SettingsView: View {
    @ObservedObject var viewModel: ProfileViewModel
    @State private var showingPasswordChange = false
    @State private var fullName: String
    @State private var dateOfBirth: Date
    
    init(viewModel: ProfileViewModel) {
        self.viewModel = viewModel
        _fullName = State(initialValue: viewModel.userProfile.fullName)
        _dateOfBirth = State(initialValue: viewModel.userProfile.dateOfBirth)
    }
    
    var body: some View {
        Form {
            Section(header: Text("Personal Information")) {
                TextField("Full name", text: $fullName)
                    .onChange(of: fullName) { _, newValue in
                        viewModel.updateProfile(fullName: newValue, dateOfBirth: dateOfBirth)
                    }
                
                DatePicker(
                    "Date of birth",
                    selection: $dateOfBirth,
                    displayedComponents: .date
                )
                .onChange(of: dateOfBirth) { _, newValue in
                    viewModel.updateProfile(fullName: fullName, dateOfBirth: newValue)
                }
            }
            
            Section(header: Text("Password")) {
                NavigationLink(destination: ChangePasswordView(viewModel: viewModel)) {
                    Text("Password settings")
                }
            }
            
            Section(header: Text("Notifications")) {
                Toggle("Sales", isOn: Binding(
                    get: { viewModel.notificationSettings.sales },
                    set: { viewModel.updateNotificationSettings(sales: $0) }
                ))
                
                Toggle("New arrivals", isOn: Binding(
                    get: { viewModel.notificationSettings.newArrivals },
                    set: { viewModel.updateNotificationSettings(newArrivals: $0) }
                ))
                
                Toggle("Delivery status changes", isOn: Binding(
                    get: { viewModel.notificationSettings.deliveryStatusChanges },
                    set: { viewModel.updateNotificationSettings(deliveryStatus: $0) }
                ))
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct ChangePasswordView: View {
    @ObservedObject var viewModel: ProfileViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showingAlert = false
    @State private var alertMessage = ""
    
    var body: some View {
        Form {
            Section {
                SecureField("Old Password", text: $viewModel.oldPassword)
                SecureField("New Password", text: $viewModel.newPassword)
                SecureField("Repeat New Password", text: $viewModel.confirmPassword)
            }
            
            Section {
                Button("Forgot Password?") {
                    // Handle forgot password
                }
                .foregroundColor(.red)
            }
            
            Section {
                Button("Save Password") {
                    if viewModel.changePassword() {
                        alertMessage = "Password changed successfully"
                        showingAlert = true
                    } else {
                        alertMessage = "Please check your password entries"
                        showingAlert = true
                    }
                }
                .frame(maxWidth: .infinity)
                .foregroundColor(.white)
                .listRowBackground(Color.red)
                .disabled(
                    viewModel.oldPassword.isEmpty ||
                    viewModel.newPassword.isEmpty ||
                    viewModel.confirmPassword.isEmpty
                )
            }
        }
        .navigationTitle("Password Change")
        .navigationBarTitleDisplayMode(.inline)
        .alert("Password Change", isPresented: $showingAlert) {
            Button("OK") {
                if viewModel.changePassword() {
                    dismiss()
                }
            }
        } message: {
            Text(alertMessage)
        }
    }
}

#Preview {
    NavigationStack {
        SettingsView(viewModel: ProfileViewModel())
    }
} 
