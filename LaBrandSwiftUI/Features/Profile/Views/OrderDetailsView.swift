import SwiftUI

struct OrderDetailsView: View {
    let order: Order
    @ObservedObject var viewModel: ProfileViewModel
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Order Header
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(order.orderNumber)
                            .font(.headline)
                        
                        Spacer()
                        
                        Text(order.date, style: .date)
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    
                    HStack {
                        Text("Tracking number: \(order.trackingNumber)")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                        
                        Spacer()
                        
                        Text(order.status.rawValue)
                            .font(.subheadline)
                            .foregroundColor(order.status.color)
                    }
                    
                    Text("\(order.items.count) items")
                        .font(.subheadline)
                        .foregroundColor(.gray)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                
                // Product List
                VStack(spacing: 16) {
                    ForEach(order.items) { item in
                        OrderItemRow(item: item)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                
                // Order Information
                VStack(alignment: .leading, spacing: 16) {
                    Text("Order information")
                        .font(.headline)
                    
                    VStack(alignment: .leading, spacing: 12) {
                        InfoRow(title: "Shipping Address", value: order.shippingAddress.formattedAddress)
                        
                        InfoRow(title: "Payment method", value: "•••• •••• •••• \(order.paymentMethod.cardNumber)")
                        
                        InfoRow(title: "Delivery method", value: "\(order.deliveryMethod.rawValue), \(order.deliveryMethod.estimatedDays)")
                        
                        if let discount = order.discount {
                            InfoRow(title: "Discount", value: "\(discount.percentage)%, \(discount.description)")
                        }
                        // "$\(order.totalAmount, specifier: "%.2f")"
                        InfoRow(title: "Total Amount", value: "$" + String(format: "%.2f", arguments: [order.totalAmount]))
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                
                // Action Buttons
                HStack(spacing: 16) {
                    Button(action: { viewModel.reorderItems(from: order) }) {
                        Text("Reorder")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(12)
                    }
                    
                    Button(action: { viewModel.leaveFeedback(for: order) }) {
                        Text("Leave feedback")
                            .font(.headline)
                            .foregroundColor(.red)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .overlay(
                                RoundedRectangle(cornerRadius: 12)
                                    .stroke(Color.red, lineWidth: 1)
                            )
                    }
                }
                .padding()
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Order Details")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct OrderItemRow: View {
    let item: OrderItem
    
    var body: some View {
        HStack(spacing: 16) {
            Image(item.image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: 80, height: 80)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.headline)
                
                Text(item.brand)
                    .font(.subheadline)
                    .foregroundColor(.gray)
                
                HStack {
                    Text("Color: \(item.color)")
                    Text("Size: \(item.size)")
                }
                .font(.caption)
                .foregroundColor(.gray)
                
                HStack {
                    Text("Units: \(item.units)")
                    Spacer()
                    Text("$\(item.price, specifier: "%.2f")")
                        .fontWeight(.semibold)
                }
                .font(.subheadline)
            }
        }
    }
}

struct InfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.gray)
            
            Text(value)
                .font(.subheadline)
        }
    }
}

#Preview {
    NavigationView {
        OrderDetailsView(
            order: Order.sampleOrders[0],
            viewModel: ProfileViewModel()
        )
    }
} 
