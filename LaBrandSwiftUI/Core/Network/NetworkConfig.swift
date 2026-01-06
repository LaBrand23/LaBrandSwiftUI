//
//  NetworkConfig.swift
//  LaBrandSwiftUI
//
//  Network configuration for API and Supabase
//

import Foundation

enum NetworkConfig {
    // MARK: - Firebase Functions API
    // TODO: Update with your deployed function URL
    static let apiBaseURL = "https://asia-south1-labrand-ef645.cloudfunctions.net/api"
    
    // MARK: - Supabase (for direct queries if needed)
    static let supabaseURL = "https://uuirxtxqygpmqiunhkgs.supabase.co"
    static let supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1aXJ4dHhxeWdwbXFpdW5oa2dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NzI0ODgsImV4cCI6MjA4MzI0ODQ4OH0.XUUEtMR_LO-LsyYAsoqlRx8hCUMd0ICejoIhcCRj8HQ"
    
    // MARK: - Timeouts
    static let requestTimeout: TimeInterval = 30
    static let resourceTimeout: TimeInterval = 60
}

