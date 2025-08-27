//
//  ProductPriceView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct ProductPriceView: View {
    let product: Product
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                // Current Price
                Text("$\(String(format: "%.2f", product.price))")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                // Original Price (if discounted)
                if let originalPrice = product.originalPrice {
                    Text("$\(String(format: "%.2f", Double(truncating: originalPrice as NSNumber)))")
                        .font(.subheadline)
                        .strikethrough()
                        .foregroundColor(.gray)
                }
                
                // Discount Badge
                if let discountPercentage = product.discountPercentage {
                    Text("-\(discountPercentage)%")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.red)
                        .cornerRadius(4)
                }
                
                Spacer()
            }
            
            // Installment Option
            if product.price >= 50 {
                HStack {
                    Text("or \(installmentCount) x $\(String(format: "%.2f", installmentAmount))")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
            }
        }
        .padding(.horizontal)
    }
    
    private var installmentCount: Int {
        return 3
    }
    
    private var installmentAmount: Double {
        return product.price / Double(installmentCount)
    }
}

#Preview {
    VStack(spacing: 20) {
        ProductPriceView(product: Product.mockProducts[0]) // With discount
        ProductPriceView(product: Product.mockProducts[2]) // Without discount
    }
    .padding()
}
