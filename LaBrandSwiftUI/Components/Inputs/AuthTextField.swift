//
//  AuthTextField.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

// MARK: - Auth Text Field
struct AuthTextField: View {
    
    @Binding var text: String
    let placeholder: String
    let icon: String
    var keyboardType: UIKeyboardType = .default
    var textContentType: UITextContentType?
    var autocapitalization: TextInputAutocapitalization = .never
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(isFocused ? AppColors.Text.primary : AppColors.Text.muted)
                .frame(width: 20)
            
            TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(AppColors.Text.muted))
                .font(.system(size: 15))
                .foregroundStyle(AppColors.Text.primary)
                .keyboardType(keyboardType)
                .textContentType(textContentType)
                .textInputAutocapitalization(autocapitalization)
                .focused($isFocused)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
        .background(AppColors.Background.secondary)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(isFocused ? AppColors.Border.focus : Color.clear, lineWidth: 1)
        )
        .animation(.easeOut(duration: 0.2), value: isFocused)
    }
}

// MARK: - Auth Secure Field
struct AuthSecureField: View {
    
    @Binding var text: String
    let placeholder: String
    let icon: String
    var textContentType: UITextContentType?
    
    @State private var isSecured = true
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(isFocused ? AppColors.Text.primary : AppColors.Text.muted)
                .frame(width: 20)
            
            Group {
                if isSecured {
                    SecureField("", text: $text, prompt: Text(placeholder).foregroundStyle(AppColors.Text.muted))
                } else {
                    TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(AppColors.Text.muted))
                }
            }
            .font(.system(size: 15))
            .foregroundStyle(AppColors.Text.primary)
            .textContentType(textContentType)
            .focused($isFocused)
            
            Button {
                isSecured.toggle()
            } label: {
                Image(systemName: isSecured ? "eye.slash" : "eye")
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.Text.muted)
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
        .background(AppColors.Background.secondary)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(isFocused ? AppColors.Border.focus : Color.clear, lineWidth: 1)
        )
        .animation(.easeOut(duration: 0.2), value: isFocused)
    }
}

// MARK: - Social Sign In Button
struct SocialAuthButton: View {
    
    let provider: Provider
    let action: () -> Void
    
    @State private var isPressed = false
    
    enum Provider {
        case google
        case facebook
        case apple
        
        var iconName: String {
            switch self {
            case .google: return "google"
            case .facebook: return "facebook"
            case .apple: return "apple.logo"
            }
        }
        
        var isSystemIcon: Bool {
            self == .apple
        }
    }
    
    var body: some View {
        Button(action: action) {
            Group {
                if provider.isSystemIcon {
                    Image(systemName: provider.iconName)
                        .font(.system(size: 20))
                        .foregroundStyle(AppColors.Text.primary)
                } else {
                    Image(provider.iconName)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 22, height: 22)
                }
            }
            .frame(width: 56, height: 56)
            .background(AppColors.Background.surface)
            .clipShape(Circle())
            .overlay(
                Circle()
                    .stroke(AppColors.Border.primary, lineWidth: 1)
            )
        }
        .scaleEffect(isPressed ? 0.95 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - Primary Auth Button
struct PrimaryAuthButton: View {
    
    let title: String
    var isLoading: Bool = false
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            ZStack {
                if isLoading {
                    ProgressView()
                        .tint(AppColors.Button.primaryText)
                } else {
                    Text(title.uppercased())
                        .font(.system(size: 14, weight: .semibold))
                        .tracking(2)
                }
            }
            .foregroundStyle(AppColors.Button.primaryText)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(AppColors.Button.primaryBackground)
        }
        .disabled(isLoading)
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
}

// MARK: - Previews
#Preview("Text Field") {
    VStack(spacing: 16) {
        AuthTextField(
            text: .constant(""),
            placeholder: "Email",
            icon: "envelope"
        )
        
        AuthSecureField(
            text: .constant(""),
            placeholder: "Password",
            icon: "lock"
        )
    }
    .padding()
    .background(AppColors.Background.primary)
    .withAppTheme()
}

#Preview("Buttons") {
    VStack(spacing: 24) {
        PrimaryAuthButton(title: "Sign In", action: {})
        
        HStack(spacing: 16) {
            SocialAuthButton(provider: .google, action: {})
            SocialAuthButton(provider: .facebook, action: {})
            SocialAuthButton(provider: .apple, action: {})
        }
    }
    .padding()
    .background(AppColors.Background.primary)
    .withAppTheme()
}

