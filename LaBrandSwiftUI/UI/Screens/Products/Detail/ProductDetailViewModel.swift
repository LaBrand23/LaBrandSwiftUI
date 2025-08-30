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
    
    // New properties for business logic improvements
    @Published var isDescriptionExpanded = false
    @Published var showSizeGuide = false
    @Published var currentImageIndex = 0
    
    // Mock data for demonstration - in real app these would come from API
    let stockInfo = StockInfo(
        totalStock: 15,
        lowStockThreshold: 5,
        isLowStock: true,
        estimatedDelivery: "Friday, April 25"
    )
    
    let trustBadges = [
        TrustBadge(title: "Free Returns", icon: "arrow.uturn.backward", color: .green),
        TrustBadge(title: "100% Authentic", icon: "checkmark.shield", color: .blue),
        TrustBadge(title: "Fast Delivery", icon: "truck.box.fill", color: .orange)
    ]
    
    let socialProof = SocialProof(
        recentBuyers: 12,
        timeFrame: "24 hours",
        trending: true
    )
    
    let shippingInfo = ShippingInfo(
        freeShippingThreshold: 50.0,
        currentCartTotal: 38.0,
        remainingForFreeShipping: 12.0
    )
    
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
    
    func toggleDescriptionExpansion() {
        isDescriptionExpanded.toggle()
    }
    
    func selectSize(_ size: String) {
        selectedSize = size
    }
    
    func selectColor(_ color: String) {
        selectedColor = color
    }
    
    func updateImageIndex(_ index: Int) {
        currentImageIndex = index
    }
}

// MARK: - Supporting Models
struct StockInfo {
    let totalStock: Int
    let lowStockThreshold: Int
    let isLowStock: Bool
    let estimatedDelivery: String
    
    var stockMessage: String {
        if isLowStock {
            return "Only \(totalStock) left in stock"
        }
        return "In stock"
    }
    
    var deliveryMessage: String {
        return "Order now to get delivery by \(estimatedDelivery)"
    }
}

struct TrustBadge {
    let title: String
    let icon: String
    let color: Color
}

struct SocialProof {
    let recentBuyers: Int
    let timeFrame: String
    let trending: Bool
    
    var message: String {
        return "\(recentBuyers) people bought this in the last \(timeFrame)"
    }
}

struct ShippingInfo {
    let freeShippingThreshold: Double
    let currentCartTotal: Double
    let remainingForFreeShipping: Double
    
    var progressPercentage: Double {
        return min(currentCartTotal / freeShippingThreshold, 1.0)
    }
    
    var message: String {
        if currentCartTotal >= freeShippingThreshold {
            return "Free shipping unlocked! 🎉"
        } else {
            return "Add $\(String(format: "%.2f", remainingForFreeShipping)) more for free shipping"
        }
    }
}

struct ImageSource: Identifiable {
    let url: String
    var id: String { url }
}
