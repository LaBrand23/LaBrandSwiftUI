import SwiftUI

struct CategoriesView: View {
    // MARK: - PROPERTIES
    @Environment(\.tabSelection) private var tabSelection
    @StateObject private var viewModel = CategoriesViewModel()
    @State private var selectedCategoryIndex = 0
    
    // Computed property to get filtered categories based on selected segment
    private var filteredCategories: [Category] {
        // For now, return all categories since we don't have gender-specific filtering
        // In the future, this could filter based on the selected segment
        return viewModel.categories
    }
    
    var body: some View {
        VStack(spacing: 0) {
            // Main Category Segment [Men, Women, Kids]
            CustomSegmentedControl(selectedIndex: $selectedCategoryIndex)
            
            if viewModel.isLoading {
                Spacer()
                ProgressView("Loading categories...")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                Spacer()
            } else if let error = viewModel.error {
                Spacer()
                VStack {
                    Text("Error loading categories")
                        .foregroundColor(.red)
                    Text(error.localizedDescription)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                    Button("Retry") {
                        Task {
                            await viewModel.loadCategories()
                        }
                    }
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                Spacer()
            } else {
                // Horizontal Pagable Content
                TabView(selection: $selectedCategoryIndex) {
                    // Women's Categories
                    CategoryContentView(
                        title: "Women's Categories",
                        categories: getCategoriesForSegment(0),
                        bannerTitle: "WOMEN'S SUMMER SALE",
                        bannerSubtitle: "Up to 50% off!"
                    )
                    .tag(0)
                    
                    // Men's Categories
                    CategoryContentView(
                        title: "Men's Categories",
                        categories: getCategoriesForSegment(1),
                        bannerTitle: "MEN'S SUMMER SALE",
                        bannerSubtitle: "Up to 50% off!"
                    )
                    .tag(1)
                    
                    // Kids' Categories
                    CategoryContentView(
                        title: "Kids' Categories",
                        categories: getCategoriesForSegment(2),
                        bannerTitle: "KIDS' SUMMER SALE",
                        bannerSubtitle: "Up to 50% off!"
                    )
                    .tag(2)
                }
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                .animation(.easeInOut(duration: 0.3), value: selectedCategoryIndex)
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
    
    // Helper function to get categories for each segment
    private func getCategoriesForSegment(_ index: Int) -> [Category] {
        // For now, return all categories for each segment
        // In the future, this could filter based on gender/category type
        return viewModel.categories
    }
}

// MARK: - Category Content View
struct CategoryContentView: View {
    let title: String
    let categories: [Category]
    let bannerTitle: String
    let bannerSubtitle: String
    
    var body: some View {
        ScrollView {
            LazyVStack(spacing: 16) {
                // Banner Section
                bannerButtonUI(title: bannerTitle, subtitle: bannerSubtitle) {
                    // TODO: - Open Banned Deep link
                }
                .padding(.horizontal)
                
                // Categories Grid
                if categories.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "folder")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                        Text("No categories found")
                            .font(.headline)
                            .foregroundColor(.gray)
                        Text("Try selecting a different category")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding(.vertical, 50)
                } else {
                    LazyVGrid(
                        columns: [
                            GridItem(.flexible(), spacing: 16)
                        ],
                        spacing: 16
                    ) {
                        ForEach(categories) { category in
                            NavigationLink(destination: CategoryDetailView(category: category)) {
                                CategoryCard(category: category)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                
                // Bottom spacing for tab bar
                Spacer(minLength: 120)
            }
            .padding(.vertical, 10)
        }
        .scrollIndicators(.hidden)
        .safeAreaInset(edge: .bottom) {
            Color.clear.frame(height: 0)
        }
    }
    
    // MARK: - UI
    func bannerButtonUI(title: String, subtitle: String, action: @escaping ()->Void) -> some View {
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
                    Text(title)
                        .font(.title3)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    Text(subtitle)
                        .foregroundColor(.white)
                }
            }
        }
    }
}

#Preview {
    CategoriesView()
}
