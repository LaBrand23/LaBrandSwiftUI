//
//  ProductImageGallery.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct ProductImageGallery: View {
    let images: [String]
    @Binding var selectedImageIndex: Int
    let onImageTap: (String) -> Void
    
    var body: some View {
        VStack(spacing: 12) {
            // Main Image Carousel
            TabView(selection: $selectedImageIndex) {
                ForEach(Array(images.enumerated()), id: \.offset) { index, imageUrl in
                    AsyncImageView(imageUrl: imageUrl) {
                        Rectangle()
                            .foregroundColor(Color(.systemGray6))
                    }
                    .onTapGesture {
                        onImageTap(imageUrl)
                    }
                    .tag(index)
                }
            }
            .frame(height: UIScreen.screenHeight/2.5)
            .tabViewStyle(.page(indexDisplayMode: .never))
            
            // Thumbnail Strip
            if images.count > 1 {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(images.enumerated()), id: \.offset) { index, imageUrl in
                            AsyncImageView(imageUrl: imageUrl) {
                                Rectangle()
                                    .foregroundColor(Color(.systemGray6))
                            }
                            .frame(width: 60, height: 60)
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .strokeBorder(
                                        selectedImageIndex == index ? Color.red : Color.clear,
                                        lineWidth: 2
                                    )
                            )
                            .onTapGesture {
                                withAnimation(.easeInOut(duration: 0.3)) {
                                    selectedImageIndex = index
                                }
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
            
            // Page Indicator
            if images.count > 1 {
                HStack(spacing: 6) {
                    ForEach(0..<images.count, id: \.self) { index in
                        Circle()
                            .fill(selectedImageIndex == index ? Color.red : Color.gray.opacity(0.3))
                            .frame(width: 6, height: 6)
                    }
                }
                .padding(.top, 4)
            }
        }
    }
}

#Preview {
    ProductImageGallery(
        images: [
            "https://unsplash.com/photos/a-woman-in-white-shirt-and-jeans-posing-for-a-picture-0HQzYawVQSY",
            "https://unsplash.com/photos/a-woman-in-white-shirt-and-jeans-posing-for-a-picture-0HQzYawVQSY",
            "https://unsplash.com/photos/a-woman-in-white-shirt-and-jeans-posing-for-a-picture-0HQzYawVQSY"
        ],
        selectedImageIndex: .constant(0),
        onImageTap: { _ in }
    )
}
