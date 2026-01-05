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
            HStack(spacing: 8) {
                // Color swatch
                Circle()
                    .fill(colorValue)
                    .frame(width: 16, height: 16)
                    .overlay(
                        Circle()
                            .stroke(
                                color == "White" ? AppColors.Border.primary : Color.clear,
                                lineWidth: 1
                            )
                    )
                
                Text(color)
                    .font(.system(size: 13, weight: .medium))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(isSelected ? AppColors.Button.primaryBackground : AppColors.Background.secondary)
            .foregroundStyle(isSelected ? AppColors.Button.primaryText : AppColors.Text.primary)
            .clipShape(Capsule())
            .overlay(
                Capsule()
                    .stroke(isSelected ? Color.clear : AppColors.Border.primary, lineWidth: 1)
            )
        }
    }
    
    private var colorValue: Color {
        switch color.lowercased() {
        case "black": return .black
        case "white": return .white
        case "red": return Color(hex: "C41E3A")
        case "blue": return Color(hex: "1E40AF")
        case "green": return Color(hex: "166534")
        case "yellow": return Color(hex: "CA8A04")
        case "pink": return Color(hex: "DB2777")
        case "navy": return Color(hex: "1E3A5F")
        case "beige": return Color(hex: "D4B896")
        case "brown": return Color(hex: "78350F")
        case "gray", "grey": return Color(hex: "6B7280")
        default: return .gray
        }
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 12) {
        HStack(spacing: 8) {
            ColorFilterChip(color: "Black", isSelected: true) {}
            ColorFilterChip(color: "White", isSelected: false) {}
        }
        HStack(spacing: 8) {
            ColorFilterChip(color: "Red", isSelected: false) {}
            ColorFilterChip(color: "Blue", isSelected: true) {}
        }
    }
    .padding()
    .background(AppColors.Background.primary)
}
