import SwiftUI

struct ReviewsView: View {
    let product: Product
    @StateObject private var viewModel = ReviewsViewModel()
    @State private var showAddReview = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Rating Summary
                VStack(spacing: 16) {
                    Text("Rating & Reviews")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    HStack(spacing: 24) {
                        // Average Rating
                        VStack(spacing: 8) {
                            Text(String(format: "%.1f", product.rating))
                                .font(.system(size: 48, weight: .bold))
                            
                            HStack {
                                ForEach(0..<5) { index in
                                    Image(systemName: "star.fill")
                                        .foregroundColor(index < Int(product.rating) ? .yellow : .gray)
                                }
                            }
                            
                            Text("\(product.reviewCount) reviews")
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                        
                        // Rating Bars
                        VStack(alignment: .leading, spacing: 8) {
                            ForEach((1...5).reversed(), id: \.self) { rating in
                                RatingBar(
                                    rating: rating,
                                    count: viewModel.ratingCounts[rating - 1],
                                    total: product.reviewCount
                                )
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                }
                
                // Add Review Button
                Button {
                    showAddReview = true
                } label: {
                    HStack {
                        Image(systemName: "square.and.pencil")
                        Text("Write a Review")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(25)
                }
                
                // Reviews List
                LazyVStack(spacing: 16, pinnedViews: .sectionHeaders) {
                    Section {
                        ForEach(viewModel.reviews) { review in
                            ReviewCell(review: review)
                        }
                    } header: {
                        HStack {
                            Text("\(viewModel.reviews.count) Reviews")
                                .font(.headline)
                            Spacer()
                            Menu {
                                Button("Most Recent") {
                                    viewModel.sortBy = .recent
                                }
                                Button("Highest Rating") {
                                    viewModel.sortBy = .highestRating
                                }
                                Button("Lowest Rating") {
                                    viewModel.sortBy = .lowestRating
                                }
                            } label: {
                                Label("Sort", systemImage: "arrow.up.arrow.down")
                            }
                        }
                        .padding(.vertical, 8)
                        .background(Color.white)
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Reviews")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showAddReview) {
            AddReviewView(product: product)
        }
        .onAppear {
            viewModel.loadReviews(for: product)
        }
    }
}

struct RatingBar: View {
    let rating: Int
    let count: Int
    let total: Int
    
    var body: some View {
        HStack(spacing: 8) {
            Text("\(rating)")
                .font(.subheadline)
                .frame(width: 24)
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color(.systemGray5))
                    
                    Rectangle()
                        .fill(Color.yellow)
                        .frame(width: geometry.size.width * CGFloat(count) / CGFloat(total))
                }
            }
            .frame(height: 8)
            .cornerRadius(4)
            
            Text("\(count)")
                .font(.subheadline)
                .foregroundColor(.gray)
                .frame(width: 40)
        }
    }
}

struct ReviewCell: View {
    let review: Review
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                // User Avatar
                Circle()
                    .fill(Color(.systemGray5))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Text(review.userId.uuidString.prefix(2))
                            .foregroundColor(.gray)
                    )
                
                VStack(alignment: .leading) {
                    Text("User \(review.userId.uuidString.prefix(6))")
                        .font(.subheadline)
                        .fontWeight(.medium)
                    
                    HStack {
                        ForEach(0..<5) { index in
                            Image(systemName: "star.fill")
                                .foregroundColor(index < review.rating ? .yellow : .gray)
                                .font(.caption)
                        }
                        
                        Text(review.date.formatted(date: .abbreviated, time: .omitted))
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                
                Spacer()
                
                if review.isVerifiedPurchase {
                    Image(systemName: "checkmark.seal.fill")
                        .foregroundColor(.green)
                }
            }
            
            Text(review.comment)
                .font(.subheadline)
            
            if let images = review.images, !images.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(images, id: \.self) { imageUrl in
                            AsyncImage(url: URL(string: imageUrl)) { image in
                                image
                                    .resizable()
                                    .aspectRatio(contentMode: .fill)
                            } placeholder: {
                                Rectangle()
                                    .fill(Color(.systemGray6))
                            }
                            .frame(width: 80, height: 80)
                            .clipShape(RoundedRectangle(cornerRadius: 8))
                        }
                    }
                }
            }
            
            HStack {
                Button {
                    // TODO: Implement helpful
                } label: {
                    Label("Helpful (\(review.helpfulCount))", systemImage: "hand.thumbsup")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                Button {
                    // TODO: Implement report
                } label: {
                    Label("Report", systemImage: "flag")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

class ReviewsViewModel: ObservableObject {
    enum SortOption {
        case recent, highestRating, lowestRating
    }
    
    @Published var reviews: [Review] = []
    @Published var ratingCounts: [Int] = [10, 15, 25, 30, 20] // Mock data
    @Published var sortBy: SortOption = .recent {
        didSet {
            sortReviews()
        }
    }
    
    func loadReviews(for product: Product) {
        // TODO: Load reviews from backend
        // For now, using mock data
        reviews = [
            Review(
                id: UUID(),
                productId: product.id, userId: UUID(),
                rating: 5,
                comment: "Great product! Love the quality and fit.",
                images: nil,
                date: Date(),
                helpfulCount: 12,
                isVerifiedPurchase: true
            ),
            Review(
                id: UUID(),
                productId: product.id, userId: UUID(),
                rating: 4,
                comment: "Good product but shipping took longer than expected.",
                images: nil,
                date: Date().addingTimeInterval(-86400),
                helpfulCount: 8,
                isVerifiedPurchase: true
            )
        ]
        sortReviews()
    }
    
    private func sortReviews() {
        switch sortBy {
        case .recent:
            reviews.sort { $0.date > $1.date }
        case .highestRating:
            reviews.sort { $0.rating > $1.rating }
        case .lowestRating:
            reviews.sort { $0.rating < $1.rating }
        }
    }
}

#Preview {
    ReviewsView(product: .mockProducts.first!)
}
