//
//  OrderSuccessView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct OrderSuccessView: View {

    @Environment(\.dismiss) private var dismiss
    @State private var hasAppeared = false
    @State private var showConfetti = false
    @State private var pulseAnimation = false

    var body: some View {
        ZStack {
            // Background
            AppColors.Background.primary
                .ignoresSafeArea()

            // Confetti particles
            if showConfetti {
                confettiView
            }

            VStack(spacing: 32) {
                Spacer()

                // Success Icon with glass effect
                successIcon

                // Text Content
                VStack(spacing: 12) {
                    Text("Success!")
                        .font(.custom("Georgia", size: 32))
                        .fontWeight(.medium)
                        .foregroundStyle(AppColors.Text.primary)

                    Text("Your order will be delivered soon.\nThank you for choosing LaBrand!")
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.Text.tertiary)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                }
                .opacity(hasAppeared ? 1 : 0)
                .offset(y: hasAppeared ? 0 : 20)
                .animation(.easeOut(duration: 0.6).delay(0.4), value: hasAppeared)

                Spacer()

                // Continue Button with glass effect
                continueButton
                    .padding(.horizontal, 20)
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.6), value: hasAppeared)
            }
            .padding(.bottom, 40)
        }
        .navigationBarHidden(true)
        .onAppear {
            withAnimation {
                hasAppeared = true
            }
            // Trigger confetti after success icon appears
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
                withAnimation(.easeOut(duration: 0.5)) {
                    showConfetti = true
                }
            }
            // Start pulse animation
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                    pulseAnimation = true
                }
            }
        }
    }

    @ViewBuilder
    private var successIcon: some View {
        if #available(iOS 26.0, *) {
            ZStack {
                // Pulsing outer glow
                Circle()
                    .fill(AppColors.Accent.gold.opacity(0.1))
                    .frame(width: 180, height: 180)
                    .scaleEffect(pulseAnimation ? 1.1 : 0.95)
                    .opacity(pulseAnimation ? 0.5 : 0.3)

                // Glass outer ring
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 140, height: 140)
                    .glassEffect(.regular.tint(AppColors.Accent.gold.opacity(0.2)))
                    .scaleEffect(hasAppeared ? 1 : 0.5)
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.spring(response: 0.6, dampingFraction: 0.7).delay(0.2), value: hasAppeared)

                // Inner glass circle
                Circle()
                    .fill(.ultraThinMaterial)
                    .frame(width: 100, height: 100)
                    .glassEffect(.regular.tint(AppColors.Accent.gold.opacity(0.3)).interactive())
                    .scaleEffect(hasAppeared ? 1 : 0.5)
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.3), value: hasAppeared)

                // Checkmark
                Image(systemName: "checkmark")
                    .font(.system(size: 40, weight: .bold))
                    .foregroundStyle(AppColors.Accent.gold)
                    .scaleEffect(hasAppeared ? 1 : 0)
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.spring(response: 0.4, dampingFraction: 0.5).delay(0.5), value: hasAppeared)
            }
        } else {
            // Fallback for older iOS versions
            ZStack {
                // Outer ring
                Circle()
                    .stroke(AppColors.Accent.gold.opacity(0.2), lineWidth: 2)
                    .frame(width: 160, height: 160)
                    .scaleEffect(hasAppeared ? 1 : 0.5)
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.8).delay(0.1), value: hasAppeared)

                // Inner ring
                Circle()
                    .stroke(AppColors.Accent.gold.opacity(0.4), lineWidth: 2)
                    .frame(width: 120, height: 120)
                    .scaleEffect(hasAppeared ? 1 : 0.5)
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.2), value: hasAppeared)

                // Center circle
                Circle()
                    .fill(AppColors.Accent.gold.opacity(0.1))
                    .frame(width: 100, height: 100)
                    .scaleEffect(hasAppeared ? 1 : 0.5)
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.5).delay(0.3), value: hasAppeared)

                // Checkmark
                Image(systemName: "checkmark")
                    .font(.system(size: 40, weight: .medium))
                    .foregroundStyle(AppColors.Accent.gold)
                    .scaleEffect(hasAppeared ? 1 : 0)
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.spring(response: 0.5, dampingFraction: 0.6).delay(0.5), value: hasAppeared)
            }
        }
    }

    @ViewBuilder
    private var continueButton: some View {
        if #available(iOS 26.0, *) {
            Button {
                dismiss()
            } label: {
                Text("CONTINUE SHOPPING")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
            }
            .buttonStyle(.glassProminent)
            .tint(AppColors.Accent.gold)
        } else {
            Button {
                dismiss()
            } label: {
                Text("CONTINUE SHOPPING")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(AppColors.Button.primaryBackground)
            }
        }
    }

    // MARK: - Confetti View
    private var confettiView: some View {
        GeometryReader { geometry in
            ZStack {
                ForEach(0..<20, id: \.self) { index in
                    ConfettiPiece(
                        color: confettiColors[index % confettiColors.count],
                        size: CGFloat.random(in: 6...12),
                        startX: CGFloat.random(in: 0...geometry.size.width),
                        delay: Double(index) * 0.05
                    )
                }
            }
        }
        .allowsHitTesting(false)
    }

    private var confettiColors: [Color] {
        [
            AppColors.Accent.gold,
            AppColors.Accent.gold.opacity(0.7),
            AppColors.Accent.sale,
            Color.white.opacity(0.8),
            AppColors.Accent.gold.opacity(0.5)
        ]
    }
}

// MARK: - Confetti Piece
private struct ConfettiPiece: View {
    let color: Color
    let size: CGFloat
    let startX: CGFloat
    let delay: Double

    @State private var isAnimating = false

    var body: some View {
        Circle()
            .fill(color)
            .frame(width: size, height: size)
            .position(
                x: startX + (isAnimating ? CGFloat.random(in: -50...50) : 0),
                y: isAnimating ? UIScreen.main.bounds.height + 50 : -50
            )
            .opacity(isAnimating ? 0 : 1)
            .rotationEffect(.degrees(isAnimating ? Double.random(in: 180...720) : 0))
            .onAppear {
                withAnimation(
                    .easeOut(duration: Double.random(in: 2...3))
                    .delay(delay)
                ) {
                    isAnimating = true
                }
            }
    }
}

// MARK: - Preview
#Preview {
    OrderSuccessView()
}
