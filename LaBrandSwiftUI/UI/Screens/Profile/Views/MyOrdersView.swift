import SwiftUI

struct MyOrdersView: View {
    @ObservedObject var viewModel: ProfileViewModel
    @State private var selectedTab = 0
    
    var body: some View {
        VStack(spacing: 0) {
            // Custom Tab Bar
            HStack(spacing: 0) {
                TabButton(title: "Delivered", isSelected: selectedTab == 0) {
                    selectedTab = 0
                }
                
                TabButton(title: "Processing", isSelected: selectedTab == 1) {
                    selectedTab = 1
                }
                
                TabButton(title: "Cancelled", isSelected: selectedTab == 2) {
                    selectedTab = 2
                }
            }
            .padding(.horizontal)
            
            // Orders List
            ScrollView {
                LazyVStack(spacing: 16) {
                    ForEach(ordersForSelectedTab) { order in
                        OrderRow(order: order, viewModel: viewModel)
                            .background(Color(.systemBackground))
                            .cornerRadius(12)
                            .shadow(radius: 1)
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
        }
        .navigationTitle("My Orders")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private var ordersForSelectedTab: [Order] {
        switch selectedTab {
        case 0:
            return viewModel.deliveredOrders
        case 1:
            return viewModel.processingOrders
        case 2:
            return viewModel.cancelledOrders
        default:
            return []
        }
    }
}

struct TabButton: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline)
                .fontWeight(isSelected ? .semibold : .regular)
                .foregroundColor(isSelected ? .primary : .gray)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
        }
        .background(
            VStack {
                Spacer()
                Rectangle()
                    .fill(isSelected ? Color.red : Color.clear)
                    .frame(height: 2)
            }
        )
    }
}

struct OrderRow: View {
    let order: Order
    @ObservedObject var viewModel: ProfileViewModel
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(order.orderNumber)
                        .font(.headline)
                    
                    Text("Tracking number: \(order.trackingNumber)")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                Spacer()
                
                Text(order.status.rawValue)
                    .font(.caption)
                    .foregroundColor(order.status.color)
            }
            
            HStack {
                Text("Quantity: \(order.quantity)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                
                Spacer()
                
                Text("Total Amount: $\(order.totalAmount, specifier: "%.2f")")
                    .font(.subheadline)
            }
            
            NavigationLink(destination: OrderDetailsView(order: order, viewModel: viewModel)) {
                Text("Details")
                    .font(.subheadline)
                    .foregroundColor(.red)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.red, lineWidth: 1)
                    )
            }
        }
        .padding()
    }
}

#Preview {
    NavigationStack {
        MyOrdersView(viewModel: ProfileViewModel())
    }
} 
