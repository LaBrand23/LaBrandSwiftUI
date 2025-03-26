import SwiftUI

struct FavoritesListView: View {
    let product: Product
    @ObservedObject var viewModel: FavoritesViewModel
    
    var body: some View {
        HStack(spacing: 16) {
            // Product Image
            AsyncImage(url: URL(string: product.images.first ?? "")) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .foregroundColor(Color(.systemGray6))
            }
            .frame(width: 100, height: 100)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            
            // Product Details
            VStack(alignment: .leading, spacing: 4) {
                Text(product.brand)
                    .font(.caption)
                    .foregroundColor(.gray)
                
                Text(product.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                if let size = product.sizes.first {
                    Text("Size: \(size)")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                HStack(alignment: .firstTextBaseline) {
                    Text("$\(String(format: "%.2f", Double(truncating: product.price as NSNumber)))")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                    
                    if let originalPrice = product.originalPrice {
                        Text("$\(String(format: "%.2f", Double(truncating: originalPrice as NSNumber)))")
                            .font(.caption)
                            .strikethrough()
                            .foregroundColor(.gray)
                    }
                }
            }
            
            Spacer()
            
            // Remove Button
            Button {
                withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                    viewModel.toggleFavorite(product)
                }
            } label: {
                Image(systemName: "heart.fill")
                    .foregroundColor(.red)
                    .padding(8)
                    .background(Color(.systemGray6))
                    .clipShape(Circle())
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 4)
    }
} 
