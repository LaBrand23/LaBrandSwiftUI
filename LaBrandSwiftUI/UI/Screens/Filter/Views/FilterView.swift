import SwiftUI

struct FilterView: View {
    @Binding var selectedPriceRange: ClosedRange<Double>
    @Binding var selectedColors: Set<String>
    @Binding var selectedSizes: Set<String>
    @Binding var selectedBrands: Set<Brand>
    @Binding var isPresented: Bool
    @State private var showingBrandSearch = false
    
    private let colors = ["Black", "White", "Red", "Blue", "Green", "Yellow"]
    private let sizes = ["XS", "S", "M", "L", "XL"]
    
    var body: some View {
        NavigationStack {
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
                            .buttonStyle(BorderlessButtonStyle())
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
                            .buttonStyle(BorderlessButtonStyle())
                        }
                    }
                }
                
                // Brands Section
                Section {
                    Button {
                        showingBrandSearch = true
                    } label: {
                        HStack {
                            Text("Brand")
                                .font(.headline)
                                .foregroundColor(.primary)
                            Spacer()
                            if !selectedBrands.isEmpty {
                                Text("\(selectedBrands.count) selected")
                                    .font(.subheadline)
                                    .foregroundColor(.gray)
                            }
                            Image(systemName: "chevron.right")
                                .foregroundColor(.gray)
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
            .sheet(isPresented: $showingBrandSearch) {
                BrandSearchView(selectedBrands: $selectedBrands)
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

#Preview {
    @State var mockSelectedPriceRange: ClosedRange<Double> = 10.0...500.0
    @State var mockSelectedColors: Set<String> = ["Red", "Blue", "Green"]
    @State var mockSelectedSizes: Set<String> = ["S", "M", "L"]
    @State var mockSelectedBrands: Set<Brand> = []
    @State var mockIsPresented: Bool = true

    FilterView(
        selectedPriceRange: $mockSelectedPriceRange,
        selectedColors: $mockSelectedColors,
        selectedSizes: $mockSelectedSizes,
        selectedBrands: $mockSelectedBrands,
        isPresented: $mockIsPresented
    )
}
