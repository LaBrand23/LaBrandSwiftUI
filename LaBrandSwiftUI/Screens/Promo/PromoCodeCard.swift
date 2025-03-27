//
//  PromoCodeCard.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct PromoCodeCard: View {
    let promoCode: PromoCode
    let isApplied: Bool
    let action: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            // Discount Badge
            AsyncImage(url: URL(string: promoCode.background)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                ZStack {
                    Rectangle()
                        .fill(Color.red)
                    
                    VStack(spacing: 0) {
                        Text("\(promoCode.discountPercentage)")
                            .font(.title2)
                            .fontWeight(.bold)
                        Text("%")
                            .font(.caption)
                            .fontWeight(.bold)
                        Text("OFF")
                            .font(.caption2)
                            .fontWeight(.bold)
                    }
                    .foregroundColor(.white)
                }
            }
            .frame(width: 80)
            
            // Promo Details
            VStack(alignment: .leading, spacing: 4) {
                Text(promoCode.title)
                    .font(.headline)
                Text(promoCode.code.lowercased())
                    .font(.caption)
                    .foregroundColor(.gray)
                
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.caption2)
                    Text("\(promoCode.daysRemaining) days remaining")
                        .font(.caption2)
                }
                .foregroundColor(.gray)
            }
            
            Spacer()
            
            // Apply Button
            Button(action: action) {
                Text(isApplied ? "Applied" : "Apply")
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundColor(isApplied ? .gray : .white)
                    .padding(.horizontal, 20)
                    .padding(.vertical, 8)
                    .background(isApplied ? Color.gray.opacity(0.2) : Color.red)
                    .clipShape(Capsule())
            }
            .disabled(isApplied)
            .padding(.trailing)
        }
//        .padding()
        .frame(height: 80)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .shadow(color: .gray.opacity(0.4), radius: 5)
    }
}

#Preview {
    PromoCodeCard(
        promoCode: PromoCode(
            code: "asds",
            title: "asdasd",
            description: "asdasdas",
            background: "card_men",
            discountPercentage: 123,
            daysRemaining: 4,
            isApplied: false
        ),
        isApplied: false,
        action: {}
    )
    .padding()
}
