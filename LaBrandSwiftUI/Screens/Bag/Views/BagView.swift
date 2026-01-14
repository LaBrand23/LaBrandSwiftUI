//
//  BagView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct BagView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = BagViewModel()
    @State private var showingCheckout = false
    @State private var selectedProduct: Product?
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: 0) {
            if viewModel.bagItems.isEmpty {
                emptyBagView
            } else {
                // Bag Content
                ScrollView(showsIndicators: false) {
                    VStack(spacing: 20) {
                        // Bag Items
                        VStack(spacing: 16) {
                            ForEach(Array(viewModel.bagItems.enumerated()), id: \.element.id) { index, item in
                                BagItemView(
                                    item: item,
                                    onIncrement: { viewModel.incrementQuantity(for: item) },
                                    onDecrement: { viewModel.decrementQuantity(for: item) },
                                    onRemove: { viewModel.removeItem(item: item) }
                                )
                                .opacity(hasAppeared ? 1 : 0)
                                .offset(y: hasAppeared ? 0 : 20)
                                .animation(
                                    .easeOut(duration: 0.5).delay(Double(index) * 0.1),
                                    value: hasAppeared
                                )
                                .navigateOnTap(to: item.product, selection: $selectedProduct)
                            }
                        }
                        
                        // Promo Code Section
                        promoCodeSection
                        
                        // Order Summary
                        orderSummarySection
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 20)
                }
                
                // Checkout Button
                checkoutButton
            }
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("MY BAG")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .navigationDestination(item: $selectedProduct) { ProductDetailView(product: $0) }
        .sheet(isPresented: $viewModel.showingPromoCodeSheet) {
            PromoCodeView()
                .environmentObject(viewModel)
        }
        .navigationDestination(isPresented: $showingCheckout) {
            CheckoutView()
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension BagView {
    
    var emptyBagView: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Icon
            ZStack {
                Circle()
                    .stroke(AppColors.Border.primary, lineWidth: 1)
                    .frame(width: 120, height: 120)
                
                Image(systemName: "bag")
                    .font(.system(size: 40))
                    .foregroundStyle(AppColors.Text.muted)
            }
            
            VStack(spacing: 8) {
                Text("Your Bag is Empty")
                    .font(.custom("Georgia", size: 22))
                    .foregroundStyle(AppColors.Text.primary)
                
                Text("Items you add to your bag will appear here")
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.Text.tertiary)
                    .multilineTextAlignment(.center)
            }
            
            // Shop Now Button
            Button {
                // Navigate to shop
            } label: {
                Text("START SHOPPING")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(width: 200)
                    .padding(.vertical, 16)
                    .background(AppColors.Button.primaryBackground)
            }
            .padding(.top, 8)
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }
    
    var promoCodeSection: some View {
        VStack(spacing: 0) {
            if let appliedPromo = viewModel.appliedPromoCode {
                // Applied Promo
                HStack(spacing: 12) {
                    Image(systemName: "tag.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(AppColors.Accent.gold)
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text("PROMO CODE APPLIED")
                            .font(.system(size: 10, weight: .semibold))
                            .tracking(1)
                            .foregroundStyle(AppColors.Text.muted)
                        
                        Text(appliedPromo.code)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(AppColors.Text.primary)
                    }
                    
                    Spacer()
                    
                    Button {
                        viewModel.removePromoCode()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.system(size: 18))
                            .foregroundStyle(AppColors.Text.muted)
                    }
                }
                .padding(16)
                .background(AppColors.Background.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(AppColors.Accent.gold.opacity(0.3), lineWidth: 1)
                )
                .clipShape(RoundedRectangle(cornerRadius: 4))
            } else {
                // Add Promo Button
                Button {
                    viewModel.showingPromoCodeSheet = true
                } label: {
                    HStack {
                        Image(systemName: "tag")
                            .font(.system(size: 16))
                        
                        Text("Add Promo Code")
                            .font(.system(size: 14, weight: .medium))
                        
                        Spacer()
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 12, weight: .medium))
                    }
                    .foregroundStyle(AppColors.Text.primary)
                    .padding(16)
                    .background(AppColors.Background.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
                    .overlay(
                        RoundedRectangle(cornerRadius: 4)
                            .stroke(AppColors.Border.primary, lineWidth: 1)
                    )
                }
            }
        }
    }
    
    var orderSummarySection: some View {
        VStack(spacing: 16) {
            // Header
            Text("ORDER SUMMARY")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            VStack(spacing: 12) {
                // Subtotal
                HStack {
                    Text("Subtotal")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.Text.secondary)
                    Spacer()
                    Text("$\(viewModel.subtotal, specifier: "%.2f")")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(AppColors.Text.primary)
                }
                
                // Discount
                if viewModel.isPromoCodeApplied {
                    HStack {
                        Text("Discount (\(viewModel.appliedPromoCode?.discountPercentage ?? 0)% off)")
                            .font(.system(size: 14))
                            .foregroundStyle(AppColors.Text.secondary)
                        Spacer()
                        Text("-$\(viewModel.discount, specifier: "%.2f")")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.Accent.sale)
                    }
                }
                
                // Shipping
                HStack {
                    Text("Shipping")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.Text.secondary)
                    Spacer()
                    Text("Free")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(AppColors.Accent.success)
                }
                
                // Divider
                Rectangle()
                    .fill(AppColors.Border.primary)
                    .frame(height: 1)
                
                // Total
                HStack {
                    Text("Total")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(AppColors.Text.primary)
                    Spacer()
                    Text("$\(viewModel.total, specifier: "%.2f")")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(AppColors.Text.primary)
                }
            }
            .padding(20)
            .background(AppColors.Background.surface)
            .clipShape(RoundedRectangle(cornerRadius: 4))
        }
    }
    
    var checkoutButton: some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(AppColors.Border.subtle)
                .frame(height: 1)
            
            checkoutButtonContent
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .background(checkoutBarBackground)
        }
    }
    
    @ViewBuilder
    private var checkoutButtonContent: some View {
        if #available(iOS 26.0, *) {
            // Modern Liquid Glass button
            Button {
                showingCheckout = true
            } label: {
                HStack {
                    Text("CHECKOUT")
                        .font(.system(size: 14, weight: .semibold))
                        .tracking(2)
                    
                    Spacer()
                    
                    Text("$\(viewModel.total, specifier: "%.2f")")
                        .font(.system(size: 16, weight: .bold))
                }
                .foregroundStyle(AppColors.Text.primary)
                .padding(.horizontal, 24)
                .frame(height: 56)
                .frame(maxWidth: .infinity)
            }
            .buttonStyle(.glassProminent)
        } else {
            // Classic button for older iOS
            Button {
                showingCheckout = true
            } label: {
                HStack {
                    Text("CHECKOUT")
                        .font(.system(size: 14, weight: .semibold))
                        .tracking(2)
                    
                    Spacer()
                    
                    Text("$\(viewModel.total, specifier: "%.2f")")
                        .font(.system(size: 16, weight: .bold))
                }
                .foregroundStyle(AppColors.Button.primaryText)
                .padding(.horizontal, 24)
                .frame(height: 56)
                .frame(maxWidth: .infinity)
                .background(AppColors.Button.primaryBackground)
            }
        }
    }
    
    @ViewBuilder
    private var checkoutBarBackground: some View {
        if #available(iOS 26.0, *) {
            Rectangle()
                .fill(.ultraThinMaterial)
                .overlay(
                    Rectangle()
                        .fill(AppColors.Background.surface.opacity(0.3))
                )
        } else {
            AppColors.Background.surface
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        BagView()
    }
}
