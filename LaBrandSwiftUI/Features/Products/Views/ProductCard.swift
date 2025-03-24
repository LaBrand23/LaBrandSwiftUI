import SwiftUI

struct ProductCard: View {
    let product: Product
    var imageSize: CGFloat = 160
    var showFullDetails: Bool = true
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Product Image
            ZStack(alignment: .topTrailing) {
                AsyncImage(url: URL(string: product.images.first ?? "")) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Rectangle()
                        .foregroundColor(Color(.systemGray6))
                }
                .frame(width: imageSize, height: imageSize)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                
                // Discount badge
                if let discount = product.discountPercentage {
                    Text("-\(discount)%")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.red)
                        .clipShape(Capsule())
                        .padding(8)
                }
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
        .frame(width: imageSize)
    }
}

#Preview {
    ProductCard(product: Product(
        id: UUID(),
        name: "Classic White T-Shirt",
        description: "A comfortable and stylish basic tee",
        price: 29.99,
        originalPrice: 39.99,
        images: ["placeholder"],
        category: Category(id: UUID(), name: "T-Shirts", image: "tshirt", parentCategoryID: nil, subcategories: nil),
        brand: "LaBrand",
        rating: 4.5,
        reviewCount: 128,
        colors: ["White", "Black"],
        sizes: ["S", "M", "L", "XL"],
        isNew: true,
        isFavorite: false,
        createdAt: .now
    ))
} 
