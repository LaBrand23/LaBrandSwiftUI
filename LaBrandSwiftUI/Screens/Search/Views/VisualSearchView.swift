//
//  VisualSearchView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI
import PhotosUI

struct VisualSearchView: View {
    
    // MARK: - Properties
    @StateObject private var viewModel = VisualSearchViewModel()
    @Environment(\.dismiss) private var dismiss
    @State private var hasAppeared = false
    
    // MARK: - Body
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if let selectedImage = viewModel.selectedImage {
                    imagePreviewContent(selectedImage)
                } else {
                    imagePickerPrompt
                }
            }
            .background(AppColors.Background.primary)
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("VISUAL SEARCH")
                        .font(.custom("Georgia", size: 18))
                        .fontWeight(.medium)
                        .tracking(4)
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundStyle(AppColors.Text.primary)
                    }
                }
            }
            .sheet(isPresented: $viewModel.showCamera) {
                ImagePicker(sourceType: .camera, selectedImage: $viewModel.selectedImage)
            }
            .sheet(isPresented: $viewModel.showPhotoPicker) {
                ImagePicker(sourceType: .photoLibrary, selectedImage: $viewModel.selectedImage)
            }
            .onChange(of: viewModel.selectedImage) { _, _ in
                if viewModel.selectedImage != nil {
                    Task {
                        await viewModel.searchSimilarProducts()
                    }
                }
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                hasAppeared = true
            }
        }
    }
}

// MARK: - Subviews
private extension VisualSearchView {
    
    func imagePreviewContent(_ image: UIImage) -> some View {
        VStack(spacing: 24) {
            // Image Preview
            ZStack(alignment: .topTrailing) {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(height: 280)
                    .clipShape(RoundedRectangle(cornerRadius: 4))
                
                Button {
                    viewModel.selectedImage = nil
                    viewModel.similarProducts = []
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 24))
                        .foregroundStyle(.white)
                        .shadow(radius: 4)
                }
                .padding(12)
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
            
            // Results
            if viewModel.isSearching {
                VStack(spacing: 16) {
                    ProgressView()
                        .tint(AppColors.Accent.gold)
                    Text("Finding similar items...")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.Text.tertiary)
                }
                .frame(maxHeight: .infinity)
            } else if !viewModel.similarProducts.isEmpty {
                VStack(alignment: .leading, spacing: 16) {
                    Text("SIMILAR ITEMS")
                        .font(.system(size: 12, weight: .semibold))
                        .tracking(2)
                        .foregroundStyle(AppColors.Text.tertiary)
                        .padding(.horizontal, 20)
                    
                    ScrollView(showsIndicators: false) {
                        LazyVGrid(
                            columns: [
                                GridItem(.flexible(), spacing: 16),
                                GridItem(.flexible(), spacing: 16)
                            ],
                            spacing: 20
                        ) {
                            ForEach(viewModel.similarProducts) { product in
                                ProductCard(product: product, imageSize: 160)
                            }
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 20)
                    }
                }
            } else {
                Spacer()
            }
        }
    }
    
    var imagePickerPrompt: some View {
        VStack(spacing: 32) {
            Spacer()
            
            // Icon
            ZStack {
                Circle()
                    .stroke(AppColors.Border.primary, lineWidth: 1)
                    .frame(width: 120, height: 120)
                
                Image(systemName: "camera.viewfinder")
                    .font(.system(size: 40))
                    .foregroundStyle(AppColors.Text.muted)
            }
            .opacity(hasAppeared ? 1 : 0)
            .scaleEffect(hasAppeared ? 1 : 0.8)
            .animation(.easeOut(duration: 0.5).delay(0.1), value: hasAppeared)
            
            // Text
            VStack(spacing: 8) {
                Text("Search with Photo")
                    .font(.custom("Georgia", size: 22))
                    .foregroundStyle(AppColors.Text.primary)
                
                Text("Take a photo or upload from your gallery\nto find similar items")
                    .font(.system(size: 14))
                    .foregroundStyle(AppColors.Text.tertiary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
            .opacity(hasAppeared ? 1 : 0)
            .offset(y: hasAppeared ? 0 : 20)
            .animation(.easeOut(duration: 0.5).delay(0.2), value: hasAppeared)
            
            // Buttons
            VStack(spacing: 12) {
                // Take Photo
                Button {
                    viewModel.showCamera = true
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 14))
                        Text("TAKE PHOTO")
                            .font(.system(size: 14, weight: .semibold))
                            .tracking(2)
                    }
                    .foregroundStyle(AppColors.Button.primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(AppColors.Button.primaryBackground)
                }
                
                // Upload
                Button {
                    viewModel.showPhotoPicker = true
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "photo.fill")
                            .font(.system(size: 14))
                        Text("UPLOAD FROM GALLERY")
                            .font(.system(size: 14, weight: .semibold))
                            .tracking(2)
                    }
                    .foregroundStyle(AppColors.Text.primary)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(
                        RoundedRectangle(cornerRadius: 0)
                            .stroke(AppColors.Border.primary, lineWidth: 1)
                    )
                }
            }
            .padding(.horizontal, 40)
            .opacity(hasAppeared ? 1 : 0)
            .offset(y: hasAppeared ? 0 : 20)
            .animation(.easeOut(duration: 0.5).delay(0.3), value: hasAppeared)
            
            Spacer()
        }
    }
}

// MARK: - Image Picker
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

// MARK: - Preview
#Preview {
    VisualSearchView()
}
