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
    
    var body: some View {
        ZStack {
            // Background
            AppColors.Background.primary
                .ignoresSafeArea()
            
            VStack(spacing: 32) {
                Spacer()
                
                // Success Icon
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
                
                // Continue Button
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
        }
    }
    
    private var successIcon: some View {
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

// MARK: - Preview
#Preview {
    OrderSuccessView()
}
