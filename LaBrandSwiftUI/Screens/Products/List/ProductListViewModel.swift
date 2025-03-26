//
//  ProductListViewModel.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

class ProductListViewModel: ObservableObject {
    
    enum SortOption {
        case popular, newest, customerReview, priceLowToHigh, priceHighToLow
        
        var displayText: String {
            switch self {
            case .popular: return "Popular"
            case .newest: return "Newest"
            case .customerReview: return "Customer Review"
            case .priceLowToHigh: return "Price: Low to High"
            case .priceHighToLow: return "Price: High to Low"
            }
        }
    }
    
    @Published var products: [Product] = []
    @Published var sortOption: SortOption = .popular
    @Published var selectedPriceRange: ClosedRange<Double> = 0...1000
    @Published var selectedColors: Set<String> = []
    @Published var selectedSizes: Set<String> = []
    @Published var selectedBrands: Set<String> = []
    
    var filteredProducts: [Product] {
        var result = products
        
        // Apply filters
        if !selectedColors.isEmpty {
            result = result.filter { product in
                product.colors.contains { selectedColors.contains($0) }
            }
        }
        
        if !selectedSizes.isEmpty {
            result = result.filter { product in
                product.sizes.contains { selectedSizes.contains($0) }
            }
        }
        
        if !selectedBrands.isEmpty {
            result = result.filter { selectedBrands.contains($0.brand) }
        }
        
        let minPrice = Decimal(selectedPriceRange.lowerBound)
        let maxPrice = Decimal(selectedPriceRange.upperBound)
        result = result.filter { $0.price >= minPrice && $0.price <= maxPrice }
        
        // Apply sorting
        switch sortOption {
        case .popular:
            result.sort { $0.reviewCount > $1.reviewCount }
        case .newest:
            result.sort(by: { $0.createdAt > $1.createdAt})
        case .customerReview:
            result.sort { $0.rating > $1.rating }
        case .priceLowToHigh:
            result.sort { $0.price < $1.price }
        case .priceHighToLow:
            result.sort { $0.price > $1.price }
        }
        
        return result
    }
    
    var activeFilters: [String] {
        var filters: [String] = []
        
        if !selectedColors.isEmpty {
            filters.append(contentsOf: selectedColors)
        }
        
        if !selectedSizes.isEmpty {
            filters.append(contentsOf: selectedSizes)
        }
        
        if !selectedBrands.isEmpty {
            filters.append(contentsOf: selectedBrands)
        }
        
        if selectedPriceRange != 0...1000 {
            filters.append("$\(Int(selectedPriceRange.lowerBound))-$\(Int(selectedPriceRange.upperBound))")
        }
        
        return filters
    }
    
    func loadProducts(for category: Category) {
        // TODO: Load products from backend
        // For now, using mock data
        products = Product.mockProducts
    }
    
    func removeFilter(_ filter: String) {
        selectedColors.remove(filter)
        selectedSizes.remove(filter)
        selectedBrands.remove(filter)
        
        // Handle price range filter removal
        if filter.contains("$") {
            selectedPriceRange = 0...1000
        }
    }
}

