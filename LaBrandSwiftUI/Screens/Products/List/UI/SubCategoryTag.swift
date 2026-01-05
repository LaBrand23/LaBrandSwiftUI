//
//  SubCategoryTag.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct SubCategoryTag: View {
    
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    @State private var isPressed = false
    
    var body: some View {
        Button(action: action) {
            Text(title.uppercased())
                .font(.system(size: 11, weight: .semibold))
                .tracking(1)
                .foregroundStyle(isSelected ? AppColors.Button.primaryText : AppColors.Text.secondary)
                .padding(.horizontal, 18)
                .padding(.vertical, 10)
                .background(
                    Capsule()
                        .fill(isSelected ? AppColors.Button.primaryBackground : AppColors.Background.surface)
                )
                .overlay(
                    Capsule()
                        .stroke(isSelected ? Color.clear : AppColors.Border.primary, lineWidth: 1)
                )
        }
        .buttonStyle(SubCategoryTagButtonStyle())
    }
}

// MARK: - Button Style
private struct SubCategoryTagButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 20) {
        // Light background
        HStack(spacing: 10) {
            SubCategoryTag(title: "All", isSelected: true) {}
            SubCategoryTag(title: "T-Shirts", isSelected: false) {}
            SubCategoryTag(title: "Shirts", isSelected: false) {}
        }
        .padding()
        .background(AppColors.Background.primary)
        
        // Surface background
        HStack(spacing: 10) {
            SubCategoryTag(title: "Dresses", isSelected: false) {}
            SubCategoryTag(title: "Jackets", isSelected: true) {}
            SubCategoryTag(title: "Pants", isSelected: false) {}
        }
        .padding()
        .background(AppColors.Background.surface)
    }
}

