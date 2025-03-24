import Foundation
import SwiftUI

struct UserProfile: Identifiable {
    let id: String = UUID().uuidString
    var fullName: String
    var email: String
    var dateOfBirth: Date
    var profileImage: String
}

struct Order: Identifiable {
    let id: String
    let orderNumber: String
    let trackingNumber: String
    let date: Date
    let quantity: Int
    let totalAmount: Double
    var status: OrderStatus
    var items: [OrderItem]
    var shippingAddress: ShippingAddress
    var paymentMethod: PaymentCard
    var deliveryMethod: DeliveryMethod
    var discount: Discount?
}

struct OrderItem: Identifiable {
    let id: String = UUID().uuidString
    let name: String
    let brand: String
    let color: String
    let size: String
    let units: Int
    let price: Double
    let image: String
}

struct Discount {
    let code: String
    let percentage: Int
    let description: String
}

enum OrderStatus: String {
    case delivered = "Delivered"
    case processing = "Processing"
    case cancelled = "Cancelled"
    
    var color: Color {
        return switch self {
        case .delivered:  .green
        case .processing: .blue
        case .cancelled:  .red
        }
    }
}

struct NotificationSettings {
    var sales: Bool
    var newArrivals: Bool
    var deliveryStatusChanges: Bool
}

// Sample Data
extension UserProfile {
    static let sample = UserProfile(
        fullName: "Matilda Brown",
        email: "matildabrown@mail.com",
        dateOfBirth: Date(),
        profileImage: "profile_image"
    )
}

extension Order {
    static let sampleOrders = [
        Order(
            id: UUID().uuidString,
            orderNumber: "№1947034",
            trackingNumber: "IW3475453455",
            date: Date(),
            quantity: 3,
            totalAmount: 112.0,
            status: .delivered,
            items: [
                OrderItem(
                    name: "Pullover",
                    brand: "Mango",
                    color: "Gray",
                    size: "L",
                    units: 1,
                    price: 51.0,
                    image: "pullover_1"
                ),
                OrderItem(
                    name: "Pullover",
                    brand: "Mango",
                    color: "Gray",
                    size: "L",
                    units: 1,
                    price: 51.0,
                    image: "pullover_2"
                ),
                OrderItem(
                    name: "Pullover",
                    brand: "Mango",
                    color: "Gray",
                    size: "L",
                    units: 1,
                    price: 51.0,
                    image: "pullover_3"
                )
            ],
            shippingAddress: ShippingAddress(
                fullName: "John Doe",
                streetAddress: "3 Newbridge Court",
                city: "Chino Hills",
                state: "CA",
                zipCode: "91709",
                country: "United States",
                isDefault: true
            ),
            paymentMethod: PaymentCard(
                cardNumber: "3947",
                cardholderName: "Jennifer Doe",
                expiryDate: "05/23",
                cvv: "123",
                isDefault: true
            ),
            deliveryMethod: .fedex,
            discount: Discount(
                code: "PERSONAL10",
                percentage: 10,
                description: "Personal promo code"
            )
        )
    ]
} 
