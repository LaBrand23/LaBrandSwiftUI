//
//  SaleSectionView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct SaleSectionView: View {
    let products: [Product]
    @Binding var selectedProduct: Product?
    var onShopSaleTapped: (() -> Void)?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            // Sale Header with accent
            saleHeader
            
            // Products scroll
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 16) {
                    ForEach(products) { product in
                        ProductCard(product: product)
                            .navigateOnTap(to: product, selection: $selectedProduct)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
    
    // MARK: - Sale Header
    private var saleHeader: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 4) {
                Text("SALE")
                    .font(.custom("Georgia", size: 24))
                    .fontWeight(.medium)
                    .tracking(4)
                    .foregroundStyle(AppColors.Text.primary)
                
                Text("Up to 50% off selected items")
                    .font(.system(size: 13))
                    .foregroundStyle(AppColors.Text.tertiary)
            }
            
            Spacer()
            
            Button {
                onShopSaleTapped?()
            } label: {
                HStack(spacing: 6) {
                    Text("Shop Sale")
                        .font(.system(size: 13, weight: .medium))
                    Image(systemName: "arrow.right")
                        .font(.system(size: 11, weight: .medium))
                }
                .foregroundStyle(AppColors.Accent.sale)
            }
        }
        .padding(.horizontal, 20)
    }
}

#Preview("Light Mode") {
    SaleSectionView(
        products: [],
        selectedProduct: .constant(nil)
    )
    .background(AppColors.Background.primary)
    .withAppTheme()
}

#Preview("Dark Mode") {
    SaleSectionView(
        products: [],
        selectedProduct: .constant(nil)
    )
    .background(AppColors.Background.primary)
    .preferredColorScheme(.dark)
    .withAppTheme()
}

