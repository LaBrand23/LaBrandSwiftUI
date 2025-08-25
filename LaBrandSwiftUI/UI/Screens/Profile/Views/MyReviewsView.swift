import SwiftUI
import Foundation

struct MyReviewsView: View {
    @State private var reviews: [Review] = [
        Review(
            id: UUID(),
            productId: UUID(),
            userId: UUID(uuidString: "11111111-1111-1111-1111-111111111111")!,
            rating: 5,
            comment: "Absolutely love this product! Highly recommend.",
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
            comment: "Good quality, but shipping was slow.",
            images: nil,
            date: Date().addingTimeInterval(-86400),
            helpfulCount: 3,
            isVerifiedPurchase: false
        )
    ]
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                ForEach(reviews) { review in
                    ReviewCell(review: review)
                }
            }
            .padding()
        }
        .navigationTitle("My Reviews")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack {
        MyReviewsView()
    }
} 
