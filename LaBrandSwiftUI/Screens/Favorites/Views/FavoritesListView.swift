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
                    .foregroundColor(AppColors.Background.secondary)
            }
            .frame(width: 100, height: 100)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            
            // Product Details
            VStack(alignment: .leading, spacing: 4) {
                Text(product.brand.name)
                    .font(.caption)
                    .foregroundColor(AppColors.Text.muted)
                
                Text(product.name)
                    .font(.subheadline)
                    .fontWeight(.medium)
                    .foregroundStyle(AppColors.Text.primary)
                
                if let size = product.sizes.first {
                    Text("Size: \(size)")
                        .font(.caption)
                        .foregroundColor(AppColors.Text.muted)
                }
                
                HStack(alignment: .firstTextBaseline) {
                    Text("$\(String(format: "%.2f", Double(truncating: product.price as NSNumber)))")
                        .font(.subheadline)
                        .fontWeight(.semibold)
                        .foregroundStyle(AppColors.Text.primary)
                    
                    if let originalPrice = product.originalPrice {
                        Text("$\(String(format: "%.2f", Double(truncating: originalPrice as NSNumber)))")
                            .font(.caption)
                            .strikethrough()
                            .foregroundColor(AppColors.Text.muted)
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
                    .foregroundColor(AppColors.Accent.sale)
                    .padding(8)
                    .background(AppColors.Background.secondary)
                    .clipShape(Circle())
            }
        }
        .padding()
        .background(AppColors.Background.surface)
        .cornerRadius(16)
        .shadow(color: AppColors.Shadow.light, radius: 8, x: 0, y: 4)
    }
} 
