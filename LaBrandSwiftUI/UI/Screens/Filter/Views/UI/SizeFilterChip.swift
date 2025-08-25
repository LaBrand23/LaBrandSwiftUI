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
                .font(.subheadline)
                .frame(width: 44, height: 44)
                .background(isSelected ? Color.red : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(12)
        }
    }
}
