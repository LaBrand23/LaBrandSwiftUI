//
//  NavigationLink+.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 26/03/25.
//



import SwiftUI

extension View {
    /// Adds an onTap gesture to navigate using a single optional binding.
    func navigateOnTap<T: Hashable>(
        to value: T,
        selection: Binding<T?>
    ) -> some View {
        self.onTapGesture {
            selection.wrappedValue = value
        }
    }
    
    /// Adds a navigation destination based on an optional selection.
    func navigationDestination<T: Hashable, Destination: View>(
        for selection: Binding<T?>,
        destination: @escaping (T) -> Destination
    ) -> some View {
        self.navigationDestination(isPresented: selection.isNotNil()) {
            if let item = selection.wrappedValue {
                destination(item)
            }
        }
    }
}

extension Binding where Value: Equatable {
    /// Returns a computed `Binding<Bool>` that checks if the value is non-nil.
    func isNotNil<T>() -> Binding<Bool> where Value == T? {
        Binding<Bool>(
            get: { self.wrappedValue != nil },
            set: { if !$0 { self.wrappedValue = nil } }
        )
    }
}
