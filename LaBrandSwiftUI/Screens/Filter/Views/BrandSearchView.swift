import SwiftUI

struct BrandSearchView: View {
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = BrandSearchViewModel()
    @Binding var selectedBrands: Set<Brand>
    
    var body: some View {
        NavigationView {
            ZStack {
                VStack(spacing: 0) {
                    if viewModel.error != nil {
                        // Error View
                        VStack(spacing: 16) {
                            Image(systemName: "exclamationmark.triangle")
                                .font(.largeTitle)
                                .foregroundColor(.red)
                            Text("Failed to load brands")
                                .font(.headline)
                            Button("Try Again") {
                                viewModel.fetchBrands()
                            }
                            .foregroundColor(.red)
                        }
                        .frame(maxHeight: .infinity)
                    } else {
                        // Brands List
                        ScrollView {
                            LazyVStack(spacing: 0) {
                                ForEach(viewModel.filteredBrands) { brand in
                                    BrandRow(
                                        brand: brand,
                                        isSelected: selectedBrands.contains(brand)
                                    ) {
                                        if selectedBrands.contains(brand) {
                                            selectedBrands.remove(brand)
                                        } else {
                                            selectedBrands.insert(brand)
                                        }
                                    }
                                    Divider()
                                        .padding(.leading)
                                }
                            }
                        }
                    }
                }
                
                if viewModel.isLoading {
                    // Loading View
                    ProgressView()
                        .scaleEffect(1.5)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color.black.opacity(0.1))
                }
            }
            .navigationTitle("Brand")
            .navigationBarTitleDisplayMode(.inline)
            .searchable(
                text: $viewModel.searchQuery,
                placement: .automatic,
                prompt: "Search brands"
            )
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "chevron.left")
                            .foregroundColor(.black)
                    }
                }
            }
            .safeAreaInset(edge: .bottom) {
                // Bottom Buttons
                HStack(spacing: 16) {
                    
                    Button {
                        dismiss()
                    } label: {
                        Text("Discard")
                            .foregroundStyle(.black)
                            .frame(maxWidth: .infinity)
                            .frame(height: 36)
                            .background(
                                Capsule()
                                    .stroke(Color.black, lineWidth: 1)
                            )
                    }
                    
                    Button {
                        dismiss()
                    } label: {
                        Text("Apply")
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 36)
                            .background(Color.red)
                            .clipShape(Capsule())
                    }
                    
                }
                .padding(.horizontal)
                .frame(height: 70)
                .background {
                    Rectangle()
                        .fill(.white)
                        .shadow(color: .gray.opacity(0.5), radius: 5)
                        .ignoresSafeArea()
                }
            }
        }
        .onAppear {
            viewModel.fetchBrands()
        }
    }
}



#Preview {
    @State var selectedBrands: Set<Brand> = []
    BrandSearchView(selectedBrands: $selectedBrands)
}
