import Foundation
import SwiftUI

@MainActor
class BagViewModel: ObservableObject {
    @Published var bagItems: [BagItem] = BagItem.sampleItems
    @Published var promoCode: String = ""
    @Published var isPromoCodeValid: Bool = false
    @Published var showingPromoCodeSheet = false
    
    var subtotal: Double {
        bagItems.reduce(0) { $0 + $1.totalPrice }
    }
    
    var discount: Double {
        isPromoCodeValid ? subtotal * 0.1 : 0 // 10% discount if promo code is valid
    }
    
    var total: Double {
        subtotal - discount
    }
    
    func incrementQuantity(for item: BagItem) {
        if let index = bagItems.firstIndex(where: { $0.id == item.id }) {
            bagItems[index].quantity += 1
        }
    }
    
    func decrementQuantity(for item: BagItem) {
        if let index = bagItems.firstIndex(where: { $0.id == item.id }) {
            if bagItems[index].quantity > 1 {
                bagItems[index].quantity -= 1
            }
        }
    }
    
    func removeItem(item: BagItem) {
        bagItems.removeAll { $0.id == item.id }
    }
    
    func applyPromoCode() {
        // In a real app, this would validate against a backend
        isPromoCodeValid = !promoCode.isEmpty
    }
    
    func proceedToCheckout() {
        // Implementation for checkout process
    }
} 