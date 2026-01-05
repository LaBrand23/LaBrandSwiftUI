//
//  MyReviewsView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct MyReviewsView: View {
    
    // MARK: - Properties
    @State private var hasAppeared = false
    @State private var reviews: [Review] = [
        Review(
            id: UUID(),
            productId: UUID(),
            userId: UUID(uuidString: "11111111-1111-1111-1111-111111111111")!,
            rating: 5,
            comment: "Absolutely love this product! The quality is exceptional and the fit is perfect. Highly recommend.",
            images: nil,
            date: Date(),
            helpfulCount: 10,
            isVerifiedPurchase: true
        ),
        Review(
            id: UUID(),
            productId: UUID(),
            userId: UUID(uuidString: "11111111-1111-1111-1111-111111111111")!,
            rating: 4,
            comment: "Good quality overall, but shipping was slower than expected. Product arrived in perfect condition though.",
            images: nil,
            date: Date().addingTimeInterval(-86400),
            helpfulCount: 3,
            isVerifiedPurchase: false
        )
    ]
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            if reviews.isEmpty {
                emptyState
            } else {
                VStack(spacing: 16) {
                    ForEach(Array(reviews.enumerated()), id: \.element.id) { index, review in
                        ReviewCell(review: review)
                            .opacity(hasAppeared ? 1 : 0)
                            .offset(y: hasAppeared ? 0 : 20)
                            .animation(
                                .easeOut(duration: 0.5).delay(Double(index) * 0.1),
                                value: hasAppeared
                            )
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 20)
            }
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("MY REVIEWS")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
    
    private var emptyState: some View {
        VStack(spacing: 16) {
            Spacer()
            
            Image(systemName: "star")
                .font(.system(size: 48))
                .foregroundStyle(AppColors.Text.muted)
            
            Text("No Reviews Yet")
                .font(.custom("Georgia", size: 20))
                .foregroundStyle(AppColors.Text.primary)
            
            Text("Your reviews will appear here")
                .font(.system(size: 14))
                .foregroundStyle(AppColors.Text.tertiary)
            
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 60)
    }
}

// MARK: - Preview
#Preview {
    NavigationStack {
        MyReviewsView()
    }
}
