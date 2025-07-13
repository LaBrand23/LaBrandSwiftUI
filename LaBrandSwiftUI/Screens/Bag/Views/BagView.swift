import SwiftUI

struct BagView: View {
    
    // MARK: - PROPERTIES
    @StateObject private var viewModel = BagViewModel()
    @State private var showingCheckout = false
    @State private var selectedProduct: Product?
    
    // MARK: - body
    var body: some View {
        NavigationStack {
            VStack {
                if viewModel.bagItems.isEmpty {
                    emptyBagView
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
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
                                .navigateOnTap(to: item.product, selection: $selectedProduct)
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
            .navigationDestination(item: $selectedProduct, destination: { ProductDetailView(product: $0) })
            .sheet(isPresented: $viewModel.showingPromoCodeSheet) {
                PromoCodeView()
                    .environmentObject(viewModel)
            }
            .navigationDestination(isPresented: $showingCheckout) {
                NavigationStack {
                    CheckoutView()
                }
            }
        }
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
        VStack(spacing: 12) {
            if let appliedPromo = viewModel.appliedPromoCode {
                // Applied Promo Code
                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Applied Promo Code:")
                            .font(.subheadline)
                            .foregroundColor(.gray)
                        Text(appliedPromo.code)
                            .font(.headline)
                    }
                    
                    Spacer()
                    
                    Button {
                        viewModel.removePromoCode()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.gray)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
            } else {
                // Add Promo Code Button
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
    }
    
    private var orderSummarySection: some View {
        VStack(spacing: 12) {
            HStack {
                Text("Subtotal")
                Spacer()
                Text("$\(viewModel.subtotal, specifier: "%.2f")")
            }
            
            if viewModel.isPromoCodeApplied {
                HStack {
                    Text("Discount (\(viewModel.appliedPromoCode?.discountPercentage ?? 0)% off)")
                    Spacer()
                    Text("-$\(viewModel.discount, specifier: "%.2f")")
                        .foregroundColor(.red)
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
}

#Preview {
    NavigationStack {
        BagView()
    }
}
