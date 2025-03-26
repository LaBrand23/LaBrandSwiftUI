//
//  CustomSegmentedControl.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//


import SwiftUI

struct CustomSegmentedControl: View {
    
    // MatchedGeometryEffect Namespace
    @Namespace private var animation
    
    let categories = ["Women", "Men", "Kids"]
    @Binding var selectedIndex: Int
    
    var body: some View {
        VStack {
            HStack {
                ForEach(0..<categories.count, id: \.self) { index in
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.3)) { // Smooth animation
                            selectedIndex = index
                        }
                    }) {
                        VStack {
                            Text(categories[index])
                                .font(.system(size: 18, weight: selectedIndex == index ? .bold : .regular))
                                .foregroundColor(.black)
//                                .animation(nil)
                                
                            // Bottom Indicator (Only for selected tab)
                            if selectedIndex == index {
                                Rectangle()
                                    .fill(Color.red)
                                    .frame(height: 3)
                                    .matchedGeometryEffect(id: "underline", in: animation)
                            } else {
                                Rectangle()
                                    .fill(Color.clear)
                                    .frame(height: 3)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            .padding(.top, 10)
        }
        .padding(.horizontal)
        .background(Color.white)
        .compositingGroup()
        .shadow(color: .gray.opacity(0.1), radius: 3, y: 4)
    }
    
    
}

#Preview {
    @Previewable @State var selectedIndex = 0
    CustomSegmentedControl(selectedIndex: $selectedIndex)
}
