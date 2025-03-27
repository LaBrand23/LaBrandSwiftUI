//
//  RecommendedProductCard.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//
import SwiftUI

struct RecommendedProductCard: View {
    let product: Product
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Product Image
            AsyncImage(url: URL(string: product.images.first ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .foregroundColor(Color(.systemGray6))
            }
            .frame(width: 150, height: 200)
            .clipShape(RoundedRectangle(cornerRadius: 8))
            
            // Product Info
            Text(product.brand.name)
                .font(.caption)
                .foregroundColor(.gray)
            
            Text(product.name)
                .font(.subheadline)
                .lineLimit(1)
            
            Text("$\(String(format: "%.2f", product.price))")
                .font(.subheadline)
                .fontWeight(.semibold)
        }
        .frame(width: 150)
    }
}
