//
//  OrderDetailsView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct OrderDetailsView: View {
    
    // MARK: - Properties
    let order: Order
    @ObservedObject var viewModel: ProfileViewModel
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Order Header
                orderHeader
                
                // Product List
                productList
                
                // Order Information
                orderInfo
                
                // Action Buttons
                actionButtons
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 20)
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("ORDER DETAILS")
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

// MARK: - Subviews
private extension OrderDetailsView {
    
    var orderHeader: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(order.orderNumber)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(AppColors.Text.primary)
                
                Spacer()
                
                Text(order.date, style: .date)
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.Text.muted)
            }
            
            HStack {
                Text("Tracking: \(order.trackingNumber)")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.Text.tertiary)
                
                Spacer()
                
                // Status Badge
                Text(order.status.rawValue.uppercased())
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(1)
                    .foregroundStyle(statusColor)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(statusColor.opacity(0.1))
                    .clipShape(Capsule())
            }
            
            Text("\(order.items.count) items")
                .font(.system(size: 13))
                .foregroundStyle(AppColors.Text.muted)
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
        .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
    }
    
    var productList: some View {
        VStack(spacing: 16) {
            ForEach(Array(order.items.enumerated()), id: \.element.id) { index, item in
                OrderItemRow(item: item)
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(
                        .easeOut(duration: 0.5).delay(0.2 + Double(index) * 0.05),
                        value: hasAppeared
                    )
                
                if item.id != order.items.last?.id {
                    Rectangle()
                        .fill(AppColors.Border.subtle)
                        .frame(height: 1)
                }
            }
        }
        .padding(16)
        .background(AppColors.Background.surface)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(AppColors.Border.subtle, lineWidth: 1)
        )
    }
    
    var orderInfo: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("ORDER INFORMATION")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            VStack(spacing: 16) {
                InfoRow(
                    title: "Shipping Address",
                    value: order.shippingAddress.formattedAddress
                )
                
                InfoRow(
                    title: "Payment Method",
                    value: "•••• •••• •••• \(order.paymentMethod.cardNumber)"
                )
                
                InfoRow(
                    title: "Delivery Method",
                    value: "\(order.deliveryMethod.rawValue), \(order.deliveryMethod.estimatedDays)"
                )
                
                if let discount = order.discount {
                    InfoRow(
                        title: "Discount",
                        value: "\(discount.percentage)% — \(discount.description)"
                    )
                }
                
                Rectangle()
                    .fill(AppColors.Border.primary)
                    .frame(height: 1)
                
                HStack {
                    Text("Total Amount")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(AppColors.Text.secondary)
                    Spacer()
                    Text("$\(order.totalAmount, specifier: "%.2f")")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(AppColors.Text.primary)
                }
            }
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
    
    var actionButtons: some View {
        HStack(spacing: 12) {
            // Reorder
            Button {
                viewModel.reorderItems(from: order)
            } label: {
                Text("REORDER")
                    .font(.system(size: 13, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(AppColors.Button.primaryBackground)
            }
            
            // Feedback
            Button {
                viewModel.leaveFeedback(for: order)
            } label: {
                Text("FEEDBACK")
                    .font(.system(size: 13, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.primary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(
                        RoundedRectangle(cornerRadius: 0)
                            .stroke(AppColors.Border.primary, lineWidth: 1)
                    )
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.4), value: hasAppeared)
    }
    
    private var statusColor: Color {
        switch order.status {
        case .delivered:
            return AppColors.Accent.success
        case .pending, .confirmed, .processing, .shipped:
            return AppColors.Accent.gold
        case .cancelled, .refunded:
            return AppColors.Accent.error
        }
    }
}

// MARK: - Order Item Row
struct OrderItemRow: View {
    let item: OrderItem
    
    var body: some View {
        HStack(spacing: 16) {
            // Image
            Image(item.image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 80, height: 100)
                .clipShape(RoundedRectangle(cornerRadius: 4))
            
            // Details
            VStack(alignment: .leading, spacing: 6) {
                Text(item.brand.uppercased())
                    .font(.system(size: 10, weight: .medium))
                    .tracking(1)
                    .foregroundStyle(AppColors.Text.muted)
                
                Text(item.name)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.Text.primary)
                    .lineLimit(2)
                
                HStack(spacing: 8) {
                    Text("Color: \(item.color)")
                    Text("•")
                        .foregroundStyle(AppColors.Text.muted)
                    Text("Size: \(item.size)")
                }
                .font(.system(size: 11))
                .foregroundStyle(AppColors.Text.tertiary)
                
                Spacer()
                
                HStack {
                    Text("Qty: \(item.units)")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.Text.muted)
                    
                    Spacer()
                    
                    Text("$\(item.price, specifier: "%.2f")")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(AppColors.Text.primary)
                }
            }
        }
        .frame(height: 100)
    }
}

// MARK: - Info Row
struct InfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 12))
                .foregroundStyle(AppColors.Text.muted)
            
            Text(value)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.Text.primary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        OrderDetailsView(
            order: Order.sampleOrders[0],
            viewModel: ProfileViewModel()
        )
    }
}
