//
//  ProfileView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI
import CoreSpotlight

struct ProfileView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = ProfileViewModel()
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 32) {
                // Profile Header
                profileHeader
                    .padding(.top, 20)
                
                // Menu Options
                menuOptions
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("PROFILE")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
            indexProfileForSpotlight()
        }
        .userActivity("com.labrand.viewProfile") { activity in
            activity.title = "View My Profile"
            activity.isEligibleForSearch = true
            activity.isEligibleForPrediction = true
            activity.persistentIdentifier = "user-profile"

            let attributes = CSSearchableItemAttributeSet(contentType: .content)
            attributes.title = viewModel.userProfile.fullName
            attributes.contentDescription = "LaBrand Profile - \(viewModel.userProfile.email)"
            attributes.thumbnailData = nil
            activity.contentAttributeSet = attributes
        }
    }

    // MARK: - Spotlight Indexing
    private func indexProfileForSpotlight() {
        Task {
            await indexUserProfile()
            await indexUserOrders()
        }
    }

    private func indexUserProfile() async {
        let attributeSet = CSSearchableItemAttributeSet(contentType: .content)
        attributeSet.title = viewModel.userProfile.fullName
        attributeSet.contentDescription = "Your LaBrand profile and settings"
        attributeSet.keywords = ["profile", "account", "settings", viewModel.userProfile.fullName]

        let item = CSSearchableItem(
            uniqueIdentifier: "labrand-user-profile",
            domainIdentifier: "com.labrand.profile",
            attributeSet: attributeSet
        )
        item.expirationDate = Date.distantFuture

        try? await CSSearchableIndex.default().indexSearchableItems([item])
    }

    private func indexUserOrders() async {
        var items: [CSSearchableItem] = []
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium

        for order in viewModel.orders {
            let attributeSet = CSSearchableItemAttributeSet(contentType: .content)
            attributeSet.title = "Order #\(order.orderNumber)"
            attributeSet.contentDescription = "Order placed on \(dateFormatter.string(from: order.date)) - \(order.status.displayName)"
            attributeSet.keywords = ["order", "purchase", order.orderNumber, order.status.rawValue]

            let item = CSSearchableItem(
                uniqueIdentifier: "labrand-order-\(order.id)",
                domainIdentifier: "com.labrand.orders",
                attributeSet: attributeSet
            )
            item.expirationDate = Calendar.current.date(byAdding: .month, value: 6, to: Date()) ?? Date.distantFuture
            items.append(item)
        }

        try? await CSSearchableIndex.default().indexSearchableItems(items)
    }
}

// MARK: - Subviews
private extension ProfileView {
    
    var profileHeader: some View {
        VStack(spacing: 16) {
            // Avatar
            ZStack {
                Circle()
                    .stroke(
                        LinearGradient(
                            colors: [AppColors.Accent.gold.opacity(0.6), AppColors.Accent.gold.opacity(0.2)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 2
                    )
                    .frame(width: 100, height: 100)
                
                Image(viewModel.userProfile.profileImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .frame(width: 90, height: 90)
                    .clipShape(Circle())
            }
            
            VStack(spacing: 4) {
                Text(viewModel.userProfile.fullName)
                    .font(.custom("Georgia", size: 20))
                    .fontWeight(.medium)
                    .foregroundStyle(AppColors.Text.primary)
                
                Text(viewModel.userProfile.email)
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.Text.tertiary)
            }
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : -20)
        .animation(.easeOut(duration: 0.5), value: hasAppeared)
    }
    
    var menuOptions: some View {
        VStack(spacing: 0) {
            ProfileMenuRow(
                icon: "shippingbox",
                title: "My Orders",
                subtitle: "\(viewModel.orders.count) orders",
                destination: { MyOrdersView(viewModel: viewModel) },
                delay: 0.1,
                hasAppeared: hasAppeared
            )
            
            ProfileMenuRow(
                icon: "location",
                title: "Shipping Addresses",
                subtitle: "3 addresses",
                destination: { AddShippingAddressView(viewModel: CheckoutViewModel()) },
                delay: 0.15,
                hasAppeared: hasAppeared
            )
            
            ProfileMenuRow(
                icon: "creditcard",
                title: "Payment Methods",
                subtitle: "Visa **34",
                destination: { AddPaymentCardView(viewModel: CheckoutViewModel()) },
                delay: 0.2,
                hasAppeared: hasAppeared
            )
            
            ProfileMenuRow(
                icon: "tag",
                title: "Promo Codes",
                subtitle: "You have special offers",
                destination: { PromoCodeView().environmentObject(BagViewModel()) },
                delay: 0.25,
                hasAppeared: hasAppeared
            )
            
            ProfileMenuRow(
                icon: "star",
                title: "My Reviews",
                subtitle: "Reviews for 4 items",
                destination: { MyReviewsView() },
                delay: 0.3,
                hasAppeared: hasAppeared
            )
            
            ProfileMenuRow(
                icon: "gearshape",
                title: "Settings",
                subtitle: "Notifications, password",
                destination: { SettingsView(viewModel: viewModel) },
                delay: 0.35,
                hasAppeared: hasAppeared,
                isLast: true
            )
        }
        .background(AppColors.Background.surface)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(AppColors.Border.subtle, lineWidth: 1)
        )
    }
}

// MARK: - Profile Menu Row
struct ProfileMenuRow<Destination: View>: View {
    
    let icon: String
    let title: String
    let subtitle: String
    let destination: () -> Destination
    var delay: Double = 0
    var hasAppeared: Bool = true
    var isLast: Bool = false
    
    var body: some View {
        NavigationLink(destination: destination()) {
            HStack(spacing: 16) {
                // Icon
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundStyle(AppColors.Accent.gold)
                    .frame(width: 24)
                
                // Text
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(AppColors.Text.primary)
                    
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.Text.tertiary)
                }
                
                Spacer()
                
                // Arrow
                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(AppColors.Text.muted)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
            .background(AppColors.Background.surface)
            .overlay(
                Rectangle()
                    .fill(isLast ? Color.clear : AppColors.Border.subtle)
                    .frame(height: 1)
                    .padding(.leading, 60),
                alignment: .bottom
            )
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(x: hasAppeared ? 0 : -20)
        .animation(.easeOut(duration: 0.4).delay(delay), value: hasAppeared)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        ProfileView()
    }
}
