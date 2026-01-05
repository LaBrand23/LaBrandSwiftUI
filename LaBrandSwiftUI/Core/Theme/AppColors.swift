//
//  AppColors.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 27/03/25.
//
//  ╔═══════════════════════════════════════════════════════════════╗
//  ║  CENTRALIZED COLOR SYSTEM - LaBrand Fashion E-Commerce       ║
//  ║  All colors should be accessed through this file             ║
//  ║  DO NOT use Color(hex:) directly in views                    ║
//  ╚═══════════════════════════════════════════════════════════════╝

import SwiftUI

// MARK: - App Colors Namespace
enum AppColors {
    
    // MARK: - Primary Colors
    /// Almost black - Primary text, buttons, headings
    static let primary = Color("Primary", bundle: nil)
    static let primaryHex = adaptiveColor(light: "1A1A1A", dark: "FFFFFF")
    
    // MARK: - Text Colors
    enum Text {
        /// Primary text color - #1A1A1A / #FFFFFF
        static let primary = adaptiveColor(light: "1A1A1A", dark: "FAFAFA")
        
        /// Secondary text - #333333 / #E0E0E0
        static let secondary = adaptiveColor(light: "333333", dark: "E0E0E0")
        
        /// Tertiary/Muted text - #666666 / #A0A0A0
        static let tertiary = adaptiveColor(light: "666666", dark: "A0A0A0")
        
        /// Meta text, placeholders - #999999 / #808080
        static let muted = adaptiveColor(light: "999999", dark: "808080")
        
        /// Inverted text (for dark backgrounds)
        static let inverted = adaptiveColor(light: "FFFFFF", dark: "1A1A1A")
    }
    
    // MARK: - Background Colors
    enum Background {
        /// Main app background - #FAFAFA / #0D0D0D
        static let primary = adaptiveColor(light: "FAFAFA", dark: "0D0D0D")
        
        /// Card/Surface background - #FFFFFF / #1A1A1A
        static let surface = adaptiveColor(light: "FFFFFF", dark: "1A1A1A")
        
        /// Secondary surface - #F5F5F5 / #2D2D2D
        static let secondary = adaptiveColor(light: "F5F5F5", dark: "2D2D2D")
        
        /// Input field background - #F5F5F5 / #1A1A1A
        static let input = adaptiveColor(light: "F5F5F5", dark: "1A1A1A")
        
        /// Dark editorial background
        static let editorial = adaptiveColor(light: "1A1A1A", dark: "0D0D0D")
        
        /// Dark navy for special sections
        static let navy = adaptiveColor(light: "1A1A2E", dark: "0A0A15")
    }
    
    // MARK: - Border & Divider Colors
    enum Border {
        /// Standard border - #E8E8E8 / #333333
        static let primary = adaptiveColor(light: "E8E8E8", dark: "333333")
        
        /// Subtle border - #F0F0F0 / #2D2D2D
        static let subtle = adaptiveColor(light: "F0F0F0", dark: "2D2D2D")
        
        /// Focus border - #1A1A1A / #FFFFFF
        static let focus = adaptiveColor(light: "1A1A1A", dark: "FFFFFF")
    }
    
    // MARK: - Accent Colors
    enum Accent {
        /// Gold accent - #C4A77D (same in both modes)
        static let gold = Color(hex: "C4A77D")
        
        /// Sale/Promo red - #C41E3A (same in both modes)
        static let sale = Color(hex: "C41E3A")
        
        /// Success green - #2E7D32 / #4CAF50
        static let success = adaptiveColor(light: "2E7D32", dark: "4CAF50")
        
        /// Warning orange - #F57C00 / #FFB74D
        static let warning = adaptiveColor(light: "F57C00", dark: "FFB74D")
        
        /// Error red - #C41E3A / #EF5350
        static let error = adaptiveColor(light: "C41E3A", dark: "EF5350")
    }
    
    // MARK: - Button Colors
    enum Button {
        /// Primary button background
        static let primaryBackground = adaptiveColor(light: "1A1A1A", dark: "FFFFFF")
        
        /// Primary button text
        static let primaryText = adaptiveColor(light: "FFFFFF", dark: "1A1A1A")
        
        /// Secondary button background
        static let secondaryBackground = adaptiveColor(light: "FFFFFF", dark: "1A1A1A")
        
