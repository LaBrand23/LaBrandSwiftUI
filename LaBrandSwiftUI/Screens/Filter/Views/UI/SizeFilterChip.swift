//
//  SizeFilterChip.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct SizeFilterChip: View {
    
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
        SizeFilterChip(size: "XS", isSelected: false) {}
        SizeFilterChip(size: "S", isSelected: true) {}
        SizeFilterChip(size: "M", isSelected: false) {}
        SizeFilterChip(size: "L", isSelected: true) {}
    }
    .padding()
    .background(AppColors.Background.primary)
}
