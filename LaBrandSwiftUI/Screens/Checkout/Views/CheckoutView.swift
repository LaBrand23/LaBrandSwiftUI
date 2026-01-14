//
//  CheckoutView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct CheckoutView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = CheckoutViewModel()
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Shipping Address
                shippingAddressSection
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
                
                // Payment Method
                paymentSection
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
                
                // Delivery Method
                deliverySection
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.3), value: hasAppeared)
                
                // Order Summary
                orderSummarySection
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.4), value: hasAppeared)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 20)
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("CHECKOUT")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .safeAreaInset(edge: .bottom) {
            submitButton
        }
        .sheet(isPresented: $viewModel.showingAddCardSheet) {
            NavigationStack {
                AddPaymentCardView(viewModel: viewModel)
            }
        }
        .sheet(isPresented: $viewModel.showingAddAddressSheet) {
            NavigationStack {
                AddShippingAddressView(viewModel: viewModel)
            }
        }
        .fullScreenCover(isPresented: $viewModel.showingSuccessView) {
            NavigationStack {
                OrderSuccessView()
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
private extension CheckoutView {
    
    var shippingAddressSection: some View {
        CheckoutCard(
            title: "SHIPPING ADDRESS",
            actionTitle: "Change",
            action: { viewModel.showingAddAddressSheet = true }
        ) {
            if let address = viewModel.selectedShippingAddress {
                VStack(alignment: .leading, spacing: 6) {
                    Text(address.fullName)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(AppColors.Text.primary)
                    
                    Text(address.formattedAddress)
                        .font(.system(size: 13))
                        .foregroundStyle(AppColors.Text.tertiary)
                        .lineSpacing(4)
                }
            } else {
                HStack(spacing: 12) {
                    Image(systemName: "plus.circle")
                        .font(.system(size: 20))
                        .foregroundStyle(AppColors.Accent.gold)
                    
                    Text("Add shipping address")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.Text.tertiary)
                }
            }
        }
    }
    
    var paymentSection: some View {
        CheckoutCard(
            title: "PAYMENT METHOD",
            actionTitle: "Change",
            action: { viewModel.showingAddCardSheet = true }
        ) {
            if let card = viewModel.selectedPaymentCard {
                HStack(spacing: 12) {
                    // Card Icon
                    Image(systemName: "creditcard.fill")
                        .font(.system(size: 20))
                        .foregroundStyle(AppColors.Accent.gold)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(card.maskedNumber)
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.Text.primary)
                        
                        Text("Expires \(card.expiryDate)")
                            .font(.system(size: 12))
                            .foregroundStyle(AppColors.Text.muted)
                    }
                }
            } else {
                HStack(spacing: 12) {
                    Image(systemName: "plus.circle")
                        .font(.system(size: 20))
                        .foregroundStyle(AppColors.Accent.gold)
                    
                    Text("Add payment method")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.Text.tertiary)
                }
            }
        }
    }
    
    var deliverySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("DELIVERY METHOD")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)

            HStack(spacing: 12) {
                ForEach(DeliveryMethod.allCases) { method in
                    DeliveryMethodCard(
                        method: method,
                        isSelected: viewModel.selectedDeliveryMethod == method,
                        action: { viewModel.selectedDeliveryMethod = method }
                    )
                }
            }
        }
        .padding(20)
        .modifier(GlassCardModifier())
    }
    
    var orderSummarySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("ORDER SUMMARY")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)

            VStack(spacing: 12) {
                SummaryRow(title: "Subtotal", value: "$112.98")
                SummaryRow(title: "Delivery", value: "$\(String(format: "%.2f", viewModel.selectedDeliveryMethod.price))")

                Rectangle()
                    .fill(AppColors.Border.primary)
                    .frame(height: 1)

                HStack {
                    Text("Total")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(AppColors.Text.primary)
                    Spacer()
                    Text("$\(String(format: "%.2f", 112.98 + viewModel.selectedDeliveryMethod.price))")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(AppColors.Text.primary)
                }
            }
        }
        .padding(20)
        .modifier(GlassCardModifier())
    }
    
    var submitButton: some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(AppColors.Border.subtle)
                .frame(height: 1)

            submitOrderButton
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
        }
        .background(submitButtonBackground)
    }

    @ViewBuilder
    private var submitOrderButton: some View {
        if #available(iOS 26.0, *) {
            Button(action: viewModel.submitOrder) {
                Text("SUBMIT ORDER")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
            }
            .buttonStyle(.glassProminent)
            .tint(AppColors.Accent.gold)
        } else {
            Button(action: viewModel.submitOrder) {
                Text("SUBMIT ORDER")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(AppColors.Button.primaryBackground)
            }
        }
    }

    @ViewBuilder
    private var submitButtonBackground: some View {
        if #available(iOS 26.0, *) {
            Rectangle()
                .fill(.ultraThinMaterial)
        } else {
            AppColors.Background.surface
        }
    }
}

// MARK: - Helper Views
private struct CheckoutCard<Content: View>: View {
    let title: String
    var actionTitle: String? = nil
    var action: (() -> Void)? = nil
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text(title)
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.tertiary)

                Spacer()

                if let actionTitle = actionTitle, let action = action {
                    Button(action: action) {
                        Text(actionTitle)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(AppColors.Accent.gold)
                    }
                }
            }

            content
        }
        .padding(20)
        .modifier(GlassCardModifier())
    }
}

// MARK: - Glass Card Modifier
private struct GlassCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 26.0, *) {
            content
                .background(.ultraThinMaterial)
                .glassEffect(.regular.tint(.clear).interactive(), in: .rect(cornerRadius: 8))
        } else {
            content
                .background(AppColors.Background.surface)
                .clipShape(RoundedRectangle(cornerRadius: 4))
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(AppColors.Border.subtle, lineWidth: 1)
                )
        }
    }
}

private struct DeliveryMethodCard: View {
    let method: DeliveryMethod
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                // Icon
                Image("fexEx")
                    .resizable()
                    .scaledToFit()
                    .frame(height: 20)
                    .grayscale(isSelected ? 0 : 1)
                
                // Days
                Text(method.estimatedDays)
                    .font(.system(size: 11))
                    .foregroundStyle(AppColors.Text.muted)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(isSelected ? AppColors.Background.secondary : AppColors.Background.surface)
            .clipShape(RoundedRectangle(cornerRadius: 4))
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(isSelected ? AppColors.Accent.gold : AppColors.Border.primary, lineWidth: isSelected ? 2 : 1)
            )
        }
    }
}

private struct SummaryRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.Text.secondary)
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(AppColors.Text.primary)
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        CheckoutView()
    }
}
