import SwiftUI

struct CategoriesView: View {
    var body: some View {
        NavigationView {
            ScrollView {
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 16) {
                    // TODO: Implement categories grid
                    Text("Categories Coming Soon")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color(.systemGray6))
                        .cornerRadius(12)
                }
                .padding()
            }
            .navigationTitle("Categories")
        }
    }
} 