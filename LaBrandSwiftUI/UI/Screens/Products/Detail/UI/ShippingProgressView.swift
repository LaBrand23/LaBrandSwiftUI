//
//  ShippingProgressView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct ShippingProgressView: View {
    let shippingInfo: ShippingInfo
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text(shippingInfo.message)
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                if shippingInfo.currentCartTotal < shippingInfo.freeShippingThreshold {
                    Text("$\(String(format: "%.2f", shippingInfo.remainingForFreeShipping))")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.red)
                }
            }
            
            if shippingInfo.currentCartTotal < shippingInfo.freeShippingThreshold {
                ProgressView(value: shippingInfo.progressPercentage)
                    .progressViewStyle(LinearProgressViewStyle(tint: .red))
                    .scaleEffect(y: 0.5)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(Color.green.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(Color.green.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

#Preview {
    VStack(spacing: 16) {
        ShippingProgressView(shippingInfo: ShippingInfo(
            freeShippingThreshold: 50.0,
            currentCartTotal: 38.0,
            remainingForFreeShipping: 12.0
        ))
        
        ShippingProgressView(shippingInfo: ShippingInfo(
            freeShippingThreshold: 50.0,
            currentCartTotal: 55.0,
            remainingForFreeShipping: 0.0
        ))
    }
    .padding()
}
