//
//  SectionHeader.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

/// Reusable section header component for the Home screen
/// Can be used across different sections with optional subtitle and "View All" button
struct SectionHeader: View {
    let title: String
    var subtitle: String? = nil
    var showViewAll: Bool = false
    var onViewAllTapped: (() -> Void)?
    
    var body: some View {
        HStack(alignment: .bottom) {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.custom("Georgia", size: 20))
                    .fontWeight(.medium)
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.primary)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.system(size: 13))
                        .foregroundStyle(AppColors.Text.tertiary)
                }
            }
            
            Spacer()
            
            if showViewAll {
                Button {
                    onViewAllTapped?()
                } label: {
                    HStack(spacing: 4) {
                        Text("View All")
                            .font(.system(size: 13, weight: .medium))
                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundStyle(AppColors.Text.primary)
                }
            }
        }
        .padding(.horizontal, 20)
    }
}

#Preview {
    VStack(spacing: 32) {
        SectionHeader(title: "NEW IN", subtitle: "The latest arrivals", showViewAll: true)
        SectionHeader(title: "TRENDING NOW", showViewAll: true)
        SectionHeader(title: "CATEGORIES")
    }
    .background(AppColors.Background.primary)
    .withAppTheme()
}
