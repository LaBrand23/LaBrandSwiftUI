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
    
    init(imageUrl: String?, _ contentMode: ContentMode = .fill, @ViewBuilder placeholder: () -> Placeholder) {
        self.imageUrl = imageUrl
        self.contentMode = contentMode
        self.placeholder = placeholder()
    }
    
    var body: some View {
        if let urlString = imageUrl, let url = URL(string: urlString) {
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
