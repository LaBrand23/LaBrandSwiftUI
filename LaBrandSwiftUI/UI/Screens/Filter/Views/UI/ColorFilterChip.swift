//
//  ColorFilterChip.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct ColorFilterChip: View {
    let color: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(color)
                .font(.subheadline)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.red : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
    }
}

#Preview {
    ColorFilterChip(color: "Red", isSelected: true) {}
}
