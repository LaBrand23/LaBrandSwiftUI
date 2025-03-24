import SwiftUI

struct CategoriesView: View {
    @StateObject private var viewModel = CategoriesViewModel()
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 16) {
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
                    .padding(.horizontal)
                    
                    // Main Categories
                    HStack {
                        ForEach(viewModel.mainCategories, id: \.name) { category in
                            Button {
                                viewModel.selectedMainCategory = category
                            } label: {
                                Text(category.name)
                                    .fontWeight(viewModel.selectedMainCategory == category ? .semibold : .regular)
                                    .foregroundColor(viewModel.selectedMainCategory == category ? .black : .gray)
                                    .padding(.bottom, 8)
                                    .overlay(
                                        Rectangle()
                                            .frame(height: 2)
                                            .foregroundColor(viewModel.selectedMainCategory == category ? .red : .clear)
                                            .offset(y: 4),
                                        alignment: .bottom
                                    )
                            }
                            if category != viewModel.mainCategories.last {
                                Spacer()
                            }
                        }
                    }
                    .padding(.horizontal)
                    
                    // Categories Grid
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        ForEach(viewModel.categories) { category in
                            NavigationLink(destination: CategoryDetailView(category: category)) {
                                CategoryCard(category: category)
                            }
                        }
                    }
                    .padding(.horizontal)
                }
            }
            .navigationTitle("Categories")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        // Search action
                    } label: {
                        Image(systemName: "magnifyingglass")
                    }
                }
            }
        }
    }
}

struct CategoryCard: View {
    let category: Category
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            AsyncImage(url: URL(string: category.image)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .foregroundColor(Color(.systemGray6))
            }
            .frame(height: 160)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            
            Text(category.name)
                .font(.headline)
                .foregroundColor(.primary)
        }
    }
}

struct CategoryDetailView: View {
    let category: Category
    @StateObject private var viewModel = CategoryDetailViewModel()
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // View All Items Button
                Button {
                    viewModel.showAllItems = true
                } label: {
                    Text("VIEW ALL ITEMS")
                        .fontWeight(.semibold)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.red)
                        .foregroundColor(.white)
                        .cornerRadius(25)
                }
                .padding(.horizontal)
                
                // Subcategories List
                VStack(alignment: .leading, spacing: 12) {
                    ForEach(category.subcategories ?? []) { subcategory in
                        NavigationLink(destination: ProductListView(category: subcategory)) {
                            HStack {
                                Text(subcategory.name)
                                    .foregroundColor(.primary)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.gray)
                            }
                            .padding(.vertical, 8)
                        }
                        Divider()
                    }
                }
                .padding(.horizontal)
            }
        }
        .navigationTitle(category.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

class CategoriesViewModel: ObservableObject {
    @Published var categories: [Category] = []
    @Published var mainCategories = [
        MainCategory(name: "Women"),
        MainCategory(name: "Men"),
        MainCategory(name: "Kids")
    ]
    @Published var selectedMainCategory: MainCategory!
    
    init() {
        selectedMainCategory = mainCategories[0]
        loadCategories()
    }
    
    private func loadCategories() {
        // Mock categories data
        categories = [
            Category(
                id: UUID(),
                name: "Clothes",
                image: "clothes_category",
                parentCategoryID: nil,
                subcategories: [
                    Category(id: UUID(), name: "Tops", image: "tops", parentCategoryID: nil, subcategories: nil),
                    Category(id: UUID(), name: "Dresses", image: "dresses", parentCategoryID: nil, subcategories: nil),
                    Category(id: UUID(), name: "Pants", image: "pants", parentCategoryID: nil, subcategories: nil)
                ]
            ),
            Category(
                id: UUID(),
                name: "Shoes",
                image: "shoes_category",
                parentCategoryID: nil,
                subcategories: [
                    Category(id: UUID(), name: "Sneakers", image: "sneakers", parentCategoryID: nil, subcategories: nil),
                    Category(id: UUID(), name: "Boots", image: "boots", parentCategoryID: nil, subcategories: nil)
                ]
            ),
            Category(
                id: UUID(),
                name: "Accessories",
                image: "accessories_category",
                parentCategoryID: nil,
                subcategories: [
                    Category(id: UUID(), name: "Bags", image: "bags", parentCategoryID: nil, subcategories: nil),
                    Category(id: UUID(), name: "Jewelry", image: "jewelry", parentCategoryID: nil, subcategories: nil)
                ]
            )
        ]
    }
}

class CategoryDetailViewModel: ObservableObject {
    @Published var showAllItems = false
}

struct MainCategory: Equatable {
    let name: String
} 
