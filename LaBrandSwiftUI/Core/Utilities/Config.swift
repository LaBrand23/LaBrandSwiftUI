//
//  Config.swift
//  LaBrandSwiftUI
//
//  Created by Shakzod on 24/08/2025.
//
import Foundation

struct Config {
    static let baseURL: String = Bundle.main.object(forInfoDictionaryKey: "BASE_URL") as? String ?? ""
}
