import SwiftUI

struct CategoriesView: View {
    
    // MARK: - PROPERTIES
    @Environment(\.tabSelection) private var tabSelection
    @StateObject private var viewModel = CategoriesViewModel()
    @State private var selectedCategoryIndex = 0
    @State private var scrollPosition: Int? = nil
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                
                // Main Category Segment [Men, Women, Kids]
                CustomSegmentedControl(selectedIndex: $selectedCategoryIndex)
                
                ScrollView(.horizontal) {
                    HStack(spacing: 0) {
                        ForEach(0..<viewModel.categories.count, id: \.self) { index in
                            
                            ScrollView {
                                VStack(spacing: 16) {
                                    
                                    bannerButtonUI {
                                        // TODO: - Open Banned Deep link
                                    }
                                    
                                    // Categories list
                                    ForEach(viewModel.categories) { category in
                                        NavigationLink(destination: CategoryDetailView(category: category)) {
                                            CategoryCard(category: category)
                                        }
                                    }
                                }
                                .padding(.top, 10)
                                .padding(.horizontal)
                            }
                            .id(index)
//                            .frame(width: UIScreen.screenWidth)
                            .containerRelativeFrame(.horizontal)
                            
                        }
                    }
                }
                .scrollTargetLayout()
                .scrollTargetBehavior(.viewAligned)
//                .scrollBounceBehavior(.basedOnSize)
                .scrollPosition(id: $scrollPosition, anchor: .center)
                .animation(.smooth, value: scrollPosition)
                .onChange(of: selectedCategoryIndex) { old, new in
                    self.scrollPosition = new
                }
                .onChange(of: self.scrollPosition) { old, new in
                    guard let new else { return }
                    withAnimation(.easeInOut(duration: 0.2)) { // Smooth animation
                        self.selectedCategoryIndex = new
                    }
                }
                
            }
            .navigationTitle("Categories")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        // Search action
                    } label: {
                        Image(systemName: "magnifyingglass")
                            .tint(.black)
                            .fontWeight(.semibold)
                    }
                }
                
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        tabSelection.wrappedValue = TabBarTag.home
                    } label: {
                        Image(systemName: "chevron.left")
                            .tint(.black)
                            .fontWeight(.semibold)
                    }
                }
            }
        }
    }
}

// MARK: - UI
private extension CategoriesView {
    
    func bannerButtonUI(_ action: @escaping ()->Void) -> some View {
        Button {
            action()
        } label : {
            // Summer Sales Banner
            ZStack {
                Rectangle()
                    .fill(Color.red)
                    .frame(height: 100)
                    .cornerRadius(12)
                
                VStack {
                    Text("SUMMER SALES")
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text("Up to 50% off!")
                        .foregroundColor(.white)
                }
            }
        }
    }
    
//    func categoryCardButton(category: Category, _ action: @escaping ()-> Void) -> some View {
//        Button(action: action) {
//            CategoryCard(category: category)
//        }
//    }
    
}

#Preview {
    CategoriesView()
}
