//
//  SectionHeader.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

extension HomeView {
    struct SectionHeader: View {
        let title: String
        var subtitle: String? = nil
        var showViewAll: Bool = false
        
        var body: some View {
            HStack(alignment: .bottom) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.custom("Georgia", size: 20))
                        .fontWeight(.medium)
                        .tracking(2)
                        .foregroundStyle(.primary)
                    
                    if let subtitle = subtitle {
                        Text(subtitle)
                            .font(.system(size: 13))
                            .foregroundStyle(Color(hex: "666666"))
                    }
                }
                
                Spacer()
                
                if showViewAll {
                    Button {
                        // Navigate to category/collection view
                    } label: {
                        HStack(spacing: 4) {
                            Text("View All")
                                .font(.system(size: 13, weight: .medium))
                            Image(systemName: "chevron.right")
                                .font(.system(size: 11, weight: .medium))
                        }
                        .foregroundStyle(Color(hex: "1A1A1A"))
                    }
                }
            }
            .padding(.horizontal, 20)
        }
    }
}

#Preview {
    VStack(spacing: 32) {
        HomeView.SectionHeader(title: "NEW IN", subtitle: "The latest arrivals", showViewAll: true)
        HomeView.SectionHeader(title: "TRENDING NOW", showViewAll: true)
        HomeView.SectionHeader(title: "CATEGORIES")
    }
}
