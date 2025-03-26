import SwiftUI

struct BagView: View {
    @StateObject private var viewModel = BagViewModel()
    @State private var showingCheckout = false
    
    var body: some View {
//        NavigationView {
            VStack {
                if viewModel.bagItems.isEmpty {
                    emptyBagView
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            // Bag Items
                            ForEach(viewModel.bagItems) { item in
                                BagItemView(
                                    item: item,
                                    onIncrement: { viewModel.incrementQuantity(for: item) },
                                    onDecrement: { viewModel.decrementQuantity(for: item) },
                                    onRemove: { viewModel.removeItem(item: item) }
                                )
                                .background(Color(.systemBackground))
                                .cornerRadius(12)
                                .shadow(radius: 2)
                            }
                            
                            // Promo Code Section
                            promoCodeSection
                            
                            // Order Summary
                            orderSummarySection
                        }
                        .padding()
                    }
                    
                    // Checkout Button
                    Button(action: { showingCheckout = true }) {
                        Text("Check Out")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .cornerRadius(12)
                    }
                    .padding()
                }
            }
            .navigationTitle("My Bag")
            .background(Color(.systemGroupedBackground))
            .sheet(isPresented: $viewModel.showingPromoCodeSheet) {
                promoCodeSheet
            }
            .fullScreenCover(isPresented: $showingCheckout) {
                CheckoutView()
            }
//        }
    }
    
    private var emptyBagView: some View {
        VStack(spacing: 20) {
            Image(systemName: "bag")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("Your bag is empty")
                .font(.title2)
            
            Text("Items you add to your bag will appear here")
                .foregroundColor(.gray)
        }
    }
    
    private var promoCodeSection: some View {
        VStack {
            Button(action: { viewModel.showingPromoCodeSheet = true }) {
                HStack {
                    Image(systemName: "tag")
                    Text("Add Promo Code")
                    Spacer()
                    Image(systemName: "chevron.right")
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            }
        }
    }
    
    private var orderSummarySection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Subtotal")
                Spacer()
                Text("$\(viewModel.subtotal, specifier: "%.2f")")
            }
            
            if viewModel.isPromoCodeValid {
                HStack {
                    Text("Discount")
                    Spacer()
                    Text("-$\(viewModel.discount, specifier: "%.2f")")
                        .foregroundColor(.green)
                }
            }
            
            Divider()
            
            HStack {
                Text("Total")
                    .fontWeight(.bold)
                Spacer()
                Text("$\(viewModel.total, specifier: "%.2f")")
                    .fontWeight(.bold)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
    }
    
    private var promoCodeSheet: some View {
//        NavigationView {
            VStack {
                TextField("Enter promo code", text: $viewModel.promoCode)
                    .textFieldStyle(RoundedBorderTextFieldStyle())
                    .padding()
                
                Button("Apply") {
                    viewModel.applyPromoCode()
                    viewModel.showingPromoCodeSheet = false
                }
                .disabled(viewModel.promoCode.isEmpty)
                
                Spacer()
            }
            .navigationTitle("Promo Code")
            .navigationBarItems(trailing: Button("Done") {
                viewModel.showingPromoCodeSheet = false
            })
//        }
    }
}

#Preview {
    BagView()
} 
