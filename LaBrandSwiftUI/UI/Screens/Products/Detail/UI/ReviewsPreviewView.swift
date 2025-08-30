//
//  ReviewsPreviewView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct ReviewsPreviewView: View {
    let product: Product
    let onSeeAllReviews: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Reviews")
                    .font(.headline)
                
                Spacer()
                
                Button("See all") {
                    onSeeAllReviews()
                }
                .font(.subheadline)
                .foregroundColor(.red)
            }
            .padding(.horizontal)
            
            // Rating Summary
            HStack(spacing: 8) {
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                    Text(String(format: "%.1f", product.rating))
                        .fontWeight(.semibold)
                }
                
                Text("(\(product.reviewCount) reviews)")
                    .foregroundColor(.secondary)
                    .font(.subheadline)
                
                Spacer()
            }
            .padding(.horizontal)
            
            // Mock Review Preview (in real app this would come from API)
            VStack(alignment: .leading, spacing: 8) {
                ReviewPreviewItem(
                    reviewerName: "Sarah M.",
                    rating: 5,
                    reviewText: "Absolutely love this product! The quality is amazing and it fits perfectly. Highly recommend!",
                    date: "2 days ago"
                )
                
                ReviewPreviewItem(
                    reviewerName: "Mike T.",
                    rating: 4,
                    reviewText: "Great product, fast delivery. The only minor issue is the sizing runs a bit small.",
                    date: "1 week ago"
                )
            }
            .padding(.horizontal)
        }
    }
}

struct ReviewPreviewItem: View {
    let reviewerName: String
    let rating: Int
    let reviewText: String
    let date: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(reviewerName)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Spacer()
                
                Text(date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            HStack(spacing: 2) {
                ForEach(1...5, id: \.self) { index in
                    Image(systemName: index <= rating ? "star.fill" : "star")
                        .font(.caption)
                        .foregroundColor(index <= rating ? .yellow : .gray)
                }
            }
            
            Text(reviewText)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(3)
        }
        .padding(.vertical, 8)
        .padding(.horizontal, 12)
        .background(Color(.systemGray6))
        .cornerRadius(8)
    }
}

#Preview {
    ReviewsPreviewView(
        product: Product.mockProducts[0],
        onSeeAllReviews: {}
    )
    .padding()
}
