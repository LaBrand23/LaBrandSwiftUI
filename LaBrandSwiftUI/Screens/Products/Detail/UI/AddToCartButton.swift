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
                Text("Add to Cart")
                    .fontWeight(.semibold)
                Spacer()
                Text("$\(String(format: "%.2f", Double(truncating: price as NSNumber)))")
                    .fontWeight(.semibold)
            }
            .foregroundColor(.white)
            .padding()
            .background(isEnabled ? Color.red : Color.gray)
            .cornerRadius(25)
        }
        .disabled(!isEnabled)
    }
}
