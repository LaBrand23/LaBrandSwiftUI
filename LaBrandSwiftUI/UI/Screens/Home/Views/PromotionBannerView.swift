//
//  PromotionBannerView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct PromotionBannerView: View {
    let promotion: Promotion
    
    var body: some View {
        ZStack(alignment: .leading) {
            Image(promotion.backgroundImage)
                .resizable()
                .aspectRatio(contentMode: .fill)
            
            VStack(alignment: .leading, spacing: 8) {
                Text(promotion.title)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                
                Text(promotion.subtitle)
                    .foregroundColor(.white)
                
                Button {
                    // TODO: Navigate to promotion details
                } label: {
                    Text("Shop Now")
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 8)
                        .background(Color.red)
                        .cornerRadius(20)
                }
            }
            .padding()
        }
        .frame(height: 200)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
    }
}
