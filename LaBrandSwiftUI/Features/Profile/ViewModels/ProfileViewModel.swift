import Foundation
import SwiftUI

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var userProfile = UserProfile.sample
    @Published var orders = Order.sampleOrders
    @Published var notificationSettings = NotificationSettings(
        sales: true,
        newArrivals: true,
        deliveryStatusChanges: true
    )
    
    // Password change form
    @Published var oldPassword = ""
    @Published var newPassword = ""
    @Published var confirmPassword = ""
    
    // Filtered orders
    var deliveredOrders: [Order] {
        orders.filter { $0.status == .delivered }
    }
    
    var processingOrders: [Order] {
        orders.filter { $0.status == .processing }
    }
    
    var cancelledOrders: [Order] {
        orders.filter { $0.status == .cancelled }
    }
    
    func updateProfile(fullName: String, dateOfBirth: Date) {
        userProfile.fullName = fullName
        userProfile.dateOfBirth = dateOfBirth
    }
    
    func changePassword() -> Bool {
        guard !oldPassword.isEmpty,
              !newPassword.isEmpty,
              newPassword == confirmPassword else {
            return false
        }
        
        // Here you would typically make an API call to change the password
        // For now, we'll just return true
        return true
    }
    
    func reorderItems(from order: Order) {
        // Implementation for reordering items
    }
    
    func leaveFeedback(for order: Order) {
        // Implementation for leaving feedback
    }
    
    func updateNotificationSettings(sales: Bool? = nil, newArrivals: Bool? = nil, deliveryStatus: Bool? = nil) {
        if let sales = sales {
            notificationSettings.sales = sales
        }
        if let newArrivals = newArrivals {
            notificationSettings.newArrivals = newArrivals
        }
        if let deliveryStatus = deliveryStatus {
            notificationSettings.deliveryStatusChanges = deliveryStatus
        }
    }
} 