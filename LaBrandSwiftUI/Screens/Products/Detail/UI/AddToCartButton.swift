//
//  AddToCartButton.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct AddToCartButton: View {
    let price: Decimal
    let isEnabled: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Text("ADD TO BAG")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
                Spacer()
                Text("$\(String(format: "%.2f", Double(truncating: price as NSNumber)))")
                    .font(.system(size: 14, weight: .semibold))
            }
            .foregroundColor(AppColors.Button.primaryText)
            .padding()
            .background(isEnabled ? AppColors.Button.primaryBackground : AppColors.Button.disabled)
            .cornerRadius(0)
        }
        .disabled(!isEnabled)
    }
}
