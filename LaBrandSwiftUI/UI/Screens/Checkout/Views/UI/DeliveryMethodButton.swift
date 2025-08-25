//
//  DeliveryMethodButton.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct DeliveryMethodButton: View {
    let method: DeliveryMethod
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Image(method.image)
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 30)
                .padding()
                .background(isSelected ? Color.red.opacity(0.1) : Color(.systemGray6))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(isSelected ? Color.red : Color.clear, lineWidth: 1)
                )
        }
    }
}

#Preview {
    DeliveryMethodButton(method: DeliveryMethod.dhl, isSelected: true, action: {})
}
