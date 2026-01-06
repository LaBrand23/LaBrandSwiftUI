//
//  TrendingSectionView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct TrendingSectionView: View {
    let products: [Product]
    @Binding var selectedProduct: Product?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            SectionHeader(
                title: "TRENDING NOW",
                subtitle: "Most popular this week",
                showViewAll: true
            )
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 16) {
                    ForEach(products.prefix(4)) { product in
                        TrendingProductCard(product: product)
                            .navigateOnTap(to: product, selection: $selectedProduct)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

#Preview("Light Mode") {
    TrendingSectionView(
        products: [],
        selectedProduct: .constant(nil)
    )
    .background(AppColors.Background.primary)
    .withAppTheme()
}

#Preview("Dark Mode") {
    TrendingSectionView(
        products: [],
        selectedProduct: .constant(nil)
    )
    .background(AppColors.Background.primary)
    .preferredColorScheme(.dark)
    .withAppTheme()
}

