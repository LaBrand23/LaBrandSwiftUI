//
//  PromoCodeCard.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct PromoCodeCard: View {
    
    let promoCode: PromoCode
    let isApplied: Bool
    let action: () -> Void
    
    var body: some View {
        HStack(spacing: 0) {
            // Discount Badge
            discountBadge
            
            // Details & Button
            HStack(spacing: 16) {
                // Promo Details
                VStack(alignment: .leading, spacing: 6) {
                    Text(promoCode.title)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(AppColors.Text.primary)
                    
                    Text(promoCode.code.uppercased())
                        .font(.system(size: 11, weight: .medium))
                        .tracking(1)
                        .foregroundStyle(AppColors.Text.muted)
                    
                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.system(size: 10))
                        Text("\(promoCode.daysRemaining) days remaining")
                            .font(.system(size: 11))
                    }
                    .foregroundStyle(promoCode.daysRemaining <= 3 ? AppColors.Accent.sale : AppColors.Text.tertiary)
                }
                
                Spacer()
                
                // Apply Button
                Button(action: action) {
                    Text(isApplied ? "Applied" : "Apply")
                        .font(.system(size: 12, weight: .semibold))
                        .tracking(1)
                        .foregroundStyle(isApplied ? AppColors.Text.muted : AppColors.Button.primaryText)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 10)
                        .background(isApplied ? AppColors.Background.secondary : AppColors.Button.primaryBackground)
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                }
                .disabled(isApplied)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 16)
        }
        .background(AppColors.Background.surface)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(isApplied ? AppColors.Accent.gold.opacity(0.3) : AppColors.Border.subtle, lineWidth: 1)
        )
    }
    
    private var discountBadge: some View {
        ZStack {
            // Background
            AsyncImage(url: URL(string: promoCode.background)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                LinearGradient(
                    colors: [AppColors.Accent.sale, AppColors.Accent.sale.opacity(0.8)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
            
            // Overlay
            AppColors.Background.editorial.opacity(0.3)
            
            // Discount Text
            VStack(spacing: 0) {
                Text("\(promoCode.discountPercentage)")
                    .font(.system(size: 28, weight: .bold))
                Text("% OFF")
                    .font(.system(size: 10, weight: .bold))
                    .tracking(1)
            }
            .foregroundStyle(AppColors.Text.inverted)
        }
        .frame(width: 80)
        .clipShape(
            .rect(
                topLeadingRadius: 4,
                bottomLeadingRadius: 4,
                bottomTrailingRadius: 0,
                topTrailingRadius: 0
            )
        )
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 16) {
        PromoCodeCard(
            promoCode: PromoCode(
                code: "SUMMER25",
                title: "Summer Sale Special",
                description: "Get 25% off on all summer collection",
                background: "",
                discountPercentage: 25,
                daysRemaining: 4,
                isApplied: false
            ),
            isApplied: false,
            action: {}
        )
        
        PromoCodeCard(
            promoCode: PromoCode(
                code: "NEW10",
                title: "New User Discount",
                description: "Welcome offer",
                background: "",
                discountPercentage: 10,
                daysRemaining: 2,
                isApplied: true
            ),
            isApplied: true,
            action: {}
        )
    }
    .padding()
    .background(AppColors.Background.primary)
}
