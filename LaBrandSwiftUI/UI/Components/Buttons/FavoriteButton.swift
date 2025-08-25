//
//  FavoriteButton.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct FavoriteButton: View {
    
    @State var isSelected = false
    var action: ()->Void
    
    init(isSelected: Bool, action: @escaping ()-> Void) {
        self.isSelected = isSelected
        self.action = action
    }
    
    var body: some View {
        Button {
            isSelected.toggle()
            action()
        } label: {
            Image(systemName: isSelected ? "heart.fill" : "heart")
                .resizable()
                .scaledToFit()
                .foregroundStyle(isSelected ? .red : .gray)
                .padding(10)
                .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .buttonStyle(FavoriteButtonStyle(isSelected: isSelected))
    }
}

struct FavoriteButtonStyle: ButtonStyle {
    
    var isSelected: Bool
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(
                Circle()
                    .fill(Color.white)
                    .shadow(color: .gray.opacity(configuration.isPressed ? 0.3 : 0.5), radius: configuration.isPressed ? 3 : 5, y: configuration.isPressed ? 3 : 5)
                    .scaleEffect(configuration.isPressed ? 0.99 : 1)
            )
    }
}

#Preview {
    FavoriteButton(isSelected: true) {}
    .frame(width: 40, height: 40)
}
