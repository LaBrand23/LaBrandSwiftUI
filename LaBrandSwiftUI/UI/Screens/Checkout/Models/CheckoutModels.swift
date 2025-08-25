
import SwiftUI

struct PaymentCard: Identifiable {
    let id: String = UUID().uuidString
    let cardNumber: String
    let cardholderName: String
    let expiryDate: String
    let cvv: String
    var isDefault: Bool
    
    var maskedNumber: String {
        return "**** **** **** " + cardNumber.suffix(4)
    }
}

struct ShippingAddress: Identifiable {
    let id: String = UUID().uuidString
    let fullName: String
    let streetAddress: String
    let city: String
    let state: String
    let zipCode: String
    let country: String
    var isDefault: Bool
    
    var formattedAddress: String {
        return "\(streetAddress), \(city), \(state) \(zipCode), \(country)"
    }
}

enum DeliveryMethod: String, CaseIterable, Identifiable {
    case fedex = "FedEx"
    case ups = "UPS"
    case dhl = "DHL"
    
    var id: String { rawValue }
    
    var estimatedDays: String {
        switch self {
        case .fedex: return "2-3 business days"
        case .ups: return "3-5 business days"
        case .dhl: return "1-2 business days"
        }
    }
    
    var price: Double {
        switch self {
        case .fedex: return 15.99
        case .ups: return 12.99
        case .dhl: return 19.99
        }
    }
    
    var image: ImageResource {
        return switch self {
        case .fedex: .fexEx
        case .ups: .fexEx
        case .dhl: .fexEx
        }
    }
}
