//
//  ColorSelectionView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct ColorSelectionView: View {
    let colors: [String]
    @Binding var selectedColor: String?
    
    private let columns = [
        GridItem(.adaptive(minimum: 80), spacing: 12)
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Available colors")
                .font(.headline)
                .padding(.horizontal)
            
            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(colors, id: \.self) { color in
                    ColorSelectionItem(
                        color: color,
                        isSelected: selectedColor == color,
                        action: { selectedColor = color }
                    )
                }
            }
            .padding(.horizontal)
        }
    }
}

struct ColorSelectionItem: View {
    let color: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Circle()
                    .fill(Color(hex: color))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Circle()
                            .strokeBorder(isSelected ? Color.red : Color.clear, lineWidth: 2)
                    )
                    .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
                
                Text(colorName)
                    .font(.caption)
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.center)
            }
        }
    }
    
    private var colorName: String {
        // Simple color name mapping - in real app this would come from API
        switch color.lowercased() {
        case "#ff0000", "#ff0000": return "Red"
        case "#0000ff", "#0000ff": return "Blue"
        case "#ffffff", "#ffffff": return "White"
        case "#000000", "#000000": return "Black"
        case "#ffff00", "#ffff00": return "Yellow"
        case "#00ff00", "#00ff00": return "Green"
        default: return "Color"
        }
    }
}

#Preview {
    ColorSelectionView(
        colors: ["#FF0000", "#0000FF", "#FFFFFF", "#000000"],
        selectedColor: .constant("#FF0000")
    )
    .padding()
}
