//
//  TrendingProductCard.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct TrendingProductCard: View {
    let product: Product
    @State private var isPressed = false
    @Environment(\.colorScheme) private var colorScheme
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            ZStack(alignment: .topLeading) {
                // Product Image
                AsyncImageView(imageUrl: product.images.first) {
                    Image(.cardMen)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                }
                .frame(width: 200, height: 260)
                .clipShape(RoundedRectangle(cornerRadius: 4))
                
                // Trending badge with dark mode adaptive styling
                trendingBadge
                    .padding(10)
            }
            
            // Product Info
            productInfo
        }
        .frame(width: 200)
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
    }
    
    // MARK: - Trending Badge
    /// Badge with adaptive colors for dark mode visibility
    private var trendingBadge: some View {
        HStack(spacing: 4) {
            Image(systemName: "flame.fill")
                .font(.system(size: 10))
            Text("TRENDING")
                .font(.system(size: 9, weight: .bold))
                .tracking(1)
        }
        .foregroundStyle(badgeTextColor)
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(badgeBackground)
    }
    
    /// Badge text color - ensures visibility in both modes
    private var badgeTextColor: Color {
        colorScheme == .dark ? AppColors.Text.primary : AppColors.Text.inverted
    }
    
    /// Badge background - provides contrast in both modes
    private var badgeBackground: some View {
        Group {
            if colorScheme == .dark {
                // In dark mode, use a lighter background for contrast
                RoundedRectangle(cornerRadius: 2)
                    .fill(AppColors.Background.surface)
                    .overlay(
                        RoundedRectangle(cornerRadius: 2)
                            .stroke(AppColors.Border.primary, lineWidth: 1)
                    )
            } else {
                // In light mode, use dark background
                RoundedRectangle(cornerRadius: 2)
                    .fill(AppColors.Background.editorial)
            }
        }
    }
    
    // MARK: - Product Info
    private var productInfo: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(product.brand.name.uppercased())
                .font(.system(size: 10, weight: .medium))
                .tracking(1.5)
                .foregroundStyle(AppColors.Text.muted)
            
            Text(product.name)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.Text.primary)
                .lineLimit(1)
            
            Text("$\(String(format: "%.0f", product.price))")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(AppColors.Text.primary)
        }
    }
}

#Preview("Light Mode") {
    HStack {
        TrendingProductCard(
            product: .preview
        )
    }
    .padding()
    .background(AppColors.Background.primary)
//    .withAppTheme()
}

#Preview("Dark Mode") {
    HStack {
        TrendingProductCard(
            product: .preview
        )
    }
    .padding()
    .background(AppColors.Background.primary)
    .preferredColorScheme(.dark)
    .withAppTheme()
}
