import SwiftUI

struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    
    var body: some View {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile Header
                    VStack(spacing: 8) {
                        Image(viewModel.userProfile.profileImage)
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                            .frame(width: 80, height: 80)
                            .clipShape(Circle())
                        
                        Text(viewModel.userProfile.fullName)
                            .font(.headline)
                        
                        Text(viewModel.userProfile.email)
                            .font(.subheadline)
                            .foregroundColor(.gray)
                    }
                    .padding(.top)
                    
                    // Navigation Options
                    VStack(spacing: 0) {
                        NavigationLink(destination: MyOrdersView(viewModel: viewModel)) {
                            ProfileOptionRow(
                                title: "My orders",
                                subtitle: "Already have \(viewModel.orders.count) orders",
                                iconName: "shippingbox.fill"
                            )
                        }
                        
                        NavigationLink(destination: AddShippingAddressView(viewModel: CheckoutViewModel())) {
                            ProfileOptionRow(
                                title: "Shipping addresses",
                                subtitle: "3 addresses",
                                iconName: "location.fill"
                            )
                        }
                        
                        NavigationLink(destination: AddPaymentCardView(viewModel: CheckoutViewModel())) {
                            ProfileOptionRow(
                                title: "Payment methods",
                                subtitle: "Visa **34",
                                iconName: "creditcard.fill"
                            )
                        }
                        
                        NavigationLink(
                            destination: PromoCodeView().environmentObject(BagViewModel())
                        ) {
                            ProfileOptionRow(
                                title: "Promocodes",
                                subtitle: "You have special promocodes",
                                iconName: "tag.fill"
                            )
                        }
                        
                        NavigationLink(destination: MyReviewsView()) {
                            ProfileOptionRow(
                                title: "My reviews",
                                subtitle: "Reviews for 4 items",
                                iconName: "star.fill"
                            )
                        }
                        
                        NavigationLink(destination: SettingsView(viewModel: viewModel)) {
                            ProfileOptionRow(
                                title: "Settings",
                                subtitle: "Notifications, password",
                                iconName: "gearshape.fill"
                            )
                        }
                    }
                    .background(Color(.systemBackground))
                    .cornerRadius(12)
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .accentColor(.black)
            .navigationTitle("My Profile")
    }
}

struct ProfileOptionRow: View {
    let title: String
    let subtitle: String
    let iconName: String
    
    var body: some View {
        HStack {
            Image(systemName: iconName)
                .foregroundColor(.red)
                .frame(width: 30)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.body)
                
                Text(subtitle)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            
            Spacer()
            
            Image(systemName: "chevron.right")
                .foregroundColor(.gray)
        }
        .padding()
        .contentShape(Rectangle())
    }
}

#Preview {
    NavigationStack {
        ProfileView()
    }
}
