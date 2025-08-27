//
//  TrustBadgeView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct TrustBadgeView: View {
    let badge: TrustBadge
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: badge.icon)
                .font(.caption)
                .foregroundColor(badge.color)
            
            Text(badge.title)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.primary)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(
            RoundedRectangle(cornerRadius: 8)
                .fill(badge.color.opacity(0.1))
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .strokeBorder(badge.color.opacity(0.3), lineWidth: 1)
                )
        )
    }
}

#Preview {
    VStack(spacing: 10) {
        TrustBadgeView(badge: TrustBadge(title: "Free Returns", icon: "arrow.uturn.backward", color: .green))
        TrustBadgeView(badge: TrustBadge(title: "100% Authentic", icon: "checkmark.shield", color: .blue))
        TrustBadgeView(badge: TrustBadge(title: "Fast Delivery", icon: "truck", color: .orange))
    }
    .padding()
}
