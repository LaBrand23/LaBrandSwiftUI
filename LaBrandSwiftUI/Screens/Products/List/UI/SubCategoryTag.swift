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
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(isSelected ? AppColors.Button.primaryText : AppColors.Text.primary)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? AppColors.Button.primaryBackground : AppColors.Background.secondary)
                .clipShape(Capsule())
        }
    }
}

// MARK: - Preview
#Preview {
    HStack(spacing: 10) {
        SubCategoryTag(title: "All", isSelected: true) {}
        SubCategoryTag(title: "T-Shirts", isSelected: false) {}
        SubCategoryTag(title: "Shirts", isSelected: false) {}
    }
    .padding()
    .background(AppColors.Background.primary)
}

