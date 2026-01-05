//
//  AddShippingAddressView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct AddShippingAddressView: View {
    
    // MARK: - Properties
    @ObservedObject var viewModel: CheckoutViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var hasAppeared = false
    
    private var isFormValid: Bool {
        !viewModel.newFullName.isEmpty &&
        !viewModel.newStreetAddress.isEmpty &&
        !viewModel.newCity.isEmpty &&
        !viewModel.newState.isEmpty &&
        !viewModel.newZipCode.isEmpty &&
        !viewModel.newCountry.isEmpty
    }
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
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
                Text("ADD ADDRESS")
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
            saveButton
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension AddShippingAddressView {
    
    var formFields: some View {
        VStack(spacing: 16) {
            AddressFormField(
                title: "Full Name",
                text: $viewModel.newFullName,
                placeholder: "Enter your full name",
                contentType: .name
            )
            .opacity(hasAppeared ? 1 : 0)
            .offset(y: hasAppeared ? 0 : 20)
            .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
            
            AddressFormField(
                title: "Street Address",
                text: $viewModel.newStreetAddress,
                placeholder: "Street address",
                contentType: .streetAddressLine1
            )
            .opacity(hasAppeared ? 1 : 0)
            .offset(y: hasAppeared ? 0 : 20)
            .animation(.easeOut(duration: 0.5).delay(0.15), value: hasAppeared)
            
            HStack(spacing: 12) {
                AddressFormField(
                    title: "City",
                    text: $viewModel.newCity,
                    placeholder: "City",
                    contentType: .addressCity
                )
                
                AddressFormField(
                    title: "State",
                    text: $viewModel.newState,
                    placeholder: "State",
                    contentType: .addressState
                )
            }
            .opacity(hasAppeared ? 1 : 0)
            .offset(y: hasAppeared ? 0 : 20)
            .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
            
            HStack(spacing: 12) {
                AddressFormField(
                    title: "ZIP Code",
                    text: $viewModel.newZipCode,
                    placeholder: "ZIP",
                    keyboardType: .numberPad,
                    contentType: .postalCode
                )
                
                AddressFormField(
                    title: "Country",
                    text: $viewModel.newCountry,
                    placeholder: "Country",
                    contentType: .countryName
                )
            }
            .opacity(hasAppeared ? 1 : 0)
            .offset(y: hasAppeared ? 0 : 20)
            .animation(.easeOut(duration: 0.5).delay(0.25), value: hasAppeared)
        }
    }
    
    var defaultToggle: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Set as default")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(AppColors.Text.primary)
                
                Text("Use this as my shipping address")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.Text.tertiary)
            }
            
            Spacer()
            
            Toggle("", isOn: $viewModel.newAddressIsDefault)
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
    
    var saveButton: some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(AppColors.Border.subtle)
                .frame(height: 1)
            
            Button {
                viewModel.addNewAddress()
                dismiss()
            } label: {
                Text("SAVE ADDRESS")
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
}

// MARK: - Address Form Field
private struct AddressFormField: View {
    let title: String
    @Binding var text: String
    var placeholder: String = ""
    var keyboardType: UIKeyboardType = .default
    var contentType: UITextContentType? = nil
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppColors.Text.muted)
            
            TextField(placeholder, text: $text)
                .font(.system(size: 15))
                .foregroundStyle(AppColors.Text.primary)
                .keyboardType(keyboardType)
                .textContentType(contentType)
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
        AddShippingAddressView(viewModel: CheckoutViewModel())
    }
}
