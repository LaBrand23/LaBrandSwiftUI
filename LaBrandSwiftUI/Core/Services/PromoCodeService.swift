import Foundation

protocol PromoCodeServiceProtocol {
    func validatePromoCode(_ code: String) async throws -> PromoCode?
    func fetchAvailablePromoCodes() async throws -> [PromoCode]
}

class MockPromoCodeService: PromoCodeServiceProtocol {
    func validatePromoCode(_ code: String) async throws -> PromoCode? {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        return PromoCode.mockPromoCodes.first { $0.code.lowercased() == code.lowercased() }
    }
    
    func fetchAvailablePromoCodes() async throws -> [PromoCode] {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        return PromoCode.mockPromoCodes
    }
} 