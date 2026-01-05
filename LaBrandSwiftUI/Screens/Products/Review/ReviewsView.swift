//
//  ReviewsView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct ReviewsView: View {
    
    // MARK: - Properties
    let product: Product
    @StateObject private var viewModel = ReviewsViewModel()
    @State private var showAddReview = false
    @State private var hasAppeared = false
    @EnvironmentObject private var productDetailViewModel: ProductDetailViewModel
    
    // MARK: - Body
    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 24) {
                // Rating Summary
                ratingSummarySection
                
                // Add Review Button
                addReviewButton
                
                // Reviews List
                reviewsListSection
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 20)
        }
        .background(AppColors.Background.primary)
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Text("REVIEWS")
                    .font(.custom("Georgia", size: 18))
                    .fontWeight(.medium)
                    .tracking(4)
            }
        }
        .sheet(isPresented: $showAddReview) {
            AddReviewView(product: product)
                .environmentObject(productDetailViewModel)
        }
        .onAppear {
            viewModel.loadReviews(for: product)
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension ReviewsView {
    
    var ratingSummarySection: some View {
        VStack(spacing: 20) {
            Text("RATING & REVIEWS")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            HStack(spacing: 32) {
                // Average Rating
                VStack(spacing: 8) {
                    Text(String(format: "%.1f", product.rating))
                        .font(.system(size: 48, weight: .bold))
                        .foregroundStyle(AppColors.Text.primary)
                    
                    HStack(spacing: 4) {
                        ForEach(0..<5) { index in
                            Image(systemName: index < Int(product.rating) ? "star.fill" : "star")
                                .font(.system(size: 14))
                                .foregroundStyle(index < Int(product.rating) ? AppColors.Accent.gold : AppColors.Border.primary)
                        }
                    }
                    
                    Text("\(product.reviewCount) reviews")
                        .font(.system(size: 13))
                        .foregroundStyle(AppColors.Text.muted)
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
            .padding(24)
            .background(AppColors.Background.surface)
            .clipShape(RoundedRectangle(cornerRadius: 4))
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(AppColors.Border.subtle, lineWidth: 1)
            )
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
    }
    
    var addReviewButton: some View {
        Button {
            showAddReview = true
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "square.and.pencil")
                    .font(.system(size: 14))
                Text("WRITE A REVIEW")
                    .font(.system(size: 14, weight: .semibold))
                    .tracking(2)
            }
            .foregroundStyle(AppColors.Button.primaryText)
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .background(AppColors.Button.primaryBackground)
        }
        .opacity(hasAppeared ? 1 : 0)
        .offset(y: hasAppeared ? 0 : 20)
        .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
    }
    
    var reviewsListSection: some View {
        VStack(spacing: 16) {
            // Header
            HStack {
                Text("\(viewModel.reviews.count) REVIEWS")
                    .font(.system(size: 12, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(AppColors.Text.tertiary)
                
                Spacer()
                
                Menu {
                    Button("Most Recent") { viewModel.sortBy = .recent }
                    Button("Highest Rating") { viewModel.sortBy = .highestRating }
                    Button("Lowest Rating") { viewModel.sortBy = .lowestRating }
                } label: {
                    HStack(spacing: 4) {
                        Text("Sort")
                            .font(.system(size: 13, weight: .medium))
                        Image(systemName: "chevron.down")
                            .font(.system(size: 10, weight: .medium))
                    }
                    .foregroundStyle(AppColors.Text.primary)
                }
            }
            
            // Reviews
            LazyVStack(spacing: 16) {
                ForEach(Array(viewModel.reviews.enumerated()), id: \.element.id) { index, review in
                    ReviewCell(review: review)
                        .opacity(hasAppeared ? 1 : 0)
                        .offset(y: hasAppeared ? 0 : 20)
                        .animation(
                            .easeOut(duration: 0.5).delay(0.3 + Double(index) * 0.1),
                            value: hasAppeared
                        )
                }
            }
        }
    }
}

// MARK: - Rating Bar
struct RatingBar: View {
    let rating: Int
    let count: Int
    let total: Int
    
    var body: some View {
        HStack(spacing: 8) {
            Text("\(rating)")
                .font(.system(size: 12))
                .foregroundStyle(AppColors.Text.muted)
                .frame(width: 16)
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(AppColors.Background.secondary)
                    
                    Rectangle()
                        .fill(AppColors.Accent.gold)
                        .frame(width: total > 0 ? geometry.size.width * CGFloat(count) / CGFloat(total) : 0)
                }
            }
            .frame(height: 6)
            .clipShape(Capsule())
            
            Text("\(count)")
                .font(.system(size: 11))
                .foregroundStyle(AppColors.Text.muted)
                .frame(width: 30, alignment: .trailing)
        }
    }
}

// MARK: - Review Cell
struct ReviewCell: View {
    let review: Review
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Header
            HStack(spacing: 12) {
                // Avatar
                Circle()
                    .fill(AppColors.Background.secondary)
                    .frame(width: 44, height: 44)
                    .overlay(
                        Text(String(review.userId.uuidString.prefix(2)))
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.Text.tertiary)
                    )
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("User \(review.userId.uuidString.prefix(6))")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundStyle(AppColors.Text.primary)
                    
                    HStack(spacing: 8) {
                        // Stars
                        HStack(spacing: 2) {
                            ForEach(0..<5) { index in
                                Image(systemName: index < review.rating ? "star.fill" : "star")
                                    .font(.system(size: 10))
                                    .foregroundStyle(index < review.rating ? AppColors.Accent.gold : AppColors.Border.primary)
                            }
                        }
                        
                        Text("•")
                            .foregroundStyle(AppColors.Text.muted)
                        
                        Text(review.date.formatted(date: .abbreviated, time: .omitted))
                            .font(.system(size: 11))
                            .foregroundStyle(AppColors.Text.muted)
                    }
                }
                
                Spacer()
                
                if review.isVerifiedPurchase {
                    HStack(spacing: 4) {
                        Image(systemName: "checkmark.seal.fill")
                            .font(.system(size: 12))
                        Text("Verified")
                            .font(.system(size: 10, weight: .medium))
                    }
                    .foregroundStyle(AppColors.Accent.success)
                }
            }
            
            // Comment
            Text(review.comment)
                .font(.system(size: 14))
                .foregroundStyle(AppColors.Text.secondary)
                .lineSpacing(4)
            
            // Images
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
                                    .fill(AppColors.Background.secondary)
                            }
                            .frame(width: 72, height: 72)
                            .clipShape(RoundedRectangle(cornerRadius: 4))
                        }
                    }
                }
            }
            
            // Actions
            HStack(spacing: 24) {
                Button {
                    // Helpful action
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "hand.thumbsup")
                            .font(.system(size: 12))
                        Text("Helpful (\(review.helpfulCount))")
                            .font(.system(size: 12))
                    }
                    .foregroundStyle(AppColors.Text.tertiary)
                }
                
                Spacer()
            }
        }
        .padding(16)
        .background(AppColors.Background.surface)
        .clipShape(RoundedRectangle(cornerRadius: 4))
        .overlay(
            RoundedRectangle(cornerRadius: 4)
                .stroke(AppColors.Border.subtle, lineWidth: 1)
        )
    }
}

// MARK: - ViewModel
class ReviewsViewModel: ObservableObject {
    enum SortOption {
        case recent, highestRating, lowestRating
    }
    
    @Published var reviews: [Review] = []
    @Published var ratingCounts: [Int] = [10, 15, 25, 30, 20]
    @Published var sortBy: SortOption = .recent {
        didSet { sortReviews() }
    }
    
    func loadReviews(for product: Product) {
        reviews = [
            Review(
                id: UUID(),
                productId: product.id,
                userId: UUID(),
                rating: 5,
                comment: "Great product! Love the quality and fit. The material feels premium and the stitching is excellent.",
                images: nil,
                date: Date(),
                helpfulCount: 12,
                isVerifiedPurchase: true
            ),
            Review(
                id: UUID(),
                productId: product.id,
                userId: UUID(),
                rating: 4,
                comment: "Good product but shipping took longer than expected. Overall satisfied with the purchase.",
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

// MARK: - Preview
#Preview {
    NavigationStack {
        ReviewsView(product: .mockProducts.first!)
            .environmentObject(ProductDetailViewModel())
    }
}

