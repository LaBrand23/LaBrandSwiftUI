//
//  PromoCodeView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct PromoCodeView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = PromoCodeViewModel()
    @EnvironmentObject private var bagViewModel: BagViewModel
    @Environment(\.dismiss) private var dismiss
    @FocusState private var isTextFieldFocused: Bool
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Field
                promoInputSection
                
                // Promo Codes List
                promoCodesSection
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .background(AppColors.Background.primary)
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("PROMO CODE")
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
            .onChange(of: viewModel.selectedPromoCode) { _, promoCode in
                if let promoCode = promoCode {
                    bagViewModel.applyPromoCode(promoCode)
                    dismiss()
                }
            }
        }
        .onAppear {
            viewModel.fetchAvailablePromoCodes()
            isTextFieldFocused = true
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension PromoCodeView {
    
    var promoInputSection: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                // Input Field
                HStack(spacing: 12) {
                    Image(systemName: "tag")
                        .font(.system(size: 16))
                        .foregroundStyle(AppColors.Text.muted)
                    
                    TextField("Enter promo code", text: $viewModel.promoCode)
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.Text.primary)
                        .autocapitalization(.allCharacters)
                        .autocorrectionDisabled()
                        .focused($isTextFieldFocused)
                        .submitLabel(.done)
                        .onSubmit {
                            Task {
                                await viewModel.validatePromoCode()
                            }
                        }
                    
                    if !viewModel.promoCode.isEmpty {
                        Button {
                            viewModel.promoCode = ""
                            viewModel.clearError()
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 16))
                                .foregroundStyle(AppColors.Text.muted)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .background(AppColors.Background.secondary)
                .clipShape(RoundedRectangle(cornerRadius: 4))
                
                // Apply Button
                Button {
                    Task {
                        await viewModel.validatePromoCode()
                    }
                } label: {
                    Image(systemName: "arrow.right")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(AppColors.Button.primaryText)
                        .frame(width: 48, height: 48)
                        .background(
                            viewModel.promoCode.isEmpty
                            ? AppColors.Button.disabled
                            : AppColors.Button.primaryBackground
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }
                .disabled(viewModel.promoCode.isEmpty)
            }
            
            // Error Message
            if viewModel.showError, let error = viewModel.error {
                HStack(spacing: 6) {
                    Image(systemName: "exclamationmark.circle")
                        .font(.system(size: 12))
                    Text(error)
                        .font(.system(size: 12))
                }
                .foregroundStyle(AppColors.Accent.error)
                .frame(maxWidth: .infinity, alignment: .leading)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 20)
        .background(AppColors.Background.surface)
    }
    
    var promoCodesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("YOUR PROMO CODES")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
                .padding(.horizontal, 20)
                .padding(.top, 20)
            
            if viewModel.isLoading {
                VStack {
                    Spacer()
                    ProgressView()
                        .tint(AppColors.Accent.gold)
                    Spacer()
                }
                .frame(maxWidth: .infinity)
            } else if viewModel.availablePromoCodes.isEmpty {
                emptyPromoState
            } else {
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 16) {
                        ForEach(Array(viewModel.availablePromoCodes.enumerated()), id: \.element.id) { index, promoCode in
                            PromoCodeCard(
                                promoCode: promoCode,
                                isApplied: bagViewModel.appliedPromoCode?.id == promoCode.id
                            ) {
                                bagViewModel.applyPromoCode(promoCode)
                                dismiss()
                            }
                            .opacity(hasAppeared ? 1 : 0)
                            .offset(y: hasAppeared ? 0 : 20)
                            .animation(
                                .easeOut(duration: 0.5).delay(Double(index) * 0.1),
                                value: hasAppeared
                            )
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                }
            }
        }
    }
    
    var emptyPromoState: some View {
        VStack(spacing: 16) {
            Spacer()
            
            Image(systemName: "tag.slash")
                .font(.system(size: 40))
                .foregroundStyle(AppColors.Text.muted)
            
            VStack(spacing: 4) {
                Text("No promo codes available")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(AppColors.Text.primary)
                
                Text("Check back later for special offers")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.Text.tertiary)
            }
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Preview
#Preview {
    PromoCodeView()
        .environmentObject(BagViewModel())
}
