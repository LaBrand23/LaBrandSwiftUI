import SwiftUI

struct AddPaymentCardView: View {
    
    @ObservedObject var viewModel: CheckoutViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Card number", text: $viewModel.newCardNumber)
                        .keyboardType(.numberPad)
                    
                    TextField("Cardholder name", text: $viewModel.newCardholderName)
                        .textContentType(.name)
                    
                    HStack {
                        TextField("MM/YY", text: $viewModel.newExpiryDate)
                            .keyboardType(.numberPad)
                        
                        Divider()
                        
                        TextField("CVV", text: $viewModel.newCVV)
                            .keyboardType(.numberPad)
                    }
                }
                
                Section {
                    Toggle("Set as default payment method", isOn: $viewModel.newCardIsDefault)
                }
                
                Section {
                    Button(action: {
                        viewModel.addNewCard()
                        dismiss()
                    }) {
                        Text("Add Card")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                    }
                    .listRowBackground(Color.red)
                    .disabled(viewModel.newCardNumber.isEmpty || 
                            viewModel.newCardholderName.isEmpty || 
                            viewModel.newExpiryDate.isEmpty || 
                            viewModel.newCVV.isEmpty)
                }
            }
            .navigationTitle("Add new card")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
    }
} 

#Preview {
    AddPaymentCardView(viewModel: CheckoutViewModel())
}
