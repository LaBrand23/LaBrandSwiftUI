import SwiftUI

struct ImageFullScreenView: View {
    let imageUrl: String
    @Environment(\.dismiss) private var dismiss
    @State private var scale: CGFloat = 1.0
    @State private var lastScale: CGFloat = 1.0
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero
    @State private var opacity: Double = 1.0
    
    var body: some View {
        ZStack(alignment: .topLeading) {
//            Color.black.edgesIgnoringSafeArea(.all)
            
            AsyncImageView(imageUrl: imageUrl, .fit, placeholder: {})
                .scaleEffect(scale)
                .offset(y: offset.height)
                .gesture(
                    // Pinch to Zoom Gesture
                    MagnificationGesture()
                        .onChanged { value in
                            scale = value.magnitude
                        }
                        .onEnded { _ in
                            withAnimation {
                                scale = 1.0
                            }
                        }
                )
            
            Button {
                dismiss()
            } label: {
                Image(systemName: "xmark")
                    .font(.title2)
                    .foregroundColor(.blue)
                    .padding()
                    .background(
                        Circle()
                            .fill(.white.opacity(0.5))
                    )
                    .padding()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
        }
    }
}

#Preview {
    ImageFullScreenView(imageUrl: BagItem.sampleItems.first!.product.images.first!)
}
