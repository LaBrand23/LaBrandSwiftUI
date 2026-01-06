import SwiftUI

enum ToastStyle {
    case success
    case error
    case warning
    case info

    var icon: String {
        switch self {
        case .success: return "checkmark.circle.fill"
        case .error: return "xmark.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        case .info: return "info.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .success: return .green
        case .error: return .red
        case .warning: return .orange
        case .info: return .blue
        }
    }
}

struct ToastMessage: Identifiable, Equatable {
    let id = UUID()
    let message: String
    let style: ToastStyle
    let duration: Double

    init(_ message: String, style: ToastStyle = .info, duration: Double = 2.5) {
        self.message = message
        self.style = style
        self.duration = duration
    }

    static func == (lhs: ToastMessage, rhs: ToastMessage) -> Bool {
        lhs.id == rhs.id
    }
}

@MainActor
final class ToastManager: ObservableObject {
    static let shared = ToastManager()

    @Published private(set) var currentToast: ToastMessage?
    private var dismissTask: Task<Void, Never>?

    private init() {}

    func show(_ message: String, style: ToastStyle = .info, duration: Double = 2.5) {
        dismissTask?.cancel()

        withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
            currentToast = ToastMessage(message, style: style, duration: duration)
        }

        dismissTask = Task {
            try? await Task.sleep(nanoseconds: UInt64(duration * 1_000_000_000))
            if !Task.isCancelled {
                await MainActor.run {
                    withAnimation(.easeOut(duration: 0.2)) {
                        self.currentToast = nil
                    }
                }
            }
        }
    }

    func dismiss() {
        dismissTask?.cancel()
        withAnimation(.easeOut(duration: 0.2)) {
            currentToast = nil
        }
    }
}
