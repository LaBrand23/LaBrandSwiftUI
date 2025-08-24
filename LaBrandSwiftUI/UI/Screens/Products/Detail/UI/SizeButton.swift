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
                .font(.subheadline)
                .fontWeight(.medium)
                .frame(width: 44, height: 44)
                .background(isSelected ? Color.black : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(12)
        }
    }
}
