//
//  ProductDetailViewModel.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

class ProductDetailViewModel: ObservableObject {
    @Published var selectedSize: String?
    @Published var selectedColor: String?
    @Published var quantity = 1
    @Published var isFavorite = false
    @Published var showAddReview = false
    @Published var selectedImageForFullScreen: String?
    @Published var recommendedProducts: [Product] = []
    @Published var isLoadingRecommendations = false
    
    func toggleFavorite() {
        isFavorite.toggle()
        // TODO: Implement favorite toggling with backend
    }
    
    func addToCart() {
        guard let size = selectedSize else { return }
        // TODO: Implement add to cart with backend
        print("Adding to cart: size \(size), color: \(selectedColor ?? "default"), quantity: \(quantity)")
    }
    
    func addReview() {
        showAddReview = true
    }
    
    func fetchRecommendedProducts(for productId: UUID) {
        isLoadingRecommendations = true
        
        // TODO: Replace with actual API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.recommendedProducts = Product.mockProducts.prefix(4).map { $0 }
            self.isLoadingRecommendations = false
        }
    }
}

struct ImageSource: Identifiable {
    let url: String
    var id: String { url }
}
