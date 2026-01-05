//
//  AddReviewView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI
import PhotosUI

struct AddReviewView: View {
    
    // MARK: - Properties
    let product: Product
    @StateObject private var viewModel = AddReviewViewModel()
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var productDetailViewModel: ProductDetailViewModel
    
    // MARK: - Body
    var body: some View {
        NavigationView {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 32) {
                    // Rating Section
                    ratingSection
                    
                    // Comment Section
                    commentSection
                    
                    // Photos Section
                    photosSection
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 24)
            }
            .background(AppColors.Background.primary)
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("WRITE A REVIEW")
                        .font(.custom("Georgia", size: 18))
                        .fontWeight(.medium)
                        .tracking(3)
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
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        Task {
                            await viewModel.submitReview(for: product)
                            dismiss()
                        }
                    } label: {
                        Text("Submit")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(viewModel.isValid ? AppColors.Accent.gold : AppColors.Text.muted)
                    }
                    .disabled(!viewModel.isValid)
                }
            }
            .sheet(isPresented: $viewModel.showPhotoPicker) {
                PhotoPicker(selectedPhotos: $viewModel.selectedPhotos)
            }
            .alert("Review Submitted", isPresented: $viewModel.showSuccessAlert) {
                Button("OK") { dismiss() }
            } message: {
                Text("Thank you for your review!")
            }
            .alert("Error", isPresented: $viewModel.showErrorAlert) {
                Button("OK", role: .cancel) { }
            } message: {
                Text(viewModel.errorMessage)
            }
        }
    }
}

// MARK: - Sections
private extension AddReviewView {
    
    var ratingSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("WHAT IS YOUR RATING?")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            HStack(spacing: 16) {
                ForEach(1...5, id: \.self) { rating in
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            viewModel.rating = rating
                        }
                    } label: {
                        Image(systemName: rating <= viewModel.rating ? "star.fill" : "star")
                            .font(.system(size: 28))
                            .foregroundStyle(rating <= viewModel.rating ? AppColors.Accent.gold : AppColors.Border.primary)
                            .scaleEffect(rating <= viewModel.rating ? 1.1 : 1.0)
                    }
                }
            }
            .frame(maxWidth: .infinity, alignment: .center)
            .padding(.vertical, 20)
            .background(AppColors.Background.surface)
            .clipShape(RoundedRectangle(cornerRadius: 4))
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(AppColors.Border.subtle, lineWidth: 1)
            )
        }
    }
    
    var commentSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("SHARE YOUR OPINION")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            ZStack(alignment: .topLeading) {
                if viewModel.comment.isEmpty {
                    Text("Tell us about your experience with this product...")
                        .font(.system(size: 15))
                        .foregroundStyle(AppColors.Text.muted)
                        .padding(.horizontal, 16)
                        .padding(.top, 16)
                }
                
                TextEditor(text: $viewModel.comment)
                    .font(.system(size: 15))
                    .foregroundStyle(AppColors.Text.primary)
                    .scrollContentBackground(.hidden)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 12)
            }
            .frame(height: 140)
            .background(AppColors.Background.secondary)
            .clipShape(RoundedRectangle(cornerRadius: 4))
        }
    }
    
    var photosSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("ADD PHOTOS (OPTIONAL)")
                .font(.system(size: 12, weight: .semibold))
                .tracking(2)
                .foregroundStyle(AppColors.Text.tertiary)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    // Add Photo Button
                    Button {
                        viewModel.showPhotoPicker = true
                    } label: {
                        VStack(spacing: 8) {
                            Image(systemName: "camera")
                                .font(.system(size: 24))
                                .foregroundStyle(AppColors.Text.muted)
                            
                            Text("Add photo")
                                .font(.system(size: 11))
                                .foregroundStyle(AppColors.Text.tertiary)
                        }
                        .frame(width: 80, height: 80)
                        .background(AppColors.Background.secondary)
                        .clipShape(RoundedRectangle(cornerRadius: 4))
                        .overlay(
                            RoundedRectangle(cornerRadius: 4)
                                .stroke(AppColors.Border.primary, style: StrokeStyle(lineWidth: 1, dash: [5]))
                        )
                    }
                    
                    // Selected Photos
                    ForEach(viewModel.selectedPhotos.indices, id: \.self) { index in
                        ZStack(alignment: .topTrailing) {
                            Image(uiImage: viewModel.selectedPhotos[index])
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 80, height: 80)
                                .clipShape(RoundedRectangle(cornerRadius: 4))
                            
                            Button {
                                viewModel.selectedPhotos.remove(at: index)
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 20))
                                    .foregroundStyle(.white)
                                    .shadow(radius: 2)
                            }
                            .offset(x: 8, y: -8)
                        }
                    }
                }
            }
        }
    }
}

// MARK: - Photo Picker
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
                result.itemProvider.loadObject(ofClass: UIImage.self) { image, _ in
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

// MARK: - ViewModel
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

// MARK: - Preview
#Preview {
    AddReviewView(product: .mockProducts.first!)
        .environmentObject(ProductDetailViewModel())
}
