import SwiftUI
import PhotosUI

struct VisualSearchView: View {
    @StateObject private var viewModel = VisualSearchViewModel()
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                if let selectedImage = viewModel.selectedImage {
                    // Selected image preview
                    Image(uiImage: selectedImage)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(height: 300)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .overlay(
                            Button {
                                viewModel.selectedImage = nil
                                viewModel.similarProducts = []
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .foregroundColor(.white)
                                    .font(.title)
                                    .padding(8)
                            }
                            .padding(8),
                            alignment: .topTrailing
                        )
                    
                    if viewModel.isSearching {
                        ProgressView("Finding similar items...")
                    } else if !viewModel.similarProducts.isEmpty {
                        // Similar products grid
                        ScrollView {
                            LazyVGrid(columns: [
                                GridItem(.flexible()),
                                GridItem(.flexible())
                            ], spacing: 16) {
                                ForEach(viewModel.similarProducts) { product in
                                    ProductCard(product: product, imageSize: 140)
                                        .environmentObject(FavoritesManager())
                                }
                            }
                            .padding()
                        }
                    }
                    
                } else {
                    // Image picker prompt
                    VStack(spacing: 24) {
                        Image(systemName: "camera")
                            .font(.system(size: 48))
                            .foregroundColor(.gray)
                        
                        Text("Search for all outfits by taking a photo or uploading from gallery")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.gray)
                        
                        HStack(spacing: 16) {
                            // Take photo button
                            Button {
                                viewModel.showCamera = true
                            } label: {
                                HStack {
                                    Image(systemName: "camera.fill")
                                    Text("Take Photo")
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color.red)
                                .foregroundColor(.white)
                                .cornerRadius(25)
                            }
                            
                            // Upload photo button
                            Button {
                                viewModel.showPhotoPicker = true
                            } label: {
                                HStack {
                                    Image(systemName: "photo.fill")
                                    Text("Upload")
                                }
                                .frame(maxWidth: .infinity)
                                .frame(height: 50)
                                .background(Color(.systemGray6))
                                .foregroundColor(.primary)
                                .cornerRadius(25)
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding()
                }
                
                Spacer()
            }
            .navigationTitle("Visual Search")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $viewModel.showCamera) {
                ImagePicker(sourceType: .camera, selectedImage: $viewModel.selectedImage)
            }
            .sheet(isPresented: $viewModel.showPhotoPicker) {
                ImagePicker(sourceType: .photoLibrary, selectedImage: $viewModel.selectedImage)
            }
            .onChange(of: viewModel.selectedImage) { _ in
                if viewModel.selectedImage != nil {
                    Task {
                        await viewModel.searchSimilarProducts()
                    }
                }
            }
        }
    }
}

struct ImagePicker: UIViewControllerRepresentable {
    let sourceType: UIImagePickerController.SourceType
    @Binding var selectedImage: UIImage?
    @Environment(\.dismiss) private var dismiss
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.sourceType = sourceType
        picker.delegate = context.coordinator
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.selectedImage = image
            }
            parent.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.dismiss()
        }
    }
} 
