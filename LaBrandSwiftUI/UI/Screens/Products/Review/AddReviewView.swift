import SwiftUI
import PhotosUI

struct AddReviewView: View {
    let product: Product
    @StateObject private var viewModel = AddReviewViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
//        NavigationView {
            Form {
                Section {
                    // Rating Selection
                    VStack(alignment: .leading, spacing: 16) {
                        Text("What is your rate?")
                            .font(.headline)
                        
                        HStack(spacing: 16) {
                            ForEach(1...5, id: \.self) { rating in
                                Button {
                                    viewModel.rating = rating
                                } label: {
                                    Image(systemName: rating <= viewModel.rating ? "star.fill" : "star")
                                        .font(.title2)
                                        .foregroundColor(.yellow)
                                }
                            }
                        }
                    }
                    .padding(.vertical, 8)
                    
                    // Review Text
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Please share your opinion about the product")
                            .font(.headline)
                        
                        TextEditor(text: $viewModel.comment)
                            .frame(height: 100)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color(.systemGray4))
                            )
                    }
                    .padding(.vertical, 8)
                }
                
                Section {
                    // Photo Upload
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Add photos")
                            .font(.headline)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                // Add Photo Button
                                Button {
                                    viewModel.showPhotoPicker = true
                                } label: {
                                    VStack {
                                        Image(systemName: "camera")
                                            .font(.title)
                                            .foregroundColor(.gray)
                                        Text("Add photo")
                                            .font(.caption)
                                            .foregroundColor(.gray)
                                    }
                                    .frame(width: 100, height: 100)
                                    .background(Color(.systemGray6))
                                    .cornerRadius(8)
                                }
                                
                                // Selected Photos
                                ForEach(viewModel.selectedPhotos.indices, id: \.self) { index in
                                    ZStack(alignment: .topTrailing) {
                                        Image(uiImage: viewModel.selectedPhotos[index])
                                            .resizable()
                                            .aspectRatio(contentMode: .fill)
                                            .frame(width: 100, height: 100)
                                            .clipShape(RoundedRectangle(cornerRadius: 8))
                                        
                                        Button {
                                            viewModel.selectedPhotos.remove(at: index)
                                        } label: {
                                            Image(systemName: "xmark.circle.fill")
                                                .foregroundColor(.white)
                                                .background(Color.black.opacity(0.5))
                                                .clipShape(Circle())
                                        }
                                        .padding(4)
                                    }
                                }
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            .navigationTitle("Write a Review")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task {
                            await viewModel.submitReview(for: product)
                            dismiss()
                        }
                    } label: {
                        Text("Submit")
                            .fontWeight(.semibold)
                    }
                    .disabled(!viewModel.isValid)
                }
            }
            .sheet(isPresented: $viewModel.showPhotoPicker) {
                PhotoPicker(selectedPhotos: $viewModel.selectedPhotos)
            }
            .alert("Review Submitted", isPresented: $viewModel.showSuccessAlert) {
                Button("OK") {
                    dismiss()
                }
            } message: {
                Text("Thank you for your review!")
            }
            .alert("Error", isPresented: $viewModel.showErrorAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(viewModel.errorMessage)
            }
//        }
    }
}

struct PhotoPicker: UIViewControllerRepresentable {
    @Binding var selectedPhotos: [UIImage]
    
    func makeUIViewController(context: Context) -> PHPickerViewController {
        var config = PHPickerConfiguration()
        config.selectionLimit = 5
        config.filter = .images
        
        let picker = PHPickerViewController(configuration: config)
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let parent: PhotoPicker
        
        init(_ parent: PhotoPicker) {
            self.parent = parent
        }
        
        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            picker.dismiss(animated: true)
            
            for result in results {
                result.itemProvider.loadObject(ofClass: UIImage.self) { image, error in
                    if let image = image as? UIImage {
                        DispatchQueue.main.async {
                            self.parent.selectedPhotos.append(image)
                        }
                    }
                }
            }
        }
    }
}

class AddReviewViewModel: ObservableObject {
    @Published var rating = 0
    @Published var comment = ""
    @Published var selectedPhotos: [UIImage] = []
    @Published var showPhotoPicker = false
    @Published var isSubmitting = false
    @Published var showSuccessAlert = false
    @Published var showErrorAlert = false
    @Published var errorMessage = ""
    
    var isValid: Bool {
        rating > 0 && !comment.isEmpty
    }
    
    func submitReview(for product: Product) async {
        guard isValid else { return }
        
        isSubmitting = true
        defer { isSubmitting = false }
        
        do {
            // TODO: Implement actual review submission to backend
            // Simulating network request
            try await Task.sleep(nanoseconds: 1_000_000_000)
            
            await MainActor.run {
                showSuccessAlert = true
            }
        } catch {
            await MainActor.run {
                errorMessage = error.localizedDescription
                showErrorAlert = true
            }
        }
    }
} 
