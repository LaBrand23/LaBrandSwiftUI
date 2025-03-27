import SwiftUI

struct OrderSuccessView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            Image("success_image") // Add this image to assets
                .resizable()
                .aspectRatio(contentMode: .fit)
                .frame(height: 200)
            
            Text("Success!")
                .font(.title)
                .fontWeight(.bold)
            
            Text("Your order will be delivered soon.\nThank you for choosing our app!")
                .multilineTextAlignment(.center)
                .foregroundColor(.gray)
            
            Spacer()
            
            Button(action: {
                dismiss()
            }) {
                Text("Continue Shopping")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .cornerRadius(12)
            }
            .padding(.horizontal)
        }
        .background(Color.yellow) // Match the background color from the design
    }
} 