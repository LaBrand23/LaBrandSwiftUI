import SwiftUI
import Vision

@MainActor
class VisualSearchViewModel: ObservableObject {
    @Published var selectedImage: UIImage?
    @Published var similarProducts: [Product] = []
    @Published var isSearching = false
    @Published var showCamera = false
    @Published var showPhotoPicker = false
    @Published var error: Error?
    
    // Mock products for demo
    private let mockProducts = Product.mockProducts
    
    func searchSimilarProducts() async {
        guard let image = selectedImage else { return }
        
        isSearching = true
        defer { isSearching = false }
        
        do {
            // 1. Extract features from the image using Vision
            let features = try await extractImageFeatures(from: image)
            
            // 2. In a real app, send these features to your backend for similarity search
            // For demo, we'll just return mock products after a delay
            try await Task.sleep(nanoseconds: 2_000_000_000)
            
            // 3. Update the UI with results
            similarProducts = mockProducts
            
        } catch {
            self.error = error
            similarProducts = []
        }
    }
    
    private func extractImageFeatures(from image: UIImage) async throws -> [Float] {
//        guard let cgImage = image.cgImage else {
//            throw NSError(domain: "VisualSearch", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to get CGImage"])
//        }
//        
//        let requestHandler = VNImageRequestHandler(cgImage: cgImage)
//        let request = VNGenerateImageFeaturePrintRequest()
//        try requestHandler.perform([request])
//        
//        guard let observation = request.results?.first as? VNFeaturePrintObservation else {
//            throw NSError(domain: "VisualSearch", code: 2, userInfo: [NSLocalizedDescriptionKey: "Failed to generate feature print"])
//        }
//        
//        // Convert feature print to float array
//        var features: [Float] = Array(repeating: 0, count: observation.featurePrintSize)
//        try observation.copy(featurePrintData: &features)
//        
//        return features
        
        return [2.1]
    }
} 
