//
//  CustomSegmentedControl.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct CustomSegmentedControl: View {
    
    @Binding var selectedIndex: Int
    var segments: [String] = ["Women", "Men", "Kids"]
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(segments.indices, id: \.self) { index in
                Button {
                    withAnimation(.spring(response: 0.4)) {
                        selectedIndex = index
                    }
                } label: {
                    VStack(spacing: 8) {
                        Text(segments[index].uppercased())
                            .font(.system(size: 13, weight: .semibold))
                            .tracking(2)
                            .foregroundStyle(selectedIndex == index ? AppColors.Text.primary : AppColors.Text.muted)
                        
                        Rectangle()
                            .fill(selectedIndex == index ? AppColors.Accent.gold : Color.clear)
                            .frame(height: 2)
                    }
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.top, 8)
        .background(AppColors.Background.surface)
    }
}

#Preview {
    CustomSegmentedControl(selectedIndex: .constant(0))
}
