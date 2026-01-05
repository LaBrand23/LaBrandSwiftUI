//
//  SizeButton.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct SizeButton: View {
    
    let size: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(size)
                .font(.system(size: 14, weight: .medium))
                .frame(width: 48, height: 48)
                .background(isSelected ? AppColors.Button.primaryBackground : AppColors.Background.secondary)
                .foregroundStyle(isSelected ? AppColors.Button.primaryText : AppColors.Text.primary)
                .clipShape(RoundedRectangle(cornerRadius: 4))
                .overlay(
                    RoundedRectangle(cornerRadius: 4)
                        .stroke(isSelected ? Color.clear : AppColors.Border.primary, lineWidth: 1)
                )
        }
    }
}

// MARK: - Preview
#Preview {
    HStack(spacing: 10) {
        SizeButton(size: "S", isSelected: false) {}
        SizeButton(size: "M", isSelected: true) {}
        SizeButton(size: "L", isSelected: false) {}
    }
    .padding()
    .background(AppColors.Background.primary)
}

