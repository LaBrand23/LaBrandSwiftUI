//
//  SettingsView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct SettingsView: View {
    
    // MARK: - Properties
    @ObservedObject var viewModel: ProfileViewModel
    @State private var showingPasswordChange = false
    @State private var fullName: String
    @State private var dateOfBirth: Date
    @State private var hasAppeared = false
    
    init(viewModel: ProfileViewModel) {
        self.viewModel = viewModel
        _fullName = State(initialValue: viewModel.userProfile.fullName)
        _dateOfBirth = State(initialValue: viewModel.userProfile.dateOfBirth)
    }
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                // Personal Information
                personalInfoSection
                
                // Password
                passwordSection
                
                // Notifications
                notificationsSection
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 20)
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("SETTINGS")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Sections
private extension SettingsView {
    
    var personalInfoSection: some View {
        SettingsSection(title: "PERSONAL INFORMATION") {
            VStack(spacing: 16) {
                // Full Name
                VStack(alignment: .leading, spacing: 8) {
                    Text("Full Name")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(AppColors.Text.muted)
                    
                    TextField("Enter your name", text: $fullName)
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.Text.primary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .background(AppColors.Background.secondary)
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                        .onChange(of: fullName) { _, newValue in
                            viewModel.updateProfile(fullName: newValue, dateOfBirth: dateOfBirth)
                        }
                }
                
                // Date of Birth
                VStack(alignment: .leading, spacing: 8) {
                    Text("Date of Birth")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(AppColors.Text.muted)
                    
                    DatePicker(
                        "",
                        selection: $dateOfBirth,
                        displayedComponents: .date
                    )
                    .labelsHidden()
                    .datePickerStyle(.compact)
                    .tint(AppColors.Accent.gold)
                    .onChange(of: dateOfBirth) { _, newValue in
                        viewModel.updateProfile(fullName: fullName, dateOfBirth: newValue)
                    }
                }
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
    }
    
    var passwordSection: some View {
        SettingsSection(title: "PASSWORD") {
            NavigationLink(destination: ChangePasswordView(viewModel: viewModel)) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Password")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundStyle(AppColors.Text.primary)
                        
                        Text("Change your password")
                            .font(.system(size: 12))
                            .foregroundStyle(AppColors.Text.tertiary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(AppColors.Text.muted)
                }
                .padding(16)
                .background(AppColors.Background.secondary)
                .clipShape(RoundedRectangle(cornerRadius: 4))
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
    }
    
    var notificationsSection: some View {
        SettingsSection(title: "NOTIFICATIONS") {
            VStack(spacing: 0) {
                SettingsToggle(
                    title: "Sales",
                    subtitle: "Get notified about sales and promotions",
                    isOn: Binding(
                        get: { viewModel.notificationSettings.sales },
                        set: { viewModel.updateNotificationSettings(sales: $0) }
                    )
                )
                
                divider
                
                SettingsToggle(
                    title: "New Arrivals",
                    subtitle: "Be the first to know about new products",
                    isOn: Binding(
                        get: { viewModel.notificationSettings.newArrivals },
                        set: { viewModel.updateNotificationSettings(newArrivals: $0) }
                    )
                )
                
                divider
                
                SettingsToggle(
                    title: "Delivery Updates",
                    subtitle: "Track your order status",
                    isOn: Binding(
                        get: { viewModel.notificationSettings.deliveryStatusChanges },
                        set: { viewModel.updateNotificationSettings(deliveryStatus: $0) }
                    ),
                    isLast: true
                )
            }
            .background(AppColors.Background.secondary)
            .clipShape(RoundedRectangle(cornerRadius: 4))
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.3), value: hasAppeared)
    }
    
    var divider: some View {
        Rectangle()
            .fill(AppColors.Border.subtle)
            .frame(height: 1)
            .padding(.leading, 16)
    }
}

// MARK: - Settings Section
private struct SettingsSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            content
        }
    }
}

// MARK: - Settings Toggle
private struct SettingsToggle: View {
    let title: String
    let subtitle: String
    @Binding var isOn: Bool
    var isLast: Bool = false
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(AppColors.Text.primary)
                
                Text(subtitle)
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.Text.tertiary)
            }
            
            Spacer()
            
            Toggle("", isOn: $isOn)
                .labelsHidden()
                .tint(AppColors.Accent.gold)
        }
        .padding(16)
    }
}

// MARK: - Change Password View
struct ChangePasswordView: View {
    @ObservedObject var viewModel: ProfileViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var showingAlert = false
    @State private var alertMessage = ""
    @State private var hasAppeared = false
    
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                // Password Fields
                VStack(spacing: 16) {
                    PasswordField(
                        title: "Current Password",
                        text: $viewModel.oldPassword
                    )
                    
                    PasswordField(
                        title: "New Password",
                        text: $viewModel.newPassword
                    )
                    
                    PasswordField(
                        title: "Confirm Password",
                        text: $viewModel.confirmPassword
                    )
                }
                .opacity(hasAppeared ? 1 : 0)
                .offset(y: hasAppeared ? 0 : 20)
                .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
                
                // Forgot Password
                Button {
                    // Handle forgot password
                } label: {
                    Text("Forgot Password?")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(AppColors.Accent.gold)
                }
                .frame(maxWidth: .infinity, alignment: .trailing)
                .opacity(hasAppeared ? 1 : 0)
                .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
                
                Spacer()
                
                // Save Button
                Button {
                    if viewModel.changePassword() {
                        alertMessage = "Password changed successfully"
                        showingAlert = true
                    } else {
                        alertMessage = "Please check your password entries"
                        showingAlert = true
                    }
                } label: {
                    Text("SAVE PASSWORD")
                        .font(.system(size: 14, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(AppColors.Button.primaryText)
                        .frame(maxWidth: .infinity)
                        .frame(height: 56)
                        .background(
                            canSavePassword
                            ? AppColors.Button.primaryBackground
                            : AppColors.Button.disabled
                        )
                }
                .disabled(!canSavePassword)
                .opacity(hasAppeared ? 1 : 0)
                .offset(y: hasAppeared ? 0 : 20)
                .animation(.easeOut(duration: 0.5).delay(0.3), value: hasAppeared)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 20)
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("PASSWORD")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .alert("Password Change", isPresented: $showingAlert) {
            Button("OK") {
                if viewModel.changePassword() {
                    dismiss()
                }
            }
        } message: {
            Text(alertMessage)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
    
    private var canSavePassword: Bool {
        !viewModel.oldPassword.isEmpty &&
        !viewModel.newPassword.isEmpty &&
        !viewModel.confirmPassword.isEmpty
    }
}

// MARK: - Password Field
private struct PasswordField: View {
    let title: String
    @Binding var text: String
    @State private var isSecure = true
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppColors.Text.muted)
            
            HStack {
                if isSecure {
                    SecureField("", text: $text)
                } else {
                    TextField("", text: $text)
                }
                
                Button {
                    isSecure.toggle()
                } label: {
                    Image(systemName: isSecure ? "eye.slash" : "eye")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.Text.muted)
                }
            }
            .font(.system(size: 15))
            .foregroundStyle(AppColors.Text.primary)
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(AppColors.Background.secondary)
            .clipShape(RoundedRectangle(cornerRadius: 4))
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        SettingsView(viewModel: ProfileViewModel())
    }
}
