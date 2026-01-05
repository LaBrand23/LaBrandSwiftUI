//
//  ProductListViewModel.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

@MainActor
class ProductListViewModel: ObservableObject {
    @Published var products: [Product] = []
    @Published var filteredProducts: [Product] = []
    @Published var selectedPriceRange: ClosedRange<Double> = 0...1000
    @Published var selectedColors: Set<String> = []
    @Published var selectedSizes: Set<String> = []
    @Published var selectedBrands: Set<Brand> = []
    var activeFilters: Set<String> {
        var filters: Set<String> = []
        
        if !selectedColors.isEmpty {
            filters.formUnion(selectedColors)
        }
        
        if !selectedSizes.isEmpty {
            filters.formUnion(selectedSizes)
        }
        
        if !selectedBrands.isEmpty {
            filters.formUnion(selectedBrands.map { $0.name })
        }
        
        if selectedPriceRange != 0...1000 {
            filters.insert("$\(Int(selectedPriceRange.lowerBound))-$\(Int(selectedPriceRange.upperBound))")
        }
        
        return filters
    }
    @Published var sortOption: SortOption = .newest
    @Published var currentSubcategory: ProductSubcategory? = .tshirts
    
    func loadProducts(for category: Category) {
        // Here you would typically load products from an API
        // For now, we'll use mock data
        products = Product.mockProducts
        filterProducts()
    }
    
    func showAllProducts() {
        currentSubcategory = nil // Indicate no filtering by subcategory
        filterProducts()
    }
    
    func filterBySubcategory(_ subcategory: ProductSubcategory) {
        currentSubcategory = subcategory
        filterProducts()
    }
    
    func removeFilter(_ filter: String) {
        // Remove the corresponding filter from the appropriate set
        if selectedColors.contains(filter) {
            selectedColors.remove(filter)
        } else if selectedSizes.contains(filter) {
            selectedSizes.remove(filter)
        } else if let brandToRemove = selectedBrands.first(where: { $0.name == filter }) {
            selectedBrands.remove(brandToRemove)
        }
        // Handle price range filter removal
        if filter.contains("$") {
            selectedPriceRange = 0...1000
        }
        filterProducts()
    }
    
    func clearAllFilters() {
        selectedColors.removeAll()
        selectedSizes.removeAll()
        selectedBrands.removeAll()
        selectedPriceRange = 0...1000
        filterProducts()
    }
    
    private func filterProducts() {
        filteredProducts = products
            .filter { product in
                // Filter by subcategory
                let subcategoryMatch = currentSubcategory == nil || product.subcategory == currentSubcategory

                // Filter by price range
                let priceMatch = selectedPriceRange.contains(product.price)

                // Filter by colors
                let colorMatch = selectedColors.isEmpty || product.colors.contains(selectedColors)

                // Filter by sizes
                let sizeMatch = selectedSizes.isEmpty || !selectedSizes.isDisjoint(with: product.sizes)

                // Filter by brands
                let brandMatch = selectedBrands.isEmpty || selectedBrands.contains(where: { $0.id == product.brand.id })

                return subcategoryMatch && priceMatch && colorMatch && sizeMatch && brandMatch
            }
            .sorted { (lhs: Product, rhs: Product) in
                switch sortOption {
                case .popular:
                    return lhs.rating > rhs.rating
                case .newest:
                    return lhs.createdAt > rhs.createdAt
                case .customerReview:
                    return lhs.reviewCount > rhs.reviewCount
                case .priceLowToHigh:
                    return lhs.price < rhs.price
                case .priceHighToLow:
                    return lhs.price > rhs.price
                }
            }
    }
}

enum SortOption {
    case popular
    case newest
    case customerReview
    case priceLowToHigh
    case priceHighToLow
    
    var displayText: String {
        switch self {
        case .popular:
            return "Popular"
        case .newest:
            return "Newest"
        case .customerReview:
            return "Customer Review"
        case .priceLowToHigh:
            return "Price: Low to High"
        case .priceHighToLow:
            return "Price: High to Low"
        }
    }
}
