import SwiftUI

struct FilterView: View {
    @Binding var selectedPriceRange: ClosedRange<Double>
    @Binding var selectedColors: Set<String>
    @Binding var selectedSizes: Set<String>
    @Binding var selectedBrands: Set<String>
    @Binding var isPresented: Bool
    
    private let colors = ["Black", "White", "Red", "Blue", "Green", "Yellow"]
    private let sizes = ["XS", "S", "M", "L", "XL"]
    private let brands = ["Nike", "Adidas", "Puma", "New Balance", "Under Armour"]
    
    var body: some View {
        NavigationView {
            Form {
                // Price Range Section
                Section {
                    VStack(alignment: .leading) {
                        Text("Price Range")
                            .font(.headline)
                            .padding(.bottom, 8)
                        
                        HStack {
                            Text("$\(Int(selectedPriceRange.lowerBound))")
                            Spacer()
                            Text("$\(Int(selectedPriceRange.upperBound))")
                        }
                        .font(.subheadline)
                        
                        RangeSlider(
                            value: $selectedPriceRange,
                            bounds: 0...1000,
                            step: 10
                        )
                    }
                }
                
                // Colors Section
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Colors")
                            .font(.headline)
                        
                        FlowLayout(spacing: 8) {
                            ForEach(colors, id: \.self) { color in
                                ColorFilterChip(
                                    color: color,
                                    isSelected: selectedColors.contains(color),
                                    action: {
                                        if selectedColors.contains(color) {
                                            selectedColors.remove(color)
                                        } else {
                                            selectedColors.insert(color)
                                        }
                                    }
                                )
                            }
                        }
                    }
                }
                
                // Sizes Section
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Sizes")
                            .font(.headline)
                        
                        FlowLayout(spacing: 8) {
                            ForEach(sizes, id: \.self) { size in
                                SizeFilterChip(
                                    size: size,
                                    isSelected: selectedSizes.contains(size),
                                    action: {
                                        if selectedSizes.contains(size) {
                                            selectedSizes.remove(size)
                                        } else {
                                            selectedSizes.insert(size)
                                        }
                                    }
                                )
                            }
                        }
                    }
                }
                
                // Brands Section
                Section {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Brand")
                            .font(.headline)
                        
                        ForEach(brands, id: \.self) { brand in
                            Button {
                                if selectedBrands.contains(brand) {
                                    selectedBrands.remove(brand)
                                } else {
                                    selectedBrands.insert(brand)
                                }
                            } label: {
                                HStack {
                                    Text(brand)
                                        .foregroundColor(.primary)
                                    Spacer()
                                    if selectedBrands.contains(brand) {
                                        Image(systemName: "checkmark")
                                            .foregroundColor(.red)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Reset") {
                        resetFilters()
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Apply") {
                        isPresented = false
                    }
                }
            }
        }
    }
    
    private func resetFilters() {
        selectedPriceRange = 0...1000
        selectedColors.removeAll()
        selectedSizes.removeAll()
        selectedBrands.removeAll()
    }
}

struct ColorFilterChip: View {
    let color: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(color)
                .font(.subheadline)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(isSelected ? Color.red : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(20)
        }
    }
}

struct SizeFilterChip: View {
    let size: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(size)
                .font(.subheadline)
                .frame(width: 44, height: 44)
                .background(isSelected ? Color.red : Color(.systemGray6))
                .foregroundColor(isSelected ? .white : .primary)
                .cornerRadius(12)
        }
    }
}

struct FlowLayout: Layout {
    let spacing: CGFloat
    
    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var height: CGFloat = 0
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var currentRowHeight: CGFloat = 0
        
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            
            if currentX + size.width > maxWidth {
                currentX = 0
                currentY += currentRowHeight + spacing
                currentRowHeight = 0
            }
            
            currentX += size.width + spacing
            currentRowHeight = max(currentRowHeight, size.height)
        }
        
        height = currentY + currentRowHeight
        
        return CGSize(width: maxWidth, height: height)
    }
    
    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var currentX: CGFloat = bounds.minX
        var currentY: CGFloat = bounds.minY
        var currentRowHeight: CGFloat = 0
        
        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            
            if currentX + size.width > bounds.maxX {
                currentX = bounds.minX
                currentY += currentRowHeight + spacing
                currentRowHeight = 0
            }
            
            subview.place(
                at: CGPoint(x: currentX, y: currentY),
                proposal: ProposedViewSize(size)
            )
            
            currentX += size.width + spacing
            currentRowHeight = max(currentRowHeight, size.height)
        }
    }
}

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