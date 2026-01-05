//
//  BagItemView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct BagItemView: View {
    
    let item: BagItem
    let onIncrement: () -> Void
    let onDecrement: () -> Void
    let onRemove: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            // Product Image
            AsyncImageView(imageUrl: item.product.images.first) {
                Rectangle()
                    .fill(AppColors.Background.secondary)
            }
            .frame(width: 100, height: 120)
            .clipShape(RoundedRectangle(cornerRadius: 4))
            
            // Product Info
            VStack(alignment: .leading, spacing: 8) {
                // Brand
                Text(item.product.brand.name.uppercased())
                    .font(.system(size: 10, weight: .medium))
                    .tracking(1)
                    .foregroundStyle(AppColors.Text.muted)
                
                // Name
                Text(item.product.name)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.Text.primary)
                    .lineLimit(2)
                
                // Size
                Text("Size: \(item.size)")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.Text.tertiary)
                
                Spacer()
                
                // Quantity Controls
                HStack(spacing: 0) {
                    quantityButton(icon: "minus", action: onDecrement)
                    
                    Text("\(item.quantity)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(AppColors.Text.primary)
                        .frame(width: 40)
                    
                    quantityButton(icon: "plus", action: onIncrement)
                }
            }
            
            // Price & Remove
            VStack(alignment: .trailing, spacing: 8) {
                // Remove Button
                Button(action: onRemove) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundStyle(AppColors.Text.muted)
                }
                
                Spacer()
                
                // Price
                VStack(alignment: .trailing, spacing: 2) {
                    Text("$\(item.product.price, specifier: "%.0f")")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(item.product.originalPrice != nil ? AppColors.Accent.sale : AppColors.Text.primary)
                    
                    if let originalPrice = item.product.originalPrice {
                        Text("$\(NSDecimalNumber(decimal: originalPrice).doubleValue, specifier: "%.0f")")
                            .font(.system(size: 12))
                            .strikethrough()
                            .foregroundStyle(AppColors.Text.muted)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(12)
        .frame(height: 144)
        .frame(maxWidth: .infinity)
        .background(AppColors.Background.surface)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(AppColors.Border.subtle, lineWidth: 1)
        )
    }
    
    private func quantityButton(icon: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppColors.Text.primary)
                .frame(width: 32, height: 32)
                .background(AppColors.Background.secondary)
                .clipShape(Circle())
        }
    }
}

// MARK: - Preview
#Preview {
    BagItemView(
        item: BagItem.sampleItems[0],
        onIncrement: {},
        onDecrement: {},
        onRemove: {}
    )
    .padding()
    .background(AppColors.Background.primary)
}
