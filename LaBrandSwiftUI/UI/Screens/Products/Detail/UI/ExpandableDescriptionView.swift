//
//  ExpandableDescriptionView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct ExpandableDescriptionView: View {
    let description: String
    @Binding var isExpanded: Bool
    let maxLines: Int = 3
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Description")
                .font(.headline)
//                .padding(.horizontal)
            
            VStack(alignment: .leading, spacing: 8) {
                Text(description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineLimit(isExpanded ? nil : maxLines)
                    .animation(.easeInOut(duration: 0.3), value: isExpanded)
                
                Button(action: {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        isExpanded.toggle()
                    }
                }) {
                    Text(isExpanded ? "Read less" : "Read more")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.red)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

#Preview {
    VStack {
        ExpandableDescriptionView(
            description: "This is a very long description that demonstrates the expandable functionality. It contains multiple sentences and should be long enough to trigger the line limit. The text will be truncated initially and can be expanded by tapping the 'Read more' button. This creates a cleaner, more organized layout while still providing access to all the information.",
            isExpanded: .constant(false)
        )
        
        Divider()
        
        ExpandableDescriptionView(
            description: "This is a very long description that demonstrates the expandable functionality. It contains multiple sentences and should be long enough to trigger the line limit. The text will be truncated initially and can be expanded by tapping the 'Read more' button. This creates a cleaner, more organized layout while still providing access to all the information.",
            isExpanded: .constant(true)
        )
    }
//    .padding()
}
