import SwiftUI

@MainActor
class PromoCodeViewModel: ObservableObject {
    @Published var promoCode = ""
    @Published var availablePromoCodes: [PromoCode] = []
    @Published var isLoading = false
    @Published var error: String?
    @Published var selectedPromoCode: PromoCode?
    @Published var showError = false
    
    private let promoCodeService: PromoCodeServiceProtocol
    
    init(promoCodeService: PromoCodeServiceProtocol = MockPromoCodeService()) {
        self.promoCodeService = promoCodeService
    }
    
    func validatePromoCode() async {
        guard !promoCode.isEmpty else { return }
        
        isLoading = true
        error = nil
        showError = false
        
        do {
            if let validPromoCode = try await promoCodeService.validatePromoCode(promoCode) {
                selectedPromoCode = validPromoCode
                promoCode = "" // Clear the text field after successful validation
            } else {
                error = "Invalid promo code. Please check and try again."
                showError = true
            }
        } catch {
            self.error = error.localizedDescription
            showError = true
        }
        
        isLoading = false
    }
    
    func fetchAvailablePromoCodes() {
        Task {
            isLoading = true
            error = nil
            
            do {
                availablePromoCodes = try await promoCodeService.fetchAvailablePromoCodes()
            } catch {
                self.error = error.localizedDescription
                showError = true
            }
            
            isLoading = false
        }
    }
    
    func applyPromoCode(_ promoCode: PromoCode) {
        selectedPromoCode = promoCode
    }
    
    func clearError() {
        error = nil
        showError = false
    }
} 