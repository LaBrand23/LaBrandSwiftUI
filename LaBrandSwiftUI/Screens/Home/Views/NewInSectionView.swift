//
//  NewInSectionView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct NewInSectionView: View {
    let products: [Product]
    @Binding var selectedProduct: Product?
    var hasAppeared: Bool = true
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            SectionHeader(
                title: "NEW IN",
                subtitle: "The latest arrivals",
                showViewAll: true
            )
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(Array(products.enumerated()), id: \.element.id) { index, product in
                        ProductCard(product: product)
                            .opacity(hasAppeared ? 1 : 0)
                            .offset(y: hasAppeared ? 0 : 30)
                            .animation(
                                .spring(response: 0.7, dampingFraction: 0.8)
                                .delay(0.3 + Double(index) * 0.08),
                                value: hasAppeared
                            )
                            .navigateOnTap(to: product, selection: $selectedProduct)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
    }
}

#Preview {
    NewInSectionView(
        products: [],
        selectedProduct: .constant(nil)
    )
    .background(AppColors.Background.primary)
    .withAppTheme()
}

