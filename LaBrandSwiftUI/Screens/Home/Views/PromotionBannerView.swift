//
//  PromotionBannerView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct PromotionBannerView: View {
    let promotion: Promotion
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .bottomLeading) {
                // Background Image with parallax effect
                AsyncImage(url: URL(string: promotion.backgroundImage)) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: geometry.size.width, height: geometry.size.height)
                            .clipped()
                    case .failure:
                        fallbackBackground
                    case .empty:
                        fallbackBackground
                            .overlay {
                                ProgressView()
                                    .tint(AppColors.Text.inverted)
                            }
                    @unknown default:
                        fallbackBackground
                    }
                }
                
                // Gradient Overlay
                AppColors.Gradient.imageOverlay
                
                // Content
                VStack(alignment: .leading, spacing: 12) {
                    // Badge
                    Text("NEW COLLECTION")
                        .font(.system(size: 10, weight: .semibold))
                        .tracking(3)
                        .foregroundStyle(AppColors.Accent.gold)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            Capsule()
                                .fill(AppColors.Background.editorial.opacity(0.4))
                        )
                    
                    Text(promotion.title)
                        .font(.custom("Georgia", size: 36))
                        .fontWeight(.regular)
                        .foregroundStyle(AppColors.Text.inverted)
                        .lineSpacing(4)
                    
                    Text(promotion.subtitle)
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.Text.inverted.opacity(0.85))
                    
                    // CTA Button
                    Button {
                        // Navigate to promotion details
                    } label: {
                        HStack(spacing: 8) {
                            Text("SHOP NOW")
                                .font(.system(size: 13, weight: .semibold))
                                .tracking(2)
                            
                            Image(systemName: "arrow.right")
                                .font(.system(size: 12, weight: .semibold))
                        }
                        .foregroundStyle(AppColors.Text.primary)
                        .padding(.horizontal, 28)
                        .padding(.vertical, 14)
                        .background(AppColors.Background.surface)
                    }
                    .padding(.top, 8)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 48)
            }
        }
    }
    
    private var fallbackBackground: some View {
        ZStack {
            // Elegant gradient fallback
            LinearGradient(
                colors: [
                    AppColors.Background.navy,
                    AppColors.Background.editorial
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Subtle pattern overlay
            GeometryReader { geo in
                ZStack {
                    // Decorative circles
                    Circle()
                        .stroke(AppColors.Text.inverted.opacity(0.05), lineWidth: 1)
                        .frame(width: 300, height: 300)
                        .offset(x: geo.size.width * 0.3, y: -50)
                    
                    Circle()
                        .stroke(AppColors.Text.inverted.opacity(0.08), lineWidth: 1)
                        .frame(width: 200, height: 200)
                        .offset(x: geo.size.width * 0.5, y: 100)
                    
                    // Accent line
                    Rectangle()
                        .fill(AppColors.Accent.gold.opacity(0.3))
                        .frame(width: 60, height: 2)
                        .offset(x: geo.size.width * 0.35, y: -100)
                }
            }
        }
    }
}

#Preview {
    PromotionBannerView(
        promotion: Promotion(
            id: UUID(),
            title: "Summer\nEssentials",
            subtitle: "Effortless style for warm days",
            backgroundImage: ""
        )
    )
    .frame(height: 480)
}
