//
//  ColorButton.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct ColorButton: View {
    let color: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Circle()
                .fill(isSelected ? Color(hex: color) : Color(hex: color).opacity(0.7))
                .padding(4)
                .frame(width: 36, height: 36)
                .background(
                    Circle()
                        .strokeBorder(isSelected ? Color(hex: color) : .clear, lineWidth: 2)
//                        .padding(2)
                )
        }
    }
}
