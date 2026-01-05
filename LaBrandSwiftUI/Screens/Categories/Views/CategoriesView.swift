//
//  CategoriesView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct CategoriesView: View {
    
    // MARK: - Properties
    @Environment(\.tabSelection) private var tabSelection
    @StateObject private var viewModel = CategoriesViewModel()
    @State private var selectedCategoryIndex = 0
    @State private var scrollPosition: Int? = nil
    @State private var hasAppeared = false
    
    private let segments = ["Women", "Men", "Kids"]
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: 0) {
            // Segmented Control
            segmentedControl
            
            // Content
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 0) {
                    ForEach(0..<segments.count, id: \.self) { index in
                        categoryContent(for: index)
                            .id(index)
                            .containerRelativeFrame(.horizontal)
                    }
                }
            }
            .scrollTargetLayout()
            .scrollTargetBehavior(.viewAligned)
            .scrollPosition(id: $scrollPosition, anchor: .center)
            .animation(.smooth, value: scrollPosition)
            .onChange(of: selectedCategoryIndex) { _, new in
                scrollPosition = new
            }
            .onChange(of: scrollPosition) { _, new in
                guard let new else { return }
                withAnimation(.easeInOut(duration: 0.2)) {
                    selectedCategoryIndex = new
                }
            }
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("CATEGORIES")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
            
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    // Search action
                } label: {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 16))
                        .foregroundStyle(AppColors.Text.primary)
                }
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension CategoriesView {
    
    var segmentedControl: some View {
        HStack(spacing: 0) {
            ForEach(segments.indices, id: \.self) { index in
                Button {
                    withAnimation(.spring(response: 0.4)) {
                        selectedCategoryIndex = index
                    }
                } label: {
                    VStack(spacing: 8) {
                        Text(segments[index].uppercased())
                            .font(.system(size: 13, weight: .semibold))
                            .tracking(2)
                            .foregroundStyle(selectedCategoryIndex == index ? AppColors.Text.primary : AppColors.Text.muted)
                        
                        Rectangle()
                            .fill(selectedCategoryIndex == index ? AppColors.Accent.gold : Color.clear)
                            .frame(height: 2)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.top, 8)
        .background(AppColors.Background.surface)
    }
    
    func categoryContent(for index: Int) -> some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                // Sale Banner
                saleBanner
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(y: hasAppeared ? 0 : 20)
                    .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
                
                // Categories List
                VStack(spacing: 12) {
                    ForEach(Array(viewModel.categories.enumerated()), id: \.element.id) { idx, category in
                        NavigationLink(destination: CategoryDetailView(category: category)) {
                            CategoryCard(category: category)
                        }
                        .opacity(hasAppeared ? 1 : 0)
                        .offset(y: hasAppeared ? 0 : 20)
                        .animation(
                            .easeOut(duration: 0.5).delay(0.2 + Double(idx) * 0.08),
                            value: hasAppeared
                        )
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
            .padding(.bottom, 32)
        }
    }
    
    var saleBanner: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [Color(hex: "C41E3A"), Color(hex: "8B0000")],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Pattern overlay
            GeometryReader { geo in
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.1), lineWidth: 1)
                        .frame(width: 100, height: 100)
                        .offset(x: geo.size.width - 60, y: -20)
                    
                    Circle()
                        .stroke(Color.white.opacity(0.08), lineWidth: 1)
                        .frame(width: 60, height: 60)
                        .offset(x: geo.size.width - 100, y: 50)
                }
            }
            
            // Content
            HStack {
                VStack(alignment: .leading, spacing: 8) {
                    Text("SUMMER SALE")
                        .font(.custom("Georgia", size: 22))
                        .fontWeight(.medium)
                        .tracking(2)
                        .foregroundStyle(.white)
                    
                    Text("Up to 50% off")
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.9))
                }
                
                Spacer()
                
                Image(systemName: "arrow.right")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(Color.white.opacity(0.2))
                    .clipShape(Circle())
            }
            .padding(.horizontal, 24)
        }
        .frame(height: 100)
        .clipShape(RoundedRectangle(cornerRadius: 4))
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        CategoriesView()
    }
}
