import SwiftUI

struct ProductCard: View {
    
    // MARK: - PROPERTIS
    let product: Product
    var state: ProductCardState = .defaultForOther
    var imageSize: CGFloat = 160
    var showFullDetails: Bool = true
    var secondaryAction: ()->Void = {}
    
    // MARK: - init
    init(
        product: Product,
        state: ProductCardState = .defaultForOther,
        imageSize: CGFloat = 160,
        showFullDetails: Bool = true,
        secondaryAction: @escaping () -> Void = {}
    ) {
        self.product = product
        self.state = state
        self.imageSize = imageSize
        self.showFullDetails = showFullDetails
        self.secondaryAction = secondaryAction
    }
    
    // MARK: - Body
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Product Image
            ZStack(alignment: .topTrailing) {
                
                AsyncImageView(imageUrl: product.images.first) {
                    Image(.cardMen)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                }
                .frame(width: 160, height: imageSize)
                .overlay {
                    Text("Sorry, this item is currently sold out")
                        .font(.system(size: 11))
                        .frame(maxWidth: .infinity)
                        .background(
                            Rectangle()
                                .fill(.white.opacity(0.5))
                        )
                        .frame(maxHeight: .infinity, alignment: .bottom)
                        .if(state != .soldOut) { $0.hidden() }
                }
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay {
                    // Favorite / Bag Buttons
                    secondaryButton(secondaryAction)
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
                    // Rating
                    ratingUI
                    
                    VStack(alignment: .leading, spacing: 2) {
                        Text(product.brand.name)
                            .font(.caption)
                            .foregroundColor(.gray)
                        
                        Text(product.name)
                            .font(.subheadline)
                            .foregroundStyle(.black)
                            .lineLimit(2)
                    }
                    
                    // Price
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text("$\(String(format: "%.2f", Double(truncating: product.price as NSNumber)))")
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundStyle(.black)
                        
                        if let originalPrice = product.originalPrice {
                            Text("$\(String(format: "%.2f", Double(truncating: originalPrice as NSNumber)))")
                                .font(.caption)
                                .strikethrough()
                                .foregroundColor(.gray)
                        }
                    }
                }
            }
        }
        .frame(width: 160)
        .if(state == .soldOut) { view in
            view
                .overlay {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(.white.opacity(0.5))
                }
        }
        .if(state != .defaultForOther) { view in
            view
                .overlay {
                    if state != .defaultForOther {
                        removeButton(secondaryAction)
                    }
                }
        }
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
    
    var ratingUI: some View {
        HStack(spacing: 4) {
            Image(systemName: "star.fill")
                .foregroundColor(.yellow)
            Text(String(format: "%.1f", product.rating))
                .font(.caption)
                .foregroundStyle(.black)
            Text("(\(product.reviewCount))")
                .font(.caption)
                .foregroundColor(.gray)
        }
    }
    
    func secondaryButton(_ action: @escaping ()-> Void) -> some View {
        ZStack {
            switch state {
                // Favorite button
            case .defaultForFavorite:
                ProductCardBagButton(action: action)
                
                // Favorite button
            case .defaultForOther:
                FavoriteButton(isSelected: product.isFavorite, action: action)
                
                // No button
            case .soldOut:
                EmptyView()
                    .hidden()
            }
        }
    }
    
    func removeButton(_ action: @escaping ()-> Void) -> some View {
        Button(
            action: action,
            label: {
                Image(systemName: "xmark")
                    .resizable()
                    .scaledToFit()
                    .fontWeight(.semibold)
                    .foregroundStyle(.gray)
                    .frame(width: 15, height: 15)
                    .padding(10)
            }
        )
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
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
        brand: Brand(id: UUID().uuidString, name: "Adidas", category: nil),
        rating: 4.5,
        reviewCount: 128,
        colors: ["White", "Black"],
        sizes: ["S", "M", "L", "XL"],
        isNew: false,
        isFavorite: false,
        createdAt: .now,
        subcategory: .tshirts
    ))
    .environmentObject(FavoritesManager())
    
}

enum ProductCardState {
    case defaultForFavorite
    case defaultForOther
    case soldOut
}
