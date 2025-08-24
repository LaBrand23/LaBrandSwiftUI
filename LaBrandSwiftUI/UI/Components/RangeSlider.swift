//
//  RangeSlider.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//

import SwiftUI

struct RangeSlider: View {
    @Binding var value: ClosedRange<Double>
    let bounds: ClosedRange<Double>
    let step: Double
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                // Track
                Rectangle()
                    .fill(Color(.systemGray5))
                    .frame(height: 4)
                
                // Selected Range
                Rectangle()
                    .fill(Color.red)
                    .frame(width: width(for: value, in: geometry), height: 4)
                    .offset(x: position(for: value.lowerBound, in: geometry))
                
                // Lower Thumb
                Circle()
                    .fill(.white)
                    .frame(width: 24, height: 24)
                    .shadow(radius: 4)
                    .offset(x: position(for: value.lowerBound, in: geometry) - 12)
                    .gesture(
                        DragGesture()
                            .onChanged { gesture in
                                updateLowerBound(gesture: gesture, in: geometry)
                            }
                    )
                
                // Upper Thumb
                Circle()
                    .fill(.white)
                    .frame(width: 24, height: 24)
                    .shadow(radius: 4)
                    .offset(x: position(for: value.upperBound, in: geometry) - 12)
                    .gesture(
                        DragGesture()
                            .onChanged { gesture in
                                updateUpperBound(gesture: gesture, in: geometry)
                            }
                    )
            }
        }
        .frame(height: 24)
    }
    
    private func position(for value: Double, in geometry: GeometryProxy) -> CGFloat {
        let range = bounds.upperBound - bounds.lowerBound
        let percentage = (value - bounds.lowerBound) / range
        return percentage * geometry.size.width
    }
    
    private func width(for range: ClosedRange<Double>, in geometry: GeometryProxy) -> CGFloat {
        position(for: range.upperBound, in: geometry) - position(for: range.lowerBound, in: geometry)
    }
    
    private func updateLowerBound(gesture: DragGesture.Value, in geometry: GeometryProxy) {
        let width = geometry.size.width
        let percentage = max(0, min(gesture.location.x / width, 1))
        let range = bounds.upperBound - bounds.lowerBound
        let newValue = bounds.lowerBound + range * percentage
        let steppedValue = round(newValue / step) * step
        
        if steppedValue < value.upperBound {
            value = steppedValue...value.upperBound
        }
    }
    
    private func updateUpperBound(gesture: DragGesture.Value, in geometry: GeometryProxy) {
        let width = geometry.size.width
        let percentage = max(0, min(gesture.location.x / width, 1))
        let range = bounds.upperBound - bounds.lowerBound
        let newValue = bounds.lowerBound + range * percentage
        let steppedValue = round(newValue / step) * step
        
        if steppedValue > value.lowerBound {
            value = value.lowerBound...steppedValue
        }
    }
}

#Preview {
    RangeSlider(value: .constant(10.0...500.0), bounds: 0...10000, step: 500)
}
