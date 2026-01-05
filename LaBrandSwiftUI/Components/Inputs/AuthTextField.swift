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
                .foregroundStyle(isFocused ? Color(hex: "1A1A1A") : Color(hex: "999999"))
                .frame(width: 20)
            
            TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(Color(hex: "999999")))
                .font(.system(size: 15))
                .foregroundStyle(Color(hex: "1A1A1A"))
                .keyboardType(keyboardType)
                .textContentType(textContentType)
                .textInputAutocapitalization(autocapitalization)
                .focused($isFocused)
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
        .background(Color(hex: "F5F5F5"))
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(isFocused ? Color(hex: "1A1A1A") : Color.clear, lineWidth: 1)
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
                .foregroundStyle(isFocused ? Color(hex: "1A1A1A") : Color(hex: "999999"))
                .frame(width: 20)
            
            Group {
                if isSecured {
                    SecureField("", text: $text, prompt: Text(placeholder).foregroundStyle(Color(hex: "999999")))
                } else {
                    TextField("", text: $text, prompt: Text(placeholder).foregroundStyle(Color(hex: "999999")))
                }
            }
            .font(.system(size: 15))
            .foregroundStyle(Color(hex: "1A1A1A"))
            .textContentType(textContentType)
            .focused($isFocused)
            
            Button {
                isSecured.toggle()
            } label: {
                Image(systemName: isSecured ? "eye.slash" : "eye")
                    .font(.system(size: 14))
                    .foregroundStyle(Color(hex: "999999"))
            }
        }
        .padding(.horizontal, 18)
        .padding(.vertical, 16)
        .background(Color(hex: "F5F5F5"))
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(isFocused ? Color(hex: "1A1A1A") : Color.clear, lineWidth: 1)
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
                        .foregroundStyle(Color(hex: "1A1A1A"))
                } else {
                    Image(provider.iconName)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 22, height: 22)
                }
            }
            .frame(width: 56, height: 56)
            .background(Color.white)
            .clipShape(Circle())
            .overlay(
                Circle()
                    .stroke(Color(hex: "E8E8E8"), lineWidth: 1)
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
                        .tint(.white)
                } else {
                    Text(title.uppercased())
                        .font(.system(size: 14, weight: .semibold))
                        .tracking(2)
                }
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: 54)
            .background(Color(hex: "1A1A1A"))
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
    .background(Color(hex: "FAFAFA"))
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
    .background(Color(hex: "FAFAFA"))
}

