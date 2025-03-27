import SwiftUI

struct BagItemView: View {
    let item: BagItem
    let onIncrement: () -> Void
    let onDecrement: () -> Void
    let onRemove: () -> Void
    
    var body: some View {
        HStack(spacing: 16) {
            // Product Image
            Image(item.image)
                .resizable()
                .aspectRatio(contentMode: .fill)
                .frame(width: UIScreen.screenWidth/3.3)
            
            VStack(alignment: .leading, spacing: 4) {
                // Product Name
                Text(item.name)
                    .font(.headline)
                
                // Size
                Text("Size: \(item.size)")
                    .font(.system(size: 12))
                    .foregroundColor(.gray)
                
                // Quantity Controls
                HStack {
                    Button(action: onIncrement) {
                        Image(systemName: "minus")
                            .foregroundStyle(.gray)
                            .fontWeight(.semibold)
                            .frame(width: 36, height: 36)
                            .background {
                                Circle()
                                    .fill(.white)
                                    .shadow(color: .gray.opacity(0.3), radius: 5, y: 5)
                            }
                    }
                    
                    Text("\(item.quantity)")
                        .frame(minWidth: 30)
                        .font(.headline)
                    
                    Button(action: onIncrement) {
                        Image(systemName: "plus")
                            .foregroundStyle(.gray)
                            .fontWeight(.semibold)
                            .frame(width: 36, height: 36)
                            .background {
                                Circle()
                                    .fill(.white)
                                    .shadow(color: .gray.opacity(0.3), radius: 5, y: 5)
                            }
                    }
                }
                .foregroundColor(.primary)
                .padding(.top, 10)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 8) {
                // Price
                Text("$\(item.totalPrice, specifier: "%.2f")")
                    .font(.headline)
                    .frame(maxHeight: .infinity)
                
                // Remove Button
                Button(action: onRemove) {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                }
                .frame(maxHeight: .infinity)
            }
            .frame(maxWidth: .infinity)
            .padding(.trailing)
        }
        .frame(height: 110)
        .background(.white)
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .shadow(color: .gray.opacity(0.5), radius: 5)
    }
}

#Preview {
    BagItemView(
        item: BagItem.sampleItems[0],
        onIncrement: {},
        onDecrement: {},
        onRemove: {}
    )
    .padding()
}
