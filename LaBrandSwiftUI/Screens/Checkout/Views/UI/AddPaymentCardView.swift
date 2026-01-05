//
//  AddPaymentCardView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct AddPaymentCardView: View {
    
    // MARK: - Properties
    @ObservedObject var viewModel: CheckoutViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var hasAppeared = false
    
    private var isFormValid: Bool {
        !viewModel.newCardNumber.isEmpty &&
        !viewModel.newCardholderName.isEmpty &&
        !viewModel.newExpiryDate.isEmpty &&
        !viewModel.newCVV.isEmpty
    }
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                // Card Preview
                cardPreview
                
                // Form Fields
                formFields
                
                // Default Toggle
                defaultToggle
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 24)
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("ADD CARD")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
            
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(AppColors.Text.primary)
                }
            }
        }
        .safeAreaInset(edge: .bottom) {
            addButton
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension AddPaymentCardView {
    
    var cardPreview: some View {
        ZStack {
            // Background
            RoundedRectangle(cornerRadius: 12)
                .fill(
                    LinearGradient(
                        colors: [Color(hex: "1A1A1A"), Color(hex: "333333")],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
            
            VStack(alignment: .leading, spacing: 24) {
                // Card number
                Text(formatCardNumber(viewModel.newCardNumber))
                    .font(.system(size: 22, weight: .medium, design: .monospaced))
                    .foregroundStyle(.white)
                    .tracking(2)
                
                Spacer()
                
                HStack {
                    // Cardholder
                    VStack(alignment: .leading, spacing: 4) {
                        Text("CARDHOLDER")
                            .font(.system(size: 9, weight: .medium))
                            .tracking(1)
                            .foregroundStyle(.white.opacity(0.6))
                        
                        Text(viewModel.newCardholderName.isEmpty ? "YOUR NAME" : viewModel.newCardholderName.uppercased())
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(.white)
                    }
                    
                    Spacer()
                    
                    // Expiry
                    VStack(alignment: .trailing, spacing: 4) {
                        Text("EXPIRES")
                            .font(.system(size: 9, weight: .medium))
                            .tracking(1)
                            .foregroundStyle(.white.opacity(0.6))
                        
                        Text(viewModel.newExpiryDate.isEmpty ? "MM/YY" : viewModel.newExpiryDate)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(.white)
                    }
                }
            }
            .padding(24)
        }
        .frame(height: 180)
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : -20)
        .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
    }
    
    var formFields: some View {
        VStack(spacing: 16) {
            FormField(
                title: "Card Number",
                text: $viewModel.newCardNumber,
                placeholder: "0000 0000 0000 0000",
                keyboardType: .numberPad
            )
            
            FormField(
                title: "Cardholder Name",
                text: $viewModel.newCardholderName,
                placeholder: "Enter name as on card"
            )
            
            HStack(spacing: 12) {
                FormField(
                    title: "Expiry Date",
                    text: $viewModel.newExpiryDate,
                    placeholder: "MM/YY",
                    keyboardType: .numberPad
                )
                
                FormField(
                    title: "CVV",
                    text: $viewModel.newCVV,
                    placeholder: "•••",
                    keyboardType: .numberPad,
                    isSecure: true
                )
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
    }
    
    var defaultToggle: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Set as default")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(AppColors.Text.primary)
                
                Text("Use this card as primary payment method")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.Text.tertiary)
            }
            
            Spacer()
            
            Toggle("", isOn: $viewModel.newCardIsDefault)
                .labelsHidden()
                .tint(AppColors.Accent.gold)
        }
        .padding(16)
        .background(AppColors.Background.surface)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(AppColors.Border.subtle, lineWidth: 1)
        )
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.3), value: hasAppeared)
    }
    
    var addButton: some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(AppColors.Border.subtle)
                .frame(height: 1)
            
            Button {
                viewModel.addNewCard()
                dismiss()
            } label: {
                Text("ADD CARD")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(isFormValid ? AppColors.Button.primaryText : AppColors.Button.disabledText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(isFormValid ? AppColors.Button.primaryBackground : AppColors.Button.disabled)
            }
            .disabled(!isFormValid)
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .background(AppColors.Background.surface)
    }
    
    private func formatCardNumber(_ number: String) -> String {
        let cleaned = number.replacingOccurrences(of: " ", with: "")
        if cleaned.isEmpty { return "•••• •••• •••• ••••" }
        
        var formatted = ""
        for (index, char) in cleaned.enumerated() {
            if index > 0 && index % 4 == 0 {
                formatted += " "
            }
            formatted.append(char)
        }
        
        // Pad with bullets
        let remaining = 16 - cleaned.count
        if remaining > 0 {
            let paddingGroups = remaining / 4
            let paddingExtra = remaining % 4
            
            if paddingExtra > 0 {
                formatted += String(repeating: "•", count: paddingExtra)
            }
            for _ in 0..<paddingGroups {
                formatted += " ••••"
            }
        }
        
        return formatted
    }
}

// MARK: - Form Field
private struct FormField: View {
    let title: String
    @Binding var text: String
    var placeholder: String = ""
    var keyboardType: UIKeyboardType = .default
    var isSecure: Bool = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppColors.Text.muted)
            
            if isSecure {
                SecureField(placeholder, text: $text)
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.Text.primary)
                    .keyboardType(keyboardType)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(AppColors.Background.secondary)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
            } else {
                TextField(placeholder, text: $text)
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.Text.primary)
                    .keyboardType(keyboardType)
                    .padding(.horizontal, 16)
                    .padding(.vertical, 14)
                    .background(AppColors.Background.secondary)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
            }
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        AddPaymentCardView(viewModel: CheckoutViewModel())
    }
}
