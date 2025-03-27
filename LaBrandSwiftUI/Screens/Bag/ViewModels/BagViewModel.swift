import Foundation
import SwiftUI

@MainActor
class BagViewModel: ObservableObject {
    @Published var bagItems: [BagItem] = []
    @Published var showingPromoCodeSheet = false
    @Published var appliedPromoCode: PromoCode?
    
    private let promoCodeService: PromoCodeServiceProtocol
    
    init(promoCodeService: PromoCodeServiceProtocol = MockPromoCodeService()) {
        self.promoCodeService = promoCodeService
        // Load mock data for testing
        bagItems = BagItem.sampleItems
    }
    
    // MARK: - Computed Properties
    
    var subtotal: Double {
        bagItems.reduce(0) { $0 + $1.totalPrice }
    }
    
    var discount: Double {
        guard let promoCode = appliedPromoCode else { return 0 }
        return (subtotal * Double(promoCode.discountPercentage)) / 100
    }
    
    var total: Double {
        subtotal - discount
    }
    
    var isPromoCodeApplied: Bool {
        appliedPromoCode != nil
    }
    
    // MARK: - Item Management
    
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
    
    // MARK: - Promo Code
    
    func applyPromoCode(_ promoCode: PromoCode) {
        appliedPromoCode = promoCode
    }
    
    func removePromoCode() {
        appliedPromoCode = nil
    }
    
    func proceedToCheckout() {
        // Implementation for checkout process
    }
} 