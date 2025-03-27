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
        var showViewAll: Bool = false
        
        var body: some View {
            HStack {
                Text(title)
                    .font(.title3)
                    .fontWeight(.bold)
                
                Spacer()
                
                if showViewAll {
                    Button("View All") {
                        // TODO: Navigate to category/collection view
                    }
                    .foregroundColor(.red)
                }
            }
            .padding(.horizontal)
        }
    }
}
