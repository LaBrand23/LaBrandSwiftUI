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
            ZStack {
                // Outer ring
                Circle()
                    .stroke(
                        isSelected ? AppColors.Accent.gold : Color.clear,
                        lineWidth: 2
                    )
                    .frame(width: 40, height: 40)
                
                // Inner color circle
                Circle()
                    .fill(colorValue)
                    .frame(width: 32, height: 32)
                    .overlay(
                        Circle()
                            .stroke(
                                needsBorder ? AppColors.Border.primary : Color.clear,
                                lineWidth: 1
                            )
                    )
            }
        }
    }
    
    private var colorValue: Color {
        Color(hex: color)
    }
    
    private var needsBorder: Bool {
        // Add border for light colors like white
        let lightColors = ["FFFFFF", "FFF", "FAFAFA", "F5F5F5", "FFFFF0", "FFFAFA"]
        return lightColors.contains(color.uppercased())
    }
}

// MARK: - Preview
#Preview {
    HStack(spacing: 12) {
        ColorButton(color: "1A1A1A", isSelected: true) {}
        ColorButton(color: "FFFFFF", isSelected: false) {}
        ColorButton(color: "C41E3A", isSelected: false) {}
        ColorButton(color: "1E40AF", isSelected: true) {}
    }
    .padding()
    .background(AppColors.Background.primary)
}
