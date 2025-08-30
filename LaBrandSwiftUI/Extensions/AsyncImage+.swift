//
//  AsyncImage.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

struct AsyncImageView<Placeholder: View>: View {
    let imageUrl: String?
    let contentMode: ContentMode
    let placeholder: Placeholder
    
    private let baseURL = Config.baseURLMedia

    init(imageUrl: String?, _ contentMode: ContentMode = .fill, @ViewBuilder placeholder: () -> Placeholder) {
        self.imageUrl = imageUrl
        self.contentMode = contentMode
        self.placeholder = placeholder()
    }
    
    var body: some View {
        if let urlString = imageUrl, let url = URL(string: baseURL + urlString) {
            AsyncImage(url: url) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: contentMode)
            } placeholder: {
                placeholder
            }
        } else {
            placeholder
        }
    }
}

#Preview {
    AsyncImageView(imageUrl: "https://i.postimg.cc/t4MZKRvK/premium-photo-1689371952452-c88c72464115.avif") {
        RoundedRectangle(cornerRadius: 20)
            .fill(.red)
            .frame(width: 100, height: 100)
    }
}
