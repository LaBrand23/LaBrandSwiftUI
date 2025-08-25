import SwiftUI

struct CheckoutView: View {
    @StateObject private var viewModel = CheckoutViewModel()
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Shipping Address Section
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Shipping address")
                            .font(.headline)
                        Spacer()
                        Button("Change") {
                            viewModel.showingAddAddressSheet = true
                        }
                        .foregroundColor(.red)
                    }
                    
                    if let address = viewModel.selectedShippingAddress {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(address.fullName)
                                .font(.subheadline)
                            Text(address.formattedAddress)
                                .font(.subheadline)
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                
                // Payment Method Section
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Payment")
                            .font(.headline)
                        Spacer()
                        Button("Change") {
                            viewModel.showingAddCardSheet = true
                        }
                        .foregroundColor(.red)
                    }
                    
                    if let card = viewModel.selectedPaymentCard {
                        HStack {
                            Image(systemName: "creditcard")
                            Text(card.maskedNumber)
                                .font(.subheadline)
                        }
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                
                // Delivery Method Section
                VStack(alignment: .leading, spacing: 12) {
                    Text("Delivery method")
                        .font(.headline)
                    
                    HStack(spacing: 12) {
                        ForEach(DeliveryMethod.allCases) { method in
                            DeliveryMethodButton(
                                method: method,
                                isSelected: viewModel.selectedDeliveryMethod == method,
                                action: { viewModel.selectedDeliveryMethod = method }
                            )
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                
                // Order Summary
                VStack(spacing: 8) {
                    HStack {
                        Text("Order")
                        Spacer()
                        Text("$112.98")
                    }
                    HStack {
                        Text("Delivery")
                        Spacer()
                        Text("$\(viewModel.selectedDeliveryMethod.price, specifier: "%.2f")")
                    }
                    Divider()
                    HStack {
                        Text("Summary")
                            .fontWeight(.bold)
                        Spacer()
                        Text("$\(112.98 + viewModel.selectedDeliveryMethod.price, specifier: "%.2f")")
                            .fontWeight(.bold)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Checkout")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .bottom) {
            Button(action: viewModel.submitOrder) {
                Text("Submit Order")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .cornerRadius(12)
            }
            .padding()
            .background(Color(.systemBackground))
        }
        .sheet(isPresented: $viewModel.showingAddCardSheet) {
            NavigationStack {
                AddPaymentCardView(viewModel: viewModel)
            }
        }
        .sheet(isPresented: $viewModel.showingAddAddressSheet) {
            NavigationStack {
                AddShippingAddressView(viewModel: viewModel)
            }
        }
        .fullScreenCover(isPresented: $viewModel.showingSuccessView) {
            NavigationStack {
                OrderSuccessView()
            }
        }
    }
}

#Preview {
    NavigationStack {
        CheckoutView()
    }
}
