//
//  AsyncImage.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//

import SwiftUI

extension View {
    func asyncImage(_ urlString: String, usePlaceholder: Bool = true) -> some View {
        AsyncImage(url: URL(string: urlString)) { image in
            image
                .resizable()
                .aspectRatio(contentMode: .fill)
        } placeholder: {
            if usePlaceholder {
                Image(urlString)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                Color.clear
            }
        }
        .frame(maxWidth: .infinity)
    }
}
