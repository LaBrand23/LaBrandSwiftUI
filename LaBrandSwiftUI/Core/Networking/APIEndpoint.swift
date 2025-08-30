//
//  APIEndpoint.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//

import Foundation

public enum APIEndpoint: String, CaseIterable {

    // MARK: - Auth

    case register = "/auth/register"
    case login = "/auth/login"
    case refresh = "/auth/refresh"
    case me = "/auth/me"
    case logout = "/auth/logout"
    
    // MARK: - Mobile API
    
    case mobileQuickCategories = "/mobile/quick-categories"
    case mobileNewArrivals = "/mobile/new-arrivals"
    case mobileCategoryCollections = "/mobile/category-collections"
    case mobileTrendingProducts = "/mobile/trending-products"
}
