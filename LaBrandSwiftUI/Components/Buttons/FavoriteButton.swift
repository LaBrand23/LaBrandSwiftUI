//
//  FavoriteButton.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct FavoriteButton: View {
    
    @State var isSelected = false
    var action: () -> Void
    
    init(isSelected: Bool, action: @escaping () -> Void) {
        self._isSelected = State(initialValue: isSelected)
        self.action = action
    }
    
    var body: some View {
        Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                isSelected.toggle()
            }
            action()
        } label: {
            Image(systemName: isSelected ? "heart.fill" : "heart")
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(isSelected ? AppColors.Accent.sale : AppColors.Text.tertiary)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .scaleEffect(isSelected ? 1.1 : 1.0)
        }
        .buttonStyle(FavoriteButtonStyle())
    }
}

// MARK: - Button Style
struct FavoriteButtonStyle: ButtonStyle {
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(
                Circle()
                    .fill(AppColors.Background.surface)
                    .shadow(
                        color: AppColors.Shadow.medium.opacity(configuration.isPressed ? 0.5 : 1.0),
                        radius: configuration.isPressed ? 3 : 6,
                        y: configuration.isPressed ? 1 : 3
                    )
            )
            .scaleEffect(configuration.isPressed ? 0.92 : 1.0)
            .animation(.spring(response: 0.3), value: configuration.isPressed)
    }
}

// MARK: - Preview
#Preview {
    VStack(spacing: 30) {
        // On primary background
        HStack(spacing: 20) {
            FavoriteButton(isSelected: false) {}
                .frame(width: 36, height: 36)
            
            FavoriteButton(isSelected: true) {}
                .frame(width: 36, height: 36)
        }
        .padding(40)
        .background(AppColors.Background.primary)
        
        // On surface background
        HStack(spacing: 20) {
            FavoriteButton(isSelected: false) {}
                .frame(width: 36, height: 36)
            
            FavoriteButton(isSelected: true) {}
                .frame(width: 36, height: 36)
        }
        .padding(40)
        .background(AppColors.Background.surface)
    }
}
