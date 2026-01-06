import SwiftUI

struct ToastView: View {
    let toast: ToastMessage
    let onDismiss: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: toast.style.icon)
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(toast.style.color)

            Text(toast.message)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.primary)
                .lineLimit(2)

            Spacer()

            Button(action: onDismiss) {
                Image(systemName: "xmark")
                    .font(.system(size: 12, weight: .bold))
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(.regularMaterial)
                .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 4)
        )
        .padding(.horizontal, 16)
    }
}

struct ToastContainerModifier: ViewModifier {
    @ObservedObject private var toastManager = ToastManager.shared

    func body(content: Content) -> some View {
        ZStack {
            content

            VStack {
                if let toast = toastManager.currentToast {
                    ToastView(toast: toast) {
                        toastManager.dismiss()
                    }
                    .transition(.move(edge: .top).combined(with: .opacity))
                }
                Spacer()
            }
            .padding(.top, 50)
        }
    }
}

extension View {
    func withToast() -> some View {
        modifier(ToastContainerModifier())
    }
}

#Preview {
    VStack {
        Button("Show Success") {
            ToastManager.shared.show("Added to favorites!", style: .success)
        }
        Button("Show Error") {
            ToastManager.shared.show("Something went wrong", style: .error)
        }
        Button("Show Warning") {
            ToastManager.shared.show("Low stock available", style: .warning)
        }
        Button("Show Info") {
            ToastManager.shared.show("New items available", style: .info)
        }
    }
    .withToast()
}
