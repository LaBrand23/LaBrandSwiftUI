//
//  ProductSubcategory.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

enum ProductSubcategory: String, CaseIterable, Identifiable, Hashable {
    case tshirts = "T-shirts"
    case cropTops = "Crop tops"
    case blouses = "Blouses"
    case sweaters = "Sweaters"
    
    var id: String { rawValue }
}
