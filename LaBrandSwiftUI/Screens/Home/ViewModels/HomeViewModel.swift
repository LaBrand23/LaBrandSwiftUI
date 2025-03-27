import SwiftUI

@MainActor
class HomeViewModel: ObservableObject {
    @Published var promotions: [Promotion] = []
    @Published var categories: [Category] = []
    @Published var newArrivals: [Product] = []
    @Published var saleProducts: [Product] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    init() {
        Task {
            await fetchData()
        }
    }
    
    func fetchData() async {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Replace with actual API calls
        // For now, using mock data
        promotions = [
            Promotion(
                id: UUID(),
                title: "Summer Collection",
                subtitle: "Up to 50% off",
                backgroundImage: "mock_image1"
            ),
            Promotion(
                id: UUID(),
                title: "New Arrivals",
                subtitle: "Check out the latest styles",
                backgroundImage: "mock_image1"
            )
        ]
        
        categories = [
            Category(id: UUID(), name: "Women", image: "women_cat", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Men", image: "men_cat", parentCategoryID: nil, subcategories: nil),
            Category(id: UUID(), name: "Kids", image: "kids_cat", parentCategoryID: nil, subcategories: nil),
        ]
        
        newArrivals = Product.mockProducts
        
        saleProducts = Product.mockProducts
    }
} 
