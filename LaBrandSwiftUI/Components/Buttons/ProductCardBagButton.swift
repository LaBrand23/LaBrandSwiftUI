//
//  ProductCardBagButton.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct ProductCardBagButton: View {
    
    var action: ()->Void
    
    init(action: @escaping ()-> Void) {
        self.action = action
    }
    
    var body: some View {
        Button {
            action()
        } label: {
            Image(systemName: "handbag.fill")
                .resizable()
                .scaledToFit()
                .foregroundStyle(.white)
                .padding(10)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .buttonStyle(ProductCardBagButtonStyle())
    }
}

struct ProductCardBagButtonStyle: ButtonStyle {
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(
                Circle()
                    .fill(Color.red)
                    .shadow(color: .gray.opacity(configuration.isPressed ? 0.3 : 0.5), radius: configuration.isPressed ? 3 : 5, y: configuration.isPressed ? 3 : 5)
                    .scaleEffect(configuration.isPressed ? 0.99 : 1)
            )
    }
}

#Preview {
    ProductCardBagButton(action: {})
        .frame(width: 40, height: 40)
}
