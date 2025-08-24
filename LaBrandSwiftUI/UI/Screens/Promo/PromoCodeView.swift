import SwiftUI

struct PromoCodeView: View {
    @StateObject private var viewModel = PromoCodeViewModel()
    @EnvironmentObject private var bagViewModel: BagViewModel
    @Environment(\.dismiss) private var dismiss
    @FocusState private var isTextFieldFocused: Bool
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Search Field
                VStack(spacing: 8) {
                    HStack {
                        TextField("Enter your promo code", text: $viewModel.promoCode)
                            .textFieldStyle(.plain)
                            .autocapitalization(.none)
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
                                    .foregroundColor(.gray)
                            }
                        }
                        
                        Button {
                            Task {
                                await viewModel.validatePromoCode()
                            }
                        } label: {
                            Image(systemName: "arrow.right")
                                .foregroundColor(.white)
                                .padding(8)
                                .background(Circle().fill(Color.black))
                        }
                        .disabled(viewModel.promoCode.isEmpty)
                    }
                    .padding(.leading)
                    .frame(height: 36)
                    .background(
                        RoundedRectangle(cornerRadius: 25)
                            .fill(Color(.systemGray6))
                    )
                    
                    // Error Message
                    if viewModel.showError, let error = viewModel.error {
                        Text(error)
                            .font(.caption)
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .transition(.opacity)
                    }
                }
                .padding(.horizontal)
                
                // Your Promo Codes Section
                VStack(alignment: .leading, spacing: 16) {
                    Text("Your Promo Codes")
                        .font(.headline)
                        .padding(.horizontal)
                    
                    if viewModel.isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity, alignment: .top)
                    } else {
                        ScrollView {
                            LazyVStack(spacing: 24) {
                                ForEach(viewModel.availablePromoCodes) { promoCode in
                                    PromoCodeCard(
                                        promoCode: promoCode,
                                        isApplied: bagViewModel.appliedPromoCode?.id == promoCode.id
                                    ) {
                                        bagViewModel.applyPromoCode(promoCode)
                                        dismiss()
                                    }
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .navigationTitle("Promo Code")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
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
        .applyToolbarHidden()
        .onAppear {
            viewModel.fetchAvailablePromoCodes()
            isTextFieldFocused = true
        }
    }
}

#Preview {
    PromoCodeView()
        .environmentObject(BagViewModel())
} 
