//
//  BrandSearchView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct BrandSearchView: View {
    
    // MARK: - Properties
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = BrandSearchViewModel()
    @Binding var selectedBrands: Set<Brand>
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        NavigationView {
            ZStack {
                VStack(spacing: 0) {
                    if viewModel.error != nil {
                        errorView
                    } else {
                        brandsList
                    }
                }
                .background(AppColors.Background.primary)
                
                if viewModel.isLoading {
                    loadingView
                }
            }
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(
                text: $viewModel.searchQuery,
                placement: .navigationBarDrawer(displayMode: .always),
                prompt: "Search brands"
            )
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("BRANDS")
                        .font(.custom("Georgia", size: 18))
                        .fontWeight(.medium)
                        .tracking(4)
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.Text.primary)
                    }
                }
            }
            .safeAreaInset(edge: .bottom) {
                bottomButtons
            }
        }
        .onAppear {
            viewModel.fetchBrands()
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension BrandSearchView {
    
    var errorView: some View {
        VStack(spacing: 16) {
            Spacer()
            
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 40))
                .foregroundStyle(AppColors.Accent.error)
            
            Text("Failed to load brands")
                .font(.system(size: 16, weight: .medium))
                .foregroundStyle(AppColors.Text.primary)
            
            Button {
                viewModel.fetchBrands()
            } label: {
                Text("Try Again")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.Accent.gold)
            }
            
            Spacer()
        }
    }
    
    var loadingView: some View {
        ProgressView()
            .tint(AppColors.Accent.gold)
            .scaleEffect(1.2)
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(AppColors.Shadow.light)
    }
    
    var brandsList: some View {
        ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 0) {
                ForEach(Array(viewModel.filteredBrands.enumerated()), id: \.element.id) { index, brand in
                    BrandRow(
                        brand: brand,
                        isSelected: selectedBrands.contains(brand)
                    ) {
                        if selectedBrands.contains(brand) {
                            selectedBrands.remove(brand)
                        } else {
                            selectedBrands.insert(brand)
                        }
                    }
                    .opacity(hasAppeared ? 1 : 0)
                    .offset(x: hasAppeared ? 0 : -20)
                    .animation(
                        .easeOut(duration: 0.3).delay(Double(index) * 0.02),
                        value: hasAppeared
                    )
                    
                    if brand.id != viewModel.filteredBrands.last?.id {
                        Rectangle()
                            .fill(AppColors.Border.subtle)
                            .frame(height: 1)
                            .padding(.leading, 56)
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 8)
        }
    }
    
    var bottomButtons: some View {
        VStack(spacing: 0) {
            Rectangle()
                .fill(AppColors.Border.subtle)
                .frame(height: 1)
            
            HStack(spacing: 12) {
                // Discard
                Button {
                    selectedBrands.removeAll()
                    dismiss()
                } label: {
                    Text("DISCARD")
                        .font(.system(size: 13, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(AppColors.Text.primary)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(
                            RoundedRectangle(cornerRadius: 0)
                                .stroke(AppColors.Border.primary, lineWidth: 1)
                        )
                }
                
                // Apply
                Button {
                    dismiss()
                } label: {
                    HStack(spacing: 8) {
                        Text("APPLY")
                            .font(.system(size: 13, weight: .semibold))
                            .tracking(2)
                        
                        if !selectedBrands.isEmpty {
                            Text("(\(selectedBrands.count))")
                                .font(.system(size: 13, weight: .semibold))
                        }
                    }
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(AppColors.Button.primaryBackground)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .background(AppColors.Background.surface)
    }
}

// MARK: - Brand Row
struct BrandRow: View {
    let brand: Brand
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Checkbox
                ZStack {
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(isSelected ? AppColors.Accent.gold : AppColors.Border.primary, lineWidth: isSelected ? 2 : 1)
                        .frame(width: 24, height: 24)
                    
                    if isSelected {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(AppColors.Accent.gold)
                            .frame(width: 24, height: 24)
                        
                        Image(systemName: "checkmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(AppColors.Text.inverted)
                    }
                }
                
                // Brand Name
                Text(brand.name)
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.Text.primary)
                
                Spacer()
            }
            .padding(.vertical, 14)
        }
    }
}

// MARK: - Preview
#Preview {
    @Previewable @State var selectedBrands: Set<Brand> = []
    BrandSearchView(selectedBrands: $selectedBrands)
}
