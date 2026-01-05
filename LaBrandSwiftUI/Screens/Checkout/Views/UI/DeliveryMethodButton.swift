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
                .background(isSelected ? AppColors.Accent.gold.opacity(0.1) : AppColors.Background.secondary)
                .cornerRadius(4)
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(isSelected ? AppColors.Accent.gold : Color.clear, lineWidth: 1)
                )
        }
    }
}

#Preview {
    HStack {
        DeliveryMethodButton(method: DeliveryMethod.dhl, isSelected: true, action: {})
        DeliveryMethodButton(method: DeliveryMethod.fedex, isSelected: false, action: {})
    }
    .padding()
    .background(AppColors.Background.primary)
    .withAppTheme()
}
