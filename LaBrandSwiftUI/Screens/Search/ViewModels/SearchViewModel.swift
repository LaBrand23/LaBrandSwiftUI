import SwiftUI
import Combine
#if canImport(FoundationModels)
import FoundationModels
#endif

@MainActor
class SearchViewModel: ObservableObject {
    @Published var searchText = ""
    @Published var searchResults: [Product] = []
    @Published var recentSearches: [String] = []
    @Published var trendingProducts: [Product] = []
    @Published var aiSuggestions: [String] = []
    @Published var isLoading = false
    @Published var isAIAvailable = false
    @Published var error: Error?
    
    private var cancellables = Set<AnyCancellable>()
    private let maxRecentSearches = 10
    
    #if canImport(FoundationModels)
    private var aiSession: (any Sendable)?
    #endif
    
    init() {
        loadRecentSearches()
        setupSearchPublisher()
        loadTrendingProducts()
        checkAIAvailability()
    }
    
    // MARK: - AI Availability Check
    private func checkAIAvailability() {
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            let model = SystemLanguageModel.default
            isAIAvailable = model.availability == .available
            
            if isAIAvailable {
                setupAISession()
            }
        }
        #endif
    }
    
    #if canImport(FoundationModels)
    @available(iOS 26.0, *)
    private func setupAISession() {
        let instructions = """
        You are a fashion shopping assistant for a luxury brand app called LaBrand.
        When given a search query, suggest 3-5 related fashion search terms.
        Focus on specific product types, styles, occasions, or fashion trends.
        Keep suggestions concise (1-3 words each).
        Return only the suggestions, one per line.
        """
        aiSession = LanguageModelSession(instructions: instructions) as (any Sendable)
    }
    #endif
    
    private func setupSearchPublisher() {
        $searchText
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .removeDuplicates()
            .sink { [weak self] text in
                guard !text.isEmpty else {
                    self?.searchResults = []
                    self?.aiSuggestions = []
                    return
                }
                
                Task {
                    await self?.performSearch(text)
                    await self?.generateAISuggestions(for: text)
                }
            }
            .store(in: &cancellables)
    }
    
    private func performSearch(_ query: String) async {
        isLoading = true
        defer { isLoading = false }
        
        // TODO: Implement actual search API call
        // For now, using mock data
        try? await Task.sleep(nanoseconds: 500_000_000)
        
        // Filter mock products based on search query
        searchResults = mockProducts.filter { product in
            product.name.localizedCaseInsensitiveContains(query) ||
            product.brand.name.localizedCaseInsensitiveContains(query) ||
            product.description.localizedCaseInsensitiveContains(query)
        }
        
        // Add to recent searches
        if !query.isEmpty && !recentSearches.contains(query) {
            recentSearches.insert(query, at: 0)
            if recentSearches.count > maxRecentSearches {
                recentSearches.removeLast()
            }
            saveRecentSearches()
        }
    }
    
    // MARK: - AI-Powered Suggestions
    private func generateAISuggestions(for query: String) async {
        #if canImport(FoundationModels)
        if #available(iOS 26.0, *) {
            guard isAIAvailable, let session = aiSession as? LanguageModelSession else {
                // Fallback to static suggestions
                aiSuggestions = generateFallbackSuggestions(for: query)
                return
            }

            do {
                let prompt = "Suggest related fashion search terms for: \(query)"
                let response = try await session.respond(to: prompt)

                // Parse response into suggestions
                let suggestions = response.content
                    .components(separatedBy: CharacterSet.newlines)
                    .map { $0.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines) }
                    .filter { !$0.isEmpty }
                    .prefix(5)

                aiSuggestions = Array(suggestions)
            } catch {
                // Fallback to static suggestions on error
                aiSuggestions = generateFallbackSuggestions(for: query)
            }
        } else {
            aiSuggestions = generateFallbackSuggestions(for: query)
        }
        #else
        aiSuggestions = generateFallbackSuggestions(for: query)
        #endif
    }
    
    private func generateFallbackSuggestions(for query: String) -> [String] {
        // Basic keyword-based suggestions
        let lowercased = query.lowercased()
        
        if lowercased.contains("dress") {
            return ["Evening dresses", "Casual dresses", "Mini dresses", "Maxi dresses"]
        } else if lowercased.contains("shirt") {
            return ["Silk shirts", "Casual shirts", "Oversized shirts", "Button-down"]
        } else if lowercased.contains("jacket") {
            return ["Leather jackets", "Denim jackets", "Blazers", "Bomber jackets"]
        } else if lowercased.contains("bag") || lowercased.contains("purse") {
            return ["Tote bags", "Crossbody bags", "Clutches", "Shoulder bags"]
        } else if lowercased.contains("shoe") {
            return ["Sneakers", "Heels", "Boots", "Loafers"]
        }
        
        return ["Trending now", "New arrivals", "Best sellers", "On sale"]
    }
    
    func selectAISuggestion(_ suggestion: String) {
        searchText = suggestion
    }
    
    func removeRecentSearch(_ search: String) {
        recentSearches.removeAll { $0 == search }
        saveRecentSearches()
    }
    
    func clearAllRecentSearches() {
        recentSearches.removeAll()
        saveRecentSearches()
    }
    
    private func loadRecentSearches() {
        recentSearches = UserDefaults.standard.stringArray(forKey: "RecentSearches") ?? []
    }
    
    private func saveRecentSearches() {
        UserDefaults.standard.set(recentSearches, forKey: "RecentSearches")
    }
    
    private func loadTrendingProducts() {
        // TODO: Implement actual trending products API call
        // For now, using mock data
        trendingProducts = Array(mockProducts.prefix(4))
    }
    
    // Mock products for demo
    private let mockProducts = Product.mockProducts
}
