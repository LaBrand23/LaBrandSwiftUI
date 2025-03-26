import Foundation
import SwiftUI

@MainActor
class CheckoutViewModel: ObservableObject {
    @Published var selectedPaymentCard: PaymentCard?
    @Published var selectedShippingAddress: ShippingAddress?
    @Published var selectedDeliveryMethod: DeliveryMethod = .fedex
    @Published var showingAddCardSheet = false
    @Published var showingAddAddressSheet = false
    @Published var showingSuccessView = false
    
    @Published var paymentCards: [PaymentCard] = [
        PaymentCard(cardNumber: "3947", cardholderName: "Jennifer Doe", expiryDate: "05/23", cvv: "123", isDefault: true),
        PaymentCard(cardNumber: "4546", cardholderName: "Jennifer Doe", expiryDate: "10/25", cvv: "456", isDefault: false)
    ]
    
    @Published var shippingAddresses: [ShippingAddress] = [
        ShippingAddress(fullName: "John Doe", streetAddress: "2 Newbridge Court", city: "Chino Hills", state: "CA", zipCode: "91709", country: "United States", isDefault: true),
        ShippingAddress(fullName: "John Doe", streetAddress: "15 Riverside", city: "Chino Hills", state: "CA", zipCode: "91709", country: "United States", isDefault: false)
    ]
    
    // New card form
    @Published var newCardNumber = ""
    @Published var newCardholderName = ""
    @Published var newExpiryDate = ""
    @Published var newCVV = ""
    @Published var newCardIsDefault = false
    
    // New address form
    @Published var newFullName = ""
    @Published var newStreetAddress = ""
    @Published var newCity = ""
    @Published var newState = ""
    @Published var newZipCode = ""
    @Published var newCountry = ""
    @Published var newAddressIsDefault = false
    
    init() {
        selectedPaymentCard = paymentCards.first(where: { $0.isDefault })
        selectedShippingAddress = shippingAddresses.first(where: { $0.isDefault })
    }
    
    func addNewCard() {
        let newCard = PaymentCard(
            cardNumber: newCardNumber,
            cardholderName: newCardholderName,
            expiryDate: newExpiryDate,
            cvv: newCVV,
            isDefault: newCardIsDefault
        )
        
        if newCardIsDefault {
            paymentCards = paymentCards.map { card in
                var updatedCard = card
                updatedCard.isDefault = false
                return updatedCard
            }
        }
        
        paymentCards.append(newCard)
        clearNewCardForm()
    }
    
    func addNewAddress() {
        let newAddress = ShippingAddress(
            fullName: newFullName,
            streetAddress: newStreetAddress,
            city: newCity,
            state: newState,
            zipCode: newZipCode,
            country: newCountry,
            isDefault: newAddressIsDefault
        )
        
        if newAddressIsDefault {
            shippingAddresses = shippingAddresses.map { address in
                var updatedAddress = address
                updatedAddress.isDefault = false
                return updatedAddress
            }
        }
        
        shippingAddresses.append(newAddress)
        clearNewAddressForm()
    }
    
    func submitOrder() {
        // Here you would typically make an API call to process the order
        // For now, we'll just show the success view
        showingSuccessView = true
    }
    
    private func clearNewCardForm() {
        newCardNumber = ""
        newCardholderName = ""
        newExpiryDate = ""
        newCVV = ""
        newCardIsDefault = false
    }
    
    private func clearNewAddressForm() {
        newFullName = ""
        newStreetAddress = ""
        newCity = ""
        newState = ""
        newZipCode = ""
        newCountry = ""
        newAddressIsDefault = false
    }
} 