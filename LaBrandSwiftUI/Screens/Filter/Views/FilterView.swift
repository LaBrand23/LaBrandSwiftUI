//
//  FilterView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct FilterView: View {
    
    // MARK: - Properties
    @Binding var selectedPriceRange: ClosedRange<Double>
    @Binding var selectedColors: Set<String>
    @Binding var selectedSizes: Set<String>
    @Binding var selectedBrands: Set<Brand>
    @Binding var isPresented: Bool
    @State private var showingBrandSearch = false
    
    private let colors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Navy"]
    private let sizes = ["XS", "S", "M", "L", "XL", "XXL"]
    
    // MARK: - Body
    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 32) {
                    // Price Range
                    priceRangeSection
                    
                    divider
                    
                    // Colors
                    colorsSection
                    
                    divider
                    
                    // Sizes
                    sizesSection
                    
                    divider
                    
                    // Brands
                    brandsSection
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 24)
            }
            .background(AppColors.Background.primary)
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("FILTERS")
                        .font(.custom("Georgia", size: 18))
                        .fontWeight(.medium)
                        .tracking(4)
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        resetFilters()
                    } label: {
                        Text("Reset")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.Text.tertiary)
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        isPresented = false
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.Text.primary)
                    }
                }
            }
            .safeAreaInset(edge: .bottom) {
                applyButton
            }
            .sheet(isPresented: $showingBrandSearch) {
                BrandSearchView(selectedBrands: $selectedBrands)
            }
        }
    }
    
    private var divider: some View {
        Rectangle()
            .fill(AppColors.Border.subtle)
            .frame(height: 1)
    }
    
    private func resetFilters() {
        selectedPriceRange = 0...1000
        selectedColors.removeAll()
        selectedSizes.removeAll()
        selectedBrands.removeAll()
    }
}

// MARK: - Sections
private extension FilterView {
    
    var priceRangeSection: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("PRICE RANGE")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            // Price labels
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("MIN")
                        .font(.system(size: 10, weight: .medium))
                        .tracking(1)
                        .foregroundStyle(AppColors.Text.muted)
                    Text("$\(Int(selectedPriceRange.lowerBound))")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(AppColors.Text.primary)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("MAX")
                        .font(.system(size: 10, weight: .medium))
                        .tracking(1)
                        .foregroundStyle(AppColors.Text.muted)
                    Text("$\(Int(selectedPriceRange.upperBound))")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(AppColors.Text.primary)
                }
            }
            
            RangeSlider(
                value: $selectedPriceRange,
                bounds: 0...1000,
                step: 10
            )
            .tint(AppColors.Accent.gold)
        }
    }
    
    var colorsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("COLORS")
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.tertiary)
                
                Spacer()
                
                if !selectedColors.isEmpty {
                    Text("\(selectedColors.count) selected")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.Accent.gold)
                }
            }
            
            FlowLayout(spacing: 10) {
                ForEach(colors, id: \.self) { color in
                    ColorFilterChip(
                        color: color,
                        isSelected: selectedColors.contains(color),
                        action: {
                            if selectedColors.contains(color) {
                                selectedColors.remove(color)
                            } else {
                                selectedColors.insert(color)
                            }
                        }
                    )
                }
            }
        }
    }
    
    var sizesSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("SIZES")
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.tertiary)
                
                Spacer()
                
                if !selectedSizes.isEmpty {
                    Text("\(selectedSizes.count) selected")
                        .font(.system(size: 12))
                        .foregroundStyle(AppColors.Accent.gold)
                }
            }
            
            FlowLayout(spacing: 10) {
                ForEach(sizes, id: \.self) { size in
                    SizeFilterChip(
                        size: size,
                        isSelected: selectedSizes.contains(size),
                        action: {
                            if selectedSizes.contains(size) {
                                selectedSizes.remove(size)
                            } else {
                                selectedSizes.insert(size)
                            }
                        }
                    )
                }
            }
        }
    }
    
    var brandsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("BRANDS")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            Button {
                showingBrandSearch = true
            } label: {
                HStack {
                    if selectedBrands.isEmpty {
                        Text("Select brands")
                            .font(.system(size: 14))
                            .foregroundStyle(AppColors.Text.tertiary)
                    } else {
                        Text(selectedBrands.map { $0.name }.joined(separator: ", "))
                            .font(.system(size: 14))
                            .foregroundStyle(AppColors.Text.primary)
                            .lineLimit(1)
                    }
                    
                    Spacer()
                    
                    HStack(spacing: 8) {
                        if !selectedBrands.isEmpty {
                            Text("\(selectedBrands.count)")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(.white)
                                .frame(width: 22, height: 22)
                                .background(AppColors.Accent.gold)
                                .clipShape(Circle())
                        }
                        
                        Image(systemName: "chevron.right")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundStyle(AppColors.Text.muted)
                    }
                }
                .padding(16)
                .background(AppColors.Background.secondary)
                .clipShape(RoundedRectangle(cornerRadius: 4))
            }
        }
    }
    
    var applyButton: some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(AppColors.Border.subtle)
                .frame(height: 1)
            
            Button {
                isPresented = false
            } label: {
                Text("APPLY FILTERS")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 56)
                    .background(AppColors.Button.primaryBackground)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .background(AppColors.Background.surface)
    }
}

// MARK: - Preview
#Preview {
    @Previewable @State var mockSelectedPriceRange: ClosedRange<Double> = 10.0...500.0
    @Previewable @State var mockSelectedColors: Set<String> = ["Red", "Blue"]
    @Previewable @State var mockSelectedSizes: Set<String> = ["S", "M"]
    @Previewable @State var mockSelectedBrands: Set<Brand> = []
    @Previewable @State var mockIsPresented: Bool = true

    FilterView(
        selectedPriceRange: $mockSelectedPriceRange,
        selectedColors: $mockSelectedColors,
        selectedSizes: $mockSelectedSizes,
        selectedBrands: $mockSelectedBrands,
        isPresented: $mockIsPresented
    )
}
