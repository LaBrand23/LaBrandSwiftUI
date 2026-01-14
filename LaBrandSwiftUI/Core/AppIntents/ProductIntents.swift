//
//  ProductIntents.swift
//  LaBrandSwiftUI
//
//  App Intents for Spotlight integration and Siri shortcuts
//

import AppIntents
import SwiftUI

// MARK: - Product Entity for App Intents
@available(iOS 16.0, *)
struct ProductEntity: AppEntity {
    
    static var typeDisplayRepresentation = TypeDisplayRepresentation(
        name: "Product",
        numericFormat: "\(placeholder: .int) products"
    )
    
    static var defaultQuery = ProductQuery()
    
    var id: String
    var name: String
    var brandName: String
    var price: Double
    var imageURL: String?
    
    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(
            title: "\(name)",
            subtitle: "\(brandName) - $\(String(format: "%.0f", price))",
            image: .init(systemName: "tag.fill")
        )
    }
    
    init(from product: Product) {
        self.id = product.id.uuidString
        self.name = product.name
        self.brandName = product.brand.name
        self.price = product.price
        self.imageURL = product.images.first
    }
    
    init(id: String, name: String, brandName: String, price: Double, imageURL: String? = nil) {
        self.id = id
        self.name = name
        self.brandName = brandName
        self.price = price
        self.imageURL = imageURL
    }
}

// MARK: - Product Query
@available(iOS 16.0, *)
struct ProductQuery: EntityQuery {
    
    func entities(for identifiers: [String]) async throws -> [ProductEntity] {
        // Fetch products by IDs
        return Product.mockProducts
            .filter { identifiers.contains($0.id.uuidString) }
            .map { ProductEntity(from: $0) }
    }
    
    func suggestedEntities() async throws -> [ProductEntity] {
        // Return trending/popular products
        return Array(Product.mockProducts.prefix(5))
            .map { ProductEntity(from: $0) }
    }
}

// MARK: - Search Products Intent
@available(iOS 16.0, *)
struct SearchProductsIntent: AppIntent {
    
    static var title: LocalizedStringResource = "Search Products"
    static var description = IntentDescription("Search for products in LaBrand")
    
    @Parameter(title: "Search Query")
    var query: String
    
    static var parameterSummary: some ParameterSummary {
        Summary("Search for \(\.$query)")
    }
    
    func perform() async throws -> some IntentResult & ReturnsValue<[ProductEntity]> & ProvidesDialog {
        let results = Product.mockProducts.filter { product in
            product.name.localizedCaseInsensitiveContains(query) ||
            product.brand.name.localizedCaseInsensitiveContains(query) ||
            product.description.localizedCaseInsensitiveContains(query)
        }
        
        let entities = results.map { ProductEntity(from: $0) }
        
        if entities.isEmpty {
            return .result(
                value: [],
                dialog: "No products found for \"\(query)\""
            )
        } else {
            return .result(
                value: entities,
                dialog: "Found \(entities.count) products for \"\(query)\""
            )
        }
    }
}

// MARK: - Open Product Intent
@available(iOS 16.0, *)
struct OpenProductIntent: AppIntent {
    
    static var title: LocalizedStringResource = "Open Product"
    static var description = IntentDescription("Open a product in LaBrand")
    
    @Parameter(title: "Product")
    var product: ProductEntity
    
    static var parameterSummary: some ParameterSummary {
        Summary("Open \(\.$product)")
    }
    
    @MainActor
    func perform() async throws -> some IntentResult {
        // Post notification to open product
        NotificationCenter.default.post(
            name: .openProductFromIntent,
            object: nil,
            userInfo: ["productId": product.id]
        )
        
        return .result()
    }
}

// MARK: - View Favorites Intent
@available(iOS 16.0, *)
struct ViewFavoritesIntent: AppIntent {
    
    static var title: LocalizedStringResource = "View Favorites"
    static var description = IntentDescription("View your favorite products in LaBrand")
    
    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // Post notification to open favorites
        NotificationCenter.default.post(
            name: .openFavoritesFromIntent,
            object: nil
        )
        
        return .result(dialog: "Opening your favorites...")
    }
}

// MARK: - View Bag Intent
@available(iOS 16.0, *)
struct ViewBagIntent: AppIntent {
    
    static var title: LocalizedStringResource = "View Shopping Bag"
    static var description = IntentDescription("View your shopping bag in LaBrand")
    
    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        // Post notification to open bag
        NotificationCenter.default.post(
            name: .openBagFromIntent,
            object: nil
        )
        
        return .result(dialog: "Opening your shopping bag...")
    }
}

// MARK: - App Shortcuts Provider
@available(iOS 16.0, *)
struct LaBrandShortcuts: AppShortcutsProvider {
    
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: SearchProductsIntent(),
            phrases: [
                "Search products in \(.applicationName)",
                "Find products on \(.applicationName)",
                "Look for items in \(.applicationName)"
            ],
            shortTitle: "Search Products",
            systemImageName: "magnifyingglass"
        )
        
        AppShortcut(
            intent: ViewFavoritesIntent(),
            phrases: [
                "Show my favorites in \(.applicationName)",
                "Open my wishlist in \(.applicationName)",
                "View saved items in \(.applicationName)"
            ],
            shortTitle: "View Favorites",
            systemImageName: "heart.fill"
        )
        
        AppShortcut(
            intent: ViewBagIntent(),
            phrases: [
                "Show my bag in \(.applicationName)",
                "Open my cart in \(.applicationName)",
                "View my shopping bag in \(.applicationName)"
            ],
            shortTitle: "View Bag",
            systemImageName: "bag.fill"
        )
    }
}

// MARK: - Notification Names
extension Notification.Name {
    static let openProductFromIntent = Notification.Name("openProductFromIntent")
    static let openFavoritesFromIntent = Notification.Name("openFavoritesFromIntent")
    static let openBagFromIntent = Notification.Name("openBagFromIntent")
}
