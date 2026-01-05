import SwiftUI

struct ProductCard: View {
    
    // MARK: - Properties
    let product: Product
    var state: ProductCardState = .defaultForOther
    var imageSize: CGFloat
    var showFullDetails: Bool
    var secondaryAction: () -> Void
    var removeAction: () -> Void
    
    @State private var isPressed = false
    
    // MARK: - Init
    init(
        product: Product,
        state: ProductCardState = .defaultForOther,
        imageSize: CGFloat = 200,
        showFullDetails: Bool = true,
        removeAction: @escaping () -> Void = {},
        secondaryAction: @escaping () -> Void = {}
    ) {
        self.product = product
        self.state = state
        self.imageSize = imageSize
        self.showFullDetails = showFullDetails
        self.removeAction = removeAction
        self.secondaryAction = secondaryAction
    }
    
    // MARK: - Body
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Product Image
            ZStack(alignment: .topLeading) {
                AsyncImageView(imageUrl: product.images.first) {
                    Image(.cardMen)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                }
                .frame(width: 160, height: imageSize)
                .overlay {
                    // Sold out overlay
                    if state == .soldOut {
                        VStack {
                            Spacer()
                            Text("SOLD OUT")
                                .font(.system(size: 10, weight: .semibold))
                                .tracking(2)
                                .foregroundStyle(AppColors.Text.primary)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 8)
                                .background(AppColors.Background.surface.opacity(0.9))
                        }
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 4))
                
                // Tag badge
                tagView
                    .padding(10)
                
                // Secondary action button (favorite/bag)
                secondaryButton(secondaryAction)
                    .frame(width: 36, height: 36)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottomTrailing)
                    .offset(x: -8, y: 18)
            }
            
            if showFullDetails {
                // Product Info
                VStack(alignment: .leading, spacing: 6) {
                    // Brand name
                    Text(product.brand.name.uppercased())
                        .font(.system(size: 10, weight: .medium))
                        .tracking(1.5)
                        .foregroundStyle(AppColors.Text.muted)
                    
                    // Product name
                    Text(product.name)
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.Text.primary)
                        .lineLimit(2)
                        .multilineTextAlignment(.leading)
                    
                    // Rating
                    ratingView
                    
                    // Price
                    priceView
                }
                .padding(.top, 4)
            }
        }
        .frame(width: 160)
        .scaleEffect(isPressed ? 0.98 : 1.0)
        .animation(.spring(response: 0.3), value: isPressed)
        .onLongPressGesture(minimumDuration: .infinity, pressing: { pressing in
            isPressed = pressing
        }, perform: {})
        .if(state == .soldOut) { view in
            view.opacity(0.7)
        }
        .overlay(alignment: .topTrailing) {
            if state != .defaultForOther {
                removeButton(removeAction)
            }
        }
    }
}

// MARK: - Subviews
private extension ProductCard {
    
    @ViewBuilder
    var tagView: some View {
        switch product.tag {
        case .sale:
            Text("-\(product.discountPercentage ?? 0)%")
                .font(.system(size: 10, weight: .bold))
                .tracking(0.5)
                .foregroundStyle(AppColors.Text.inverted)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(AppColors.Accent.sale)
                .clipShape(Capsule())
            
        case .new:
            Text("NEW")
                .font(.system(size: 9, weight: .bold))
                .tracking(1)
                .foregroundStyle(AppColors.Text.inverted)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(AppColors.Background.editorial)
                .clipShape(Capsule())
            
        case .default:
            EmptyView()
        }
    }
    
    var ratingView: some View {
        HStack(spacing: 4) {
            HStack(spacing: 2) {
                ForEach(0..<5) { index in
                    Image(systemName: index < Int(product.rating) ? "star.fill" : "star")
                        .font(.system(size: 9))
                        .foregroundStyle(index < Int(product.rating) ? AppColors.Rating.filled : AppColors.Rating.empty)
                }
            }
            
            Text("(\(product.reviewCount))")
                .font(.system(size: 11))
                .foregroundStyle(AppColors.Text.muted)
        }
    }
    
    var priceView: some View {
        HStack(alignment: .firstTextBaseline, spacing: 6) {
            Text("$\(String(format: "%.0f", product.price))")
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(product.originalPrice != nil ? AppColors.Accent.sale : AppColors.Text.primary)
            
            if let originalPrice = product.originalPrice {
                Text("$\(String(format: "%.0f", Double(truncating: originalPrice as NSNumber)))")
                    .font(.system(size: 12))
                    .strikethrough()
                    .foregroundStyle(AppColors.Text.muted)
            }
        }
    }
    
    @ViewBuilder
    func secondaryButton(_ action: @escaping () -> Void) -> some View {
        switch state {
        case .defaultForFavorite:
            ProductCardBagButton(action: action)
            
        case .defaultForOther:
            FavoriteButton(isSelected: product.isFavorite, action: action)
            
        case .soldOut:
            EmptyView()
        }
    }
    
    func removeButton(_ action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: "xmark")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(AppColors.Text.tertiary)
                .frame(width: 28, height: 28)
                .background(
                    Circle()
                        .fill(AppColors.Background.surface)
                        .shadow(color: AppColors.Shadow.light, radius: 4, y: 2)
                )
        }
        .padding(8)
    }
}

// MARK: - Preview
#Preview {
    HStack(spacing: 16) {
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
        
        ProductCard(product: Product(
            id: UUID(),
            name: "Premium Wool Blazer",
            description: "Elegant wool blazer for formal occasions",
            price: 299,
            originalPrice: nil,
            images: ["card_men"],
            category: Category(id: UUID(), name: "Blazers", image: "blazer", parentCategoryID: nil, subcategories: nil),
            brand: Brand(id: UUID().uuidString, name: "Hugo Boss", category: nil),
            rating: 4.8,
            reviewCount: 56,
            colors: ["Navy", "Black"],
            sizes: ["S", "M", "L"],
            isNew: true,
            isFavorite: true,
            createdAt: .now,
            subcategory: .sweaters
        ))
    }
    .padding()
    .background(AppColors.Background.primary)
    .environmentObject(FavoritesManager())
    .withAppTheme()
}

enum ProductCardState {
    case defaultForFavorite
    case defaultForOther
    case soldOut
}
