import SwiftUI

struct AddShippingAddressView: View {
    @ObservedObject var viewModel: CheckoutViewModel
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
//        NavigationView {
            Form {
                Section {
                    TextField("Full name", text: $viewModel.newFullName)
                        .textContentType(.name)
                    
                    TextField("Street address", text: $viewModel.newStreetAddress)
                        .textContentType(.streetAddressLine1)
                    
                    TextField("City", text: $viewModel.newCity)
                        .textContentType(.addressCity)
                    
                    TextField("State", text: $viewModel.newState)
                        .textContentType(.addressState)
                    
                    TextField("ZIP code", text: $viewModel.newZipCode)
                        .textContentType(.postalCode)
                        .keyboardType(.numberPad)
                    
                    TextField("Country", text: $viewModel.newCountry)
                        .textContentType(.countryName)
                }
                
                Section {
                    Toggle("Use as the shipping address", isOn: $viewModel.newAddressIsDefault)
                }
                
                Section {
                    Button(action: {
                        viewModel.addNewAddress()
                        dismiss()
                    }) {
                        Text("Save Address")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                    }
                    .listRowBackground(Color.red)
                    .disabled(viewModel.newFullName.isEmpty || 
                            viewModel.newStreetAddress.isEmpty || 
                            viewModel.newCity.isEmpty || 
                            viewModel.newState.isEmpty || 
                            viewModel.newZipCode.isEmpty || 
                            viewModel.newCountry.isEmpty)
                }
            }
            .navigationTitle("Adding Shipping Address")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
//        }
    }
} 
