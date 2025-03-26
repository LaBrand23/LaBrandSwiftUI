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
                .frame(width: 80, height: 80)
                .clipShape(RoundedRectangle(cornerRadius: 8))
            
            VStack(alignment: .leading, spacing: 4) {
                // Product Name
                Text(item.name)
                    .font(.headline)
                
                // Size
                Text("Size: \(item.size)")
                    .font(.subheadline)
                    .foregroundColor(.gray)
                
                // Quantity Controls
                HStack {
                    Button(action: onDecrement) {
                        Image(systemName: "minus.circle")
                    }
                    
                    Text("\(item.quantity)")
                        .frame(minWidth: 30)
                        .font(.headline)
                    
                    Button(action: onIncrement) {
                        Image(systemName: "plus.circle")
                    }
                }
                .foregroundColor(.primary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 8) {
                // Price
                Text("$\(item.totalPrice, specifier: "%.2f")")
                    .font(.headline)
                
                // Remove Button
                Button(action: onRemove) {
                    Image(systemName: "trash")
                        .foregroundColor(.red)
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
    }
}

#Preview {
    BagItemView(
        item: BagItem.sampleItems[0],
        onIncrement: {},
        onDecrement: {},
        onRemove: {}
    )
} 