import Foundation

// MARK: - Brand Model
struct Brand: Identifiable, Hashable {
    let id: String
    let name: String
    let category: String?
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
    
    static func == (lhs: Brand, rhs: Brand) -> Bool {
        lhs.id == rhs.id
    }
}

// MARK: - BrandService
protocol BrandServiceProtocol {
    func fetchBrands() async throws -> [Brand]
}

class MockBrandService: BrandServiceProtocol {
    func fetchBrands() async throws -> [Brand] {
        // Simulate network delay
        try await Task.sleep(nanoseconds: 1_000_000_000)
        
        return [
            Brand(id: "1", name: "adidas", category: "Sports"),
            Brand(id: "2", name: "adidas Originals", category: "Lifestyle"),
            Brand(id: "3", name: "Blend", category: "Casual"),
            Brand(id: "4", name: "Boutique Moschino", category: "Luxury"),
            Brand(id: "5", name: "Champion", category: "Sports"),
            Brand(id: "6", name: "Diesel", category: "Denim"),
            Brand(id: "7", name: "Jack & Jones", category: "Casual"),
            Brand(id: "8", name: "Naf Naf", category: "Fashion"),
            Brand(id: "9", name: "Red Valentino", category: "Luxury"),
            Brand(id: "10", name: "s.Oliver", category: "Casual")
        ]
    }
}

// MARK: - View Model
@MainActor
class BrandSearchViewModel: ObservableObject {
    @Published var searchQuery = ""
    @Published private(set) var brands: [Brand] = []
    @Published private(set) var isLoading = false
    @Published private(set) var error: Error?
    
    private let brandService: BrandServiceProtocol
    
    init(brandService: BrandServiceProtocol = MockBrandService()) {
        self.brandService = brandService
    }
    
    var filteredBrands: [Brand] {
        if searchQuery.isEmpty {
            return brands
        }
        return brands.filter { $0.name.lowercased().contains(searchQuery.lowercased()) }
    }
    
    func fetchBrands() {
        Task {
            do {
                isLoading = true
                error = nil
                brands = try await brandService.fetchBrands()
            } catch {
                self.error = error
            }
            isLoading = false
        }
    }
} 