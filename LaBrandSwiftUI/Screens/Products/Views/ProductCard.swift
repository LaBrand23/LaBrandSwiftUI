import SwiftUI

struct ProductCard: View {
    
    // MARK: - PROPERTIS
    let product: Product
    var imageSize: CGFloat = 160
    var showFullDetails: Bool = true
    var favoriteAction: ()->Void = {}
    
    // MARK: - Body
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Product Image
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: product.images.first ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Image(.cardMen)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                }
                .frame(width: 160, height: imageSize)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay {
                    // Favorite button
                    FavoriteButton(isSelected: product.isFavorite, action: favoriteAction)
                        .frame(width: 36, height: 36)
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                        .offset(y: 40/2)
                }
                
                // Discount badge
                tagView
                    .clipShape(Capsule())
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(8)
            }
            
            if showFullDetails {
                // Brand & Name
                VStack(alignment: .leading, spacing: 4) {
                    Text(product.brand)
                        .font(.caption)
                        .foregroundColor(.gray)
                    
                    Text(product.name)
                        .font(.subheadline)
                        .lineLimit(2)
                }
                
                // Rating
                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                    Text(String(format: "%.1f", product.rating))
                        .font(.caption)
                    Text("(\(product.reviewCount))")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
                
                // Price
                HStack(alignment: .firstTextBaseline, spacing: 4) {
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
        }
        .frame(width: 160)
    }
}

// MARK: - UI

private extension ProductCard {
    
    var tagView: some View {
        HStack {
            switch product.tag {
            case .sale:
                Text("-\(product.discountPercentage ?? 0)%")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.red)
                
            case .new:
                Text("New")
                    .font(.caption)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.black)
                
            case .default:
                EmptyView()
            }
        }
    }
    
}

#Preview {
    ProductCard(product: Product(
        id: UUID(),
        name: "Classic White T-Shirt",
        description: "A comfortable and stylish basic tee",
        price: 29.99,
        originalPrice: 50,
        images: ["card_men"],
        category: Category(id: UUID(), name: "T-Shirts", image: "tshirt", parentCategoryID: nil, subcategories: nil),
        brand: "LaBrand",
        rating: 4.5,
        reviewCount: 128,
        colors: ["White", "Black"],
        sizes: ["S", "M", "L", "XL"],
        isNew: false,
        isFavorite: false,
        createdAt: .now
    ))
    .environmentObject(FavoritesManager())
}
