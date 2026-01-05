//
//  OnboardingView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct OnboardingView: View {
    
    // MARK: - Properties
    @State private var currentPage = 0
    @State private var hasAppeared = false
    @Binding var hasCompletedOnboarding: Bool
    
    private let pages = OnboardingPage.pages
    
    // MARK: - Body
    var body: some View {
        ZStack {
            // Background
            Color.black
                .ignoresSafeArea()
            
            // Page Content
            TabView(selection: $currentPage) {
                ForEach(pages.indices, id: \.self) { index in
                    OnboardingPageView(
                        page: pages[index],
                        isActive: currentPage == index
                    )
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .ignoresSafeArea()
            
            // Overlay Content
            VStack {
                // Top Bar with Logo and Skip
                HStack {
                    // Brand Logo
                    Text("LABRAND")
                        .font(.custom("Georgia", size: 18))
                        .fontWeight(.medium)
                        .tracking(4)
                        .foregroundStyle(.white)
                        .opacity(hasAppeared ? 1 : 0)
                        .offset(y: hasAppeared ? 0 : -10)
                        .animation(.easeOut(duration: 0.6).delay(0.3), value: hasAppeared)
                    
                    Spacer()
                    
                    if currentPage < pages.count - 1 {
                        Button {
                            withAnimation(.spring(response: 0.5)) {
                                currentPage = pages.count - 1
                            }
                        } label: {
                            Text("Skip")
                                .font(.system(size: 14, weight: .medium))
                                .foregroundStyle(.white.opacity(0.7))
                                .padding(.horizontal, 16)
                                .padding(.vertical, 8)
                        }
                    }
                }
                .padding(.top, 60)
                .padding(.horizontal, 24)
                
                Spacer()
                
                // Bottom Content
                VStack(spacing: 32) {
                    // Custom Page Indicator
                    HStack(spacing: 8) {
                        ForEach(pages.indices, id: \.self) { index in
                            Capsule()
                                .fill(currentPage == index ? AppColors.Accent.gold : Color.white.opacity(0.3))
                                .frame(width: currentPage == index ? 28 : 8, height: 4)
                                .animation(.spring(response: 0.4), value: currentPage)
                        }
                    }
                    .opacity(hasAppeared ? 1 : 0)
                    .animation(.easeOut(duration: 0.6).delay(0.5), value: hasAppeared)
                    
                    // Text Content
                    VStack(spacing: 16) {
                        Text(pages[currentPage].title)
                            .font(.custom("Georgia", size: 36))
                            .fontWeight(.regular)
                            .foregroundStyle(.white)
                            .multilineTextAlignment(.center)
                            .lineSpacing(6)
                        
                        Text(pages[currentPage].subtitle)
                            .font(.system(size: 15))
                            .foregroundStyle(.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                            .lineLimit(2)
                            .padding(.horizontal, 20)
                    }
                    .id(currentPage)
                    .transition(.asymmetric(
                        insertion: .opacity.combined(with: .offset(y: 20)),
                        removal: .opacity.combined(with: .offset(y: -20))
                    ))
                    .animation(.easeOut(duration: 0.4), value: currentPage)
                    
                    // Action Button
                    Button {
                        if currentPage < pages.count - 1 {
                            withAnimation(.spring(response: 0.5)) {
                                currentPage += 1
                            }
                        } else {
                            withAnimation(.easeOut(duration: 0.3)) {
                                hasCompletedOnboarding = true
                            }
                        }
                    } label: {
                        HStack(spacing: 10) {
                            Text(currentPage == pages.count - 1 ? "GET STARTED" : "CONTINUE")
                                .font(.system(size: 14, weight: .semibold))
                                .tracking(2)
                            
                            if currentPage < pages.count - 1 {
                                Image(systemName: "arrow.right")
                                    .font(.system(size: 13, weight: .semibold))
                            }
                        }
                        .foregroundStyle(AppColors.Background.editorial)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 18)
                        .background(Color.white)
                    }
                    .padding(.horizontal, 32)
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.6).delay(0.7), value: hasAppeared)
                    
                    // Sign In Link (only on last page)
                    if currentPage == pages.count - 1 {
                        Button {
                            hasCompletedOnboarding = true
                        } label: {
                            HStack(spacing: 4) {
                                Text("Already have an account?")
                                    .foregroundStyle(.white.opacity(0.6))
                                Text("Sign In")
                                    .foregroundStyle(AppColors.Accent.gold)
                            }
                            .font(.system(size: 13))
                        }
                        .transition(.opacity.combined(with: .offset(y: 10)))
                    }
                }
                .padding(.bottom, 50)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.8)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Onboarding Page View
struct OnboardingPageView: View {
    let page: OnboardingPage
    let isActive: Bool
    
    @State private var parallaxOffset: CGFloat = 0
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background - Try image first, fallback to gradient
                Group {
                    if let uiImage = UIImage(named: page.imageName) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } else {
                        // Beautiful fallback gradient background
                        mockBackground(for: page, in: geometry)
                    }
                }
                .frame(width: geometry.size.width, height: geometry.size.height + 40)
                .scaleEffect(isActive ? 1.0 : 1.05)
                .offset(y: parallaxOffset)
                .animation(.easeOut(duration: 0.8), value: isActive)
                
                // Gradient Overlays for text legibility
                VStack(spacing: 0) {
                    // Top gradient
                    LinearGradient(
                        stops: [
                            .init(color: .black.opacity(0.5), location: 0),
                            .init(color: .clear, location: 1)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: geometry.size.height * 0.25)
                    
                    Spacer()
                    
                    // Bottom gradient
                    LinearGradient(
                        stops: [
                            .init(color: .clear, location: 0),
                            .init(color: .black.opacity(0.3), location: 0.2),
                            .init(color: .black.opacity(0.85), location: 0.7),
                            .init(color: .black, location: 1)
                        ],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: geometry.size.height * 0.6)
                }
                
                // Decorative blur elements
                decorativeElements(in: geometry)
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(
                .easeInOut(duration: 10)
                .repeatForever(autoreverses: true)
            ) {
                parallaxOffset = -30
            }
        }
    }
    
    // MARK: - Mock Background
    @ViewBuilder
    private func mockBackground(for page: OnboardingPage, in geometry: GeometryProxy) -> some View {
        ZStack {
            // Base gradient
            LinearGradient(
                colors: page.gradientColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Decorative shapes
            ZStack {
                // Large circle blur
                Circle()
                    .fill(page.accentColor.opacity(0.4))
                    .frame(width: 400, height: 400)
                    .blur(radius: 100)
                    .offset(x: geometry.size.width * 0.2, y: -geometry.size.height * 0.15)
                
                // Medium circle
                Circle()
                    .fill(Color.white.opacity(0.1))
                    .frame(width: 300, height: 300)
                    .blur(radius: 80)
                    .offset(x: -geometry.size.width * 0.3, y: geometry.size.height * 0.2)
                
                // Gold accent circle
                Circle()
                    .fill(AppColors.Accent.gold.opacity(0.3))
                    .frame(width: 200, height: 200)
                    .blur(radius: 60)
                    .offset(x: geometry.size.width * 0.1, y: geometry.size.height * 0.3)
                
                // Geometric elements
                RoundedRectangle(cornerRadius: 0)
                    .stroke(Color.white.opacity(0.1), lineWidth: 1)
                    .frame(width: 150, height: 200)
                    .rotationEffect(.degrees(15))
                    .offset(x: geometry.size.width * 0.25, y: -geometry.size.height * 0.05)
                
                RoundedRectangle(cornerRadius: 0)
                    .stroke(Color.white.opacity(0.08), lineWidth: 1)
                    .frame(width: 100, height: 140)
                    .rotationEffect(.degrees(-10))
                    .offset(x: -geometry.size.width * 0.2, y: geometry.size.height * 0.15)
                
                // Fashion silhouette placeholder
                fashionSilhouette(in: geometry)
            }
        }
    }
    
    // MARK: - Fashion Silhouette
    @ViewBuilder
    private func fashionSilhouette(in geometry: GeometryProxy) -> some View {
        ZStack {
            // Abstract fashion figure
            Capsule()
                .fill(
                    LinearGradient(
                        colors: [Color.white.opacity(0.15), Color.white.opacity(0.05)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .frame(width: 120, height: 350)
                .offset(y: -geometry.size.height * 0.05)
            
            // Accessories suggestion
            Circle()
                .stroke(AppColors.Accent.gold.opacity(0.4), lineWidth: 2)
                .frame(width: 60, height: 60)
                .offset(x: 30, y: -geometry.size.height * 0.25)
            
            // Bag outline
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.white.opacity(0.2), lineWidth: 1.5)
                .frame(width: 50, height: 60)
                .offset(x: -80, y: geometry.size.height * 0.05)
        }
    }
    
    // MARK: - Decorative Elements
    @ViewBuilder
    private func decorativeElements(in geometry: GeometryProxy) -> some View {
        ZStack {
            // Floating particles
            ForEach(0..<5, id: \.self) { index in
                Circle()
                    .fill(AppColors.Accent.gold.opacity(Double.random(in: 0.1...0.3)))
                    .frame(width: CGFloat.random(in: 4...8))
                    .offset(
                        x: CGFloat.random(in: -geometry.size.width/2...geometry.size.width/2),
                        y: CGFloat.random(in: -geometry.size.height/3...geometry.size.height/4)
                    )
                    .blur(radius: 1)
            }
            
            // Accent line
            Rectangle()
                .fill(AppColors.Accent.gold.opacity(0.5))
                .frame(width: 60, height: 2)
                .offset(x: -geometry.size.width * 0.25, y: -geometry.size.height * 0.3)
                .blur(radius: 0.5)
        }
        .opacity(isActive ? 1 : 0)
        .animation(.easeOut(duration: 1), value: isActive)
    }
}

// MARK: - Onboarding Page Model
struct OnboardingPage: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let imageName: String
    let gradientColors: [Color]
    let accentColor: Color
    
    static let pages: [OnboardingPage] = [
        OnboardingPage(
            title: "Discover\nYour Style",
            subtitle: "Explore curated collections from the world's finest designers",
            imageName: "onboarding_1",
            gradientColors: [Color(hex: "1A1A2E"), Color(hex: "16213E"), Color(hex: "0F3460")],
            accentColor: Color(hex: "E94560")
        ),
        OnboardingPage(
            title: "Timeless\nElegance",
            subtitle: "Find pieces that define sophistication and lasting beauty",
            imageName: "onboarding_2",
            gradientColors: [Color(hex: "2C3333"), Color(hex: "395B64"), Color(hex: "A5C9CA")],
            accentColor: Color(hex: "C4A77D")
        ),
        OnboardingPage(
            title: "Elevate Your\nWardrobe",
            subtitle: "Experience luxury fashion at your fingertips",
            imageName: "onboarding_3",
            gradientColors: [Color(hex: "1A1A1A"), Color(hex: "2D2D2D"), Color(hex: "4A4A4A")],
            accentColor: Color(hex: "C4A77D")
        )
    ]
}

// MARK: - Preview
#Preview {
    OnboardingView(hasCompletedOnboarding: .constant(false))
}
