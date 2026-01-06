//
//  EditorialBannerView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct EditorialBannerView: View {
    var onExploreTapped: (() -> Void)?
    
    var body: some View {
        ZStack {
            // Background - adaptive gradient for dark mode visibility
            editorialBackground
            
            HStack(spacing: 0) {
                // Content
                VStack(alignment: .leading, spacing: 12) {
                    Text("THE EDIT")
                        .font(.custom("Georgia", size: 11))
                        .tracking(4)
                        .foregroundStyle(AppColors.Accent.gold)
                    
                    Text("Timeless\nElegance")
                        .font(.custom("Georgia", size: 32))
                        .fontWeight(.regular)
                        .foregroundStyle(AppColors.Text.inverted)
                        .lineSpacing(4)
                    
                    Text("Curated pieces for the modern wardrobe")
                        .font(.system(size: 13))
                        .foregroundStyle(AppColors.Text.inverted.opacity(0.7))
                        .padding(.top, 4)
                    
                    Button {
                        onExploreTapped?()
                    } label: {
                        Text("EXPLORE")
                            .font(.system(size: 12, weight: .semibold))
                            .tracking(2)
                            .foregroundStyle(AppColors.Text.inverted)
                            .padding(.horizontal, 24)
                            .padding(.vertical, 12)
                            .background(
                                RoundedRectangle(cornerRadius: 0)
                                    .stroke(AppColors.Text.inverted.opacity(0.5), lineWidth: 1)
                            )
                    }
                    .padding(.top, 16)
                }
                .padding(.leading, 28)
                
                Spacer()
                
                // Decorative element
                decorativeCircles
                    .padding(.trailing, 20)
            }
        }
        .frame(height: 220)
    }
    
    // MARK: - Editorial Background
    /// Adaptive background that provides good contrast in both light and dark modes
    private var editorialBackground: some View {
        ZStack {
            // Base gradient - darker in light mode, slightly lighter in dark mode for contrast
            LinearGradient(
                colors: [
                    Color(UIColor { traitCollection in
                        switch traitCollection.userInterfaceStyle {
                        case .dark:
                            return UIColor(Color(hex: "1A1A1A"))
                        default:
                            return UIColor(Color(hex: "1A1A1A"))
                        }
                    }),
                    Color(UIColor { traitCollection in
                        switch traitCollection.userInterfaceStyle {
                        case .dark:
                            return UIColor(Color(hex: "2D2D2D"))
                        default:
                            return UIColor(Color(hex: "2D2D2D"))
                        }
                    })
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Subtle overlay pattern for depth in dark mode
            GeometryReader { geometry in
                Path { path in
                    let width = geometry.size.width
                    let height = geometry.size.height
                    
                    // Diagonal lines for texture
                    for i in stride(from: 0, to: width + height, by: 40) {
                        path.move(to: CGPoint(x: i, y: 0))
                        path.addLine(to: CGPoint(x: 0, y: i))
                    }
                }
                .stroke(AppColors.Accent.gold.opacity(0.03), lineWidth: 1)
            }
            
            // Corner accent
            VStack {
                HStack {
                    Spacer()
                    Rectangle()
                        .fill(AppColors.Accent.gold.opacity(0.1))
                        .frame(width: 100, height: 100)
                        .rotationEffect(.degrees(45))
                        .offset(x: 50, y: -50)
                }
                Spacer()
            }
            .clipped()
        }
    }
    
    // MARK: - Decorative Circles
    private var decorativeCircles: some View {
        VStack {
            Circle()
                .stroke(AppColors.Accent.gold.opacity(0.3), lineWidth: 1)
                .frame(width: 120, height: 120)
                .overlay {
                    Circle()
                        .stroke(AppColors.Accent.gold.opacity(0.2), lineWidth: 1)
                        .frame(width: 80, height: 80)
                }
                .overlay {
                    // Inner glow effect
                    Circle()
                        .fill(
                            RadialGradient(
                                colors: [
                                    AppColors.Accent.gold.opacity(0.1),
                                    Color.clear
                                ],
                                center: .center,
                                startRadius: 0,
                                endRadius: 60
                            )
                        )
                        .frame(width: 60, height: 60)
                }
        }
    }
}

#Preview("Light Mode") {
    EditorialBannerView()
        .withAppTheme()
}

#Preview("Dark Mode") {
    EditorialBannerView()
        .preferredColorScheme(.dark)
        .withAppTheme()
}

