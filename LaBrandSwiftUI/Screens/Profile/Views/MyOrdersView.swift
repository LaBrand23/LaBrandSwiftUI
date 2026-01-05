//
//  MyOrdersView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct MyOrdersView: View {
    
    // MARK: - Properties
    @ObservedObject var viewModel: ProfileViewModel
    @State private var selectedTab = 0
    @State private var hasAppeared = false
    
    private let tabs = ["Delivered", "Processing", "Cancelled"]
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: 0) {
            // Tab Bar
            tabBar
            
            // Orders List
            ScrollView(showsIndicators: false) {
                if ordersForSelectedTab.isEmpty {
                    emptyState
                } else {
                    LazyVStack(spacing: 16) {
                        ForEach(Array(ordersForSelectedTab.enumerated()), id: \.element.id) { index, order in
                            OrderRow(order: order, viewModel: viewModel)
                                .opacity(hasAppeared ? 1 : 0)
                                .offset(y: hasAppeared ? 0 : 20)
                                .animation(
                                    .easeOut(duration: 0.5).delay(Double(index) * 0.1),
                                    value: hasAppeared
                                )
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 20)
                }
            }
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("MY ORDERS")
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
    
    private var ordersForSelectedTab: [Order] {
        switch selectedTab {
        case 0: return viewModel.deliveredOrders
        case 1: return viewModel.processingOrders
        case 2: return viewModel.cancelledOrders
        default: return []
        }
    }
}

// MARK: - Subviews
private extension MyOrdersView {
    
    var tabBar: some View {
        HStack(spacing: 0) {
            ForEach(tabs.indices, id: \.self) { index in
                Button {
                    withAnimation(.spring(response: 0.4)) {
                        selectedTab = index
                        hasAppeared = false
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                            withAnimation {
                                hasAppeared = true
                            }
                        }
                    }
                } label: {
                    VStack(spacing: 8) {
                        Text(tabs[index])
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(selectedTab == index ? AppColors.Text.primary : AppColors.Text.muted)
                        
                        Rectangle()
                            .fill(selectedTab == index ? AppColors.Accent.gold : Color.clear)
                            .frame(height: 2)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.top, 8)
        .background(AppColors.Background.surface)
    }
    
    var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            
            Image(systemName: "shippingbox")
                .font(.system(size: 48))
                .foregroundStyle(AppColors.Text.muted)
            
            Text("No orders yet")
                .font(.custom("Georgia", size: 20))
                .foregroundStyle(AppColors.Text.primary)
            
            Text("Your \(tabs[selectedTab].lowercased()) orders will appear here")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.Text.tertiary)
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 60)
    }
}

// MARK: - Order Row
struct OrderRow: View {
    let order: Order
    @ObservedObject var viewModel: ProfileViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Header
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(order.orderNumber)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(AppColors.Text.primary)
                    
                    Text("Tracking: \(order.trackingNumber)")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.Text.muted)
                }
                
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
            
            // Details
            HStack {
                HStack(spacing: 4) {
                    Text("Qty:")
                        .foregroundStyle(AppColors.Text.muted)
                    Text("\(order.quantity)")
                        .foregroundStyle(AppColors.Text.primary)
                }
                .font(.system(size: 13))
                
                Spacer()
                
                Text("$\(order.totalAmount, specifier: "%.2f")")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(AppColors.Text.primary)
            }
            
            // Details Button
            NavigationLink(destination: OrderDetailsView(order: order, viewModel: viewModel)) {
                Text("VIEW DETAILS")
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.primary)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 4)
                            .stroke(AppColors.Border.primary, lineWidth: 1)
                    )
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
    
    private var statusColor: Color {
        switch order.status {
        case .delivered:
            return AppColors.Accent.success
        case .processing:
            return AppColors.Accent.gold
        case .cancelled:
            return AppColors.Accent.error
        }
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        MyOrdersView(viewModel: ProfileViewModel())
    }
}