        /// Secondary button text
        static let secondaryText = adaptiveColor(light: "1A1A1A", dark: "FFFFFF")
        
        /// Disabled state
        static let disabled = adaptiveColor(light: "E8E8E8", dark: "333333")
        static let disabledText = adaptiveColor(light: "999999", dark: "666666")
    }
    
    // MARK: - Tab Bar Colors
    enum TabBar {
        /// Tab bar background
        static let background = adaptiveColor(light: "FAFAFA", dark: "0D0D0D")
        
        /// Selected tab
        static let selected = adaptiveColor(light: "1A1A1A", dark: "FFFFFF")
        
        /// Unselected tab
        static let unselected = adaptiveColor(light: "999999", dark: "666666")
    }
    
    // MARK: - Rating Colors
    enum Rating {
        /// Filled star
        static let filled = Accent.gold
        
        /// Empty star - #E8E8E8 / #333333
        static let empty = adaptiveColor(light: "E8E8E8", dark: "333333")
    }
    
    // MARK: - Shadow Colors
    enum Shadow {
        /// Light shadow
        static let light = Color.black.opacity(0.06)
        
        /// Medium shadow
        static let medium = Color.black.opacity(0.1)
        
        /// Dark shadow
        static let dark = Color.black.opacity(0.15)
    }
    
    // MARK: - Gradient Presets
    enum Gradient {
        /// Editorial dark gradient
        static let editorial = LinearGradient(
            colors: [Color(hex: "1A1A1A"), Color(hex: "2D2D2D")],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        
        /// Gold accent gradient
        static let gold = LinearGradient(
            colors: [Color(hex: "C4A77D").opacity(0.7), Color(hex: "C4A77D").opacity(0.3)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        
        /// Overlay gradient (for images)
        static let imageOverlay = LinearGradient(
            stops: [
                .init(color: .clear, location: 0),
                .init(color: Color.black.opacity(0.3), location: 0.5),
                .init(color: Color.black.opacity(0.8), location: 1.0)
            ],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

// MARK: - Adaptive Color Helper
private func adaptiveColor(light: String, dark: String) -> Color {
    Color(UIColor { traitCollection in
        switch traitCollection.userInterfaceStyle {
        case .dark:
            return UIColor(Color(hex: dark))
        default:
            return UIColor(Color(hex: light))
        }
    })
}

// MARK: - Color Extension (Keep hex init for internal use)
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - Preview
#Preview("Color Palette") {
    ScrollView {
        VStack(spacing: 24) {
            // Text Colors
            colorSection(title: "Text Colors") {
                colorRow("Primary", AppColors.Text.primary)
                colorRow("Secondary", AppColors.Text.secondary)
                colorRow("Tertiary", AppColors.Text.tertiary)
                colorRow("Muted", AppColors.Text.muted)
            }
            
            // Background Colors
            colorSection(title: "Backgrounds") {
                colorRow("Primary", AppColors.Background.primary)
                colorRow("Surface", AppColors.Background.surface)
                colorRow("Secondary", AppColors.Background.secondary)
                colorRow("Editorial", AppColors.Background.editorial)
            }
            
            // Accent Colors
            colorSection(title: "Accents") {
                colorRow("Gold", AppColors.Accent.gold)
                colorRow("Sale Red", AppColors.Accent.sale)
                colorRow("Success", AppColors.Accent.success)
                colorRow("Error", AppColors.Accent.error)
            }
        }
        .padding()
    }
    .background(AppColors.Background.primary)
}

// Preview Helpers
private func colorSection(title: String, @ViewBuilder content: () -> some View) -> some View {
    VStack(alignment: .leading, spacing: 12) {
        Text(title.uppercased())
            .font(.system(size: 11, weight: .bold))
            .tracking(2)
            .foregroundStyle(AppColors.Text.muted)
        
        content()
    }
}

private func colorRow(_ name: String, _ color: Color) -> some View {
    HStack {
        RoundedRectangle(cornerRadius: 4)
            .fill(color)
            .frame(width: 40, height: 40)
            .overlay(
                RoundedRectangle(cornerRadius: 4)
                    .stroke(AppColors.Border.primary, lineWidth: 1)
            )
        
        Text(name)
            .font(.system(size: 14))
            .foregroundStyle(AppColors.Text.primary)
        
        Spacer()
    }
}

