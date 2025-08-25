//
//  CategoryCard.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

// TODO: - Need to remove
import SwiftUI

extension HomeView {
    
    struct CategoryCard: View {
        let category: Category
        
        var body: some View {
            VStack {
                AsyncImage(url: URL(string: category.image)) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } placeholder: {
                    Image(category.name)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .padding(15)
                        .background(.gray.opacity(0.2))
                        
                }
                .frame(width: 80, height: 80)
                .clipShape(Circle())
                
                Text(category.name)
                    .font(.caption)
                    .foregroundStyle(.black)
                    .multilineTextAlignment(.center)
            }
            .frame(width: 100)
        }
    }
}
