//
//  SplashView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct SplashView: View {
    
    // MARK: - Properties
    @State private var isAnimating = false
    @State private var logoScale: CGFloat = 0.8
    @State private var logoOpacity: Double = 0
    @State private var ringScale: CGFloat = 0.5
    @State private var ringOpacity: Double = 0
    @State private var taglineOpacity: Double = 0
    
    var onComplete: () -> Void
    
    // MARK: - Body
    var body: some View {
        ZStack {
            // Background
            backgroundView
            
            // Content
            VStack(spacing: 24) {
                Spacer()
                
                // Logo with animated ring
                ZStack {
                    // Outer ring
                    Circle()
                        .stroke(
                            LinearGradient(
                                colors: [
                                    Color(hex: "C4A77D").opacity(0.6),
                                    Color(hex: "C4A77D").opacity(0.2)
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            lineWidth: 1
                        )
                        .frame(width: 160, height: 160)
                        .scaleEffect(ringScale)
                        .opacity(ringOpacity)
                    
                    // Inner ring
                    Circle()
                        .stroke(Color(hex: "C4A77D").opacity(0.3), lineWidth: 1)
                        .frame(width: 120, height: 120)
                        .scaleEffect(ringScale)
                        .opacity(ringOpacity * 0.7)
                    
                    // Brand Name
                    VStack(spacing: 8) {
                        Text("LABRAND")
                            .font(.custom("Georgia", size: 32))
                            .fontWeight(.medium)
                            .tracking(8)
                            .foregroundStyle(.white)
                        
                        // Decorative line
                        Rectangle()
                            .fill(Color(hex: "C4A77D"))
                            .frame(width: 40, height: 1)
                    }
                    .scaleEffect(logoScale)
                    .opacity(logoOpacity)
                }
                
                Spacer()
                
                // Tagline
                VStack(spacing: 8) {
                    Text("LUXURY FASHION")
                        .font(.system(size: 11, weight: .medium))
                        .tracking(4)
                        .foregroundStyle(Color(hex: "C4A77D"))
                    
                    Text("Curated for you")
                        .font(.custom("Georgia", size: 14))
                        .foregroundStyle(.white.opacity(0.6))
                }
                .opacity(taglineOpacity)
                .padding(.bottom, 80)
            }
            
            // Decorative elements
            decorativeElements
        }
        .onAppear {
            startAnimations()
        }
    }
    
    // MARK: - Background
    private var backgroundView: some View {
        ZStack {
            // Base gradient
            LinearGradient(
                colors: [
                    Color(hex: "0D0D0D"),
                    Color(hex: "1A1A1A"),
                    Color(hex: "0D0D0D")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            // Ambient glow
            Circle()
                .fill(Color(hex: "C4A77D").opacity(0.08))
                .frame(width: 400, height: 400)
                .blur(radius: 100)
                .offset(y: -100)
        }
    }
    
    // MARK: - Decorative Elements
    private var decorativeElements: some View {
        GeometryReader { geometry in
            ZStack {
                // Corner accents
                // Top left
                Rectangle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
                    .frame(width: 40, height: 40)
                    .mask(
                        Rectangle()
                            .frame(width: 20, height: 20)
                            .offset(x: -10, y: -10)
                    )
                    .position(x: 40, y: 100)
                    .opacity(ringOpacity)
                
                // Bottom right
                Rectangle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
                    .frame(width: 40, height: 40)
                    .mask(
                        Rectangle()
                            .frame(width: 20, height: 20)
                            .offset(x: 10, y: 10)
                    )
                    .position(x: geometry.size.width - 40, y: geometry.size.height - 140)
                    .opacity(ringOpacity)
                
                // Floating particles
                ForEach(0..<8, id: \.self) { index in
                    Circle()
                        .fill(Color(hex: "C4A77D").opacity(0.3))
                        .frame(width: CGFloat.random(in: 2...4))
                        .position(
                            x: CGFloat.random(in: 0...geometry.size.width),
                            y: CGFloat.random(in: 0...geometry.size.height)
                        )
                        .opacity(taglineOpacity)
                }
            }
        }
    }
    
    // MARK: - Animations
    private func startAnimations() {
        // Logo fade in
        withAnimation(.easeOut(duration: 0.8)) {
            logoOpacity = 1
            logoScale = 1
        }
        
        // Ring expansion
        withAnimation(.easeOut(duration: 1.0).delay(0.3)) {
            ringOpacity = 1
            ringScale = 1
        }
        
        // Tagline fade in
        withAnimation(.easeOut(duration: 0.6).delay(0.8)) {
            taglineOpacity = 1
        }
        
        // Complete after animations
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            onComplete()
        }
    }
}

// MARK: - Preview
#Preview {
    SplashView {
        print("Splash complete")
    }
}

