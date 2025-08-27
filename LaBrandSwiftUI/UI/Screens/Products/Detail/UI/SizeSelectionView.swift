//
//  SizeSelectionView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct SizeSelectionView: View {
    let sizes: [String]
    @Binding var selectedSize: String?
    let onSizeGuideTap: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Select size")
                    .font(.headline)
                
                Spacer()
                
                Button("Size guide") {
                    onSizeGuideTap()
                }
                .font(.caption)
                .foregroundColor(.red)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    ForEach(sizes, id: \.self) { size in
                        SizeButton(
                            size: size,
                            isSelected: selectedSize == size,
                            action: { selectedSize = size }
                        )
                    }
                }
            }
        }
    }
}

#Preview {
    SizeSelectionView(
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "L", "XL", "XXL"],
        selectedSize: .constant("M"),
        onSizeGuideTap: {}
    )
    .padding()
}
