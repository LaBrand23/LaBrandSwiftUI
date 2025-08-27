//
//  SizeGuideSheet.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct SizeGuideSheet: View {
    @Binding var isPresented: Bool
    let productName: String
    let category: String
    
    // Size chart data - in real app this would come from API
    private var sizeChart: [SizeChartItem] {
        switch category.lowercased() {
        case "shirts", "tops", "t-shirts", "blouses", "sweaters":
            return [
                SizeChartItem(size: "XS", chest: "32-34", waist: "26-28", length: "26"),
                SizeChartItem(size: "S", chest: "34-36", waist: "28-30", length: "27"),
                SizeChartItem(size: "M", chest: "36-38", waist: "30-32", length: "28"),
                SizeChartItem(size: "L", chest: "38-40", waist: "32-34", length: "29"),
                SizeChartItem(size: "XL", chest: "40-42", waist: "34-36", length: "30"),
                SizeChartItem(size: "XXL", chest: "42-44", waist: "36-38", length: "31")
            ]
        case "pants", "jeans", "trousers":
            return [
                SizeChartItem(size: "XS", waist: "26-28", hip: "34-36", inseam: "30"),
                SizeChartItem(size: "S", waist: "28-30", hip: "36-38", inseam: "31"),
                SizeChartItem(size: "M", waist: "30-32", hip: "38-40", inseam: "32"),
                SizeChartItem(size: "L", waist: "32-34", hip: "40-42", inseam: "33"),
                SizeChartItem(size: "XL", waist: "34-36", hip: "42-44", inseam: "34"),
                SizeChartItem(size: "XXL", waist: "36-38", hip: "44-46", inseam: "35")
            ]
        case "dresses":
            return [
                SizeChartItem(size: "XS", waist: "26-28", hip: "34-36", length: "36", bust: "32-34"),
                SizeChartItem(size: "S", waist: "28-30", hip: "36-38", length: "37", bust: "34-36"),
                SizeChartItem(size: "M", waist: "30-32", hip: "38-40", length: "38", bust: "36-38"),
                SizeChartItem(size: "L", waist: "32-34", hip: "40-42", length: "39", bust: "38-40"),
                SizeChartItem(size: "XL", waist: "34-36", hip: "42-44", length: "40", bust: "40-42"),
                SizeChartItem(size: "XXL", waist: "36-38", hip: "44-46", length: "41", bust: "42-44")
            ]
        case "shoes", "sneakers", "boots":
            return [
                SizeChartItem(size: "6", us: "6", eu: "39", uk: "5.5"),
                SizeChartItem(size: "7", us: "7", eu: "40", uk: "6.5"),
                SizeChartItem(size: "8", us: "8", eu: "41", uk: "7.5"),
                SizeChartItem(size: "9", us: "9", eu: "42", uk: "8.5"),
                SizeChartItem(size: "10", us: "10", eu: "43", uk: "9.5"),
                SizeChartItem(size: "11", us: "11", eu: "44", uk: "10.5"),
                SizeChartItem(size: "12", us: "12", eu: "45", uk: "11.5")
            ]
        default:
            return [
                SizeChartItem(size: "XS", chest: "32-34", waist: "26-28", length: "26"),
                SizeChartItem(size: "S", chest: "34-36", waist: "28-30", length: "27"),
                SizeChartItem(size: "M", chest: "36-38", waist: "30-32", length: "28"),
                SizeChartItem(size: "L", chest: "38-40", waist: "32-34", length: "29"),
                SizeChartItem(size: "XL", chest: "40-42", waist: "34-36", length: "30"),
                SizeChartItem(size: "XXL", chest: "42-44", waist: "36-38", length: "31")
            ]
        }
    }
    
    // Dynamic headers based on category
    private var chartHeaders: [String] {
        switch category.lowercased() {
        case "shoes", "sneakers", "boots":
            return ["Size", "US", "EU", "UK"]
        case "dresses":
            return ["Size", "Bust", "Waist", "Hip", "Length"]
        case "pants", "jeans", "trousers":
            return ["Size", "Waist", "Hip", "Inseam"]
        default:
            return ["Size", "Chest", "Waist", "Hip", "Length"]
        }
    }
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Header with product info
                    productHeader
                    
                    // How to measure section
                    howToMeasureSection
                    
                    // Size chart
                    sizeChartSection
                    
                    // Tips section
                    tipsSection
                    
                    // Contact support
                    contactSupportSection
                }
                .padding()
            }
            .navigationTitle("Size Guide")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        isPresented = false
                    }
                    .fontWeight(.medium)
                }
            }
        }
    }
    
    private var productHeader: some View {
        VStack(spacing: 8) {
            Text(productName)
                .font(.title2)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
            
            Text("Find your perfect fit")
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding(.top)
    }
    
    private var howToMeasureSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("How to Measure")
                .font(.headline)
                .fontWeight(.semibold)
            
            VStack(spacing: 12) {
                if category.lowercased().contains("shoes") || category.lowercased().contains("sneakers") || category.lowercased().contains("boots") {
                    MeasurementInstructionRow(
                        title: "Foot Length",
                        description: "Measure from heel to longest toe",
                        icon: "figure.walk"
                    )
                    
                    MeasurementInstructionRow(
                        title: "Foot Width",
                        description: "Measure around the widest part of your foot",
                        icon: "ruler"
                    )
                } else {
                    MeasurementInstructionRow(
                        title: category.lowercased().contains("dresses") ? "Bust" : "Chest/Bust",
                        description: "Measure around the fullest part of your chest",
                        icon: "figure.dress.line.vertical.figure"
                    )
                    
                    MeasurementInstructionRow(
                        title: "Waist",
                        description: "Measure around your natural waistline",
                        icon: "figure.walk"
                    )
                    
                    MeasurementInstructionRow(
                        title: "Hips",
                        description: "Measure around the fullest part of your hips",
                        icon: "figure.dress.line.vertical.figure"
                    )
                    
                    if category.lowercased().contains("pants") || category.lowercased().contains("jeans") {
                        MeasurementInstructionRow(
                            title: "Inseam",
                            description: "Measure from crotch to desired length",
                            icon: "ruler"
                        )
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private var sizeChartSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Size Chart")
                .font(.headline)
                .fontWeight(.semibold)
            
            ScrollView(.horizontal, showsIndicators: false) {
                VStack(spacing: 0) {
                    // Header row
                    HStack(spacing: 0) {
                        ForEach(chartHeaders, id: \.self) { header in
                            Text(header)
                                .font(.caption)
                                .fontWeight(.semibold)
                                .frame(width: 80, height: 44)
                                .background(Color(.systemGray5))
                                .foregroundColor(.primary)
                        }
                    }
                    
                    // Data rows
                    ForEach(sizeChart, id: \.size) { item in
                        HStack(spacing: 0) {
                            ForEach(chartHeaders, id: \.self) { header in
                                Text(item.value(for: header))
                                    .font(.subheadline)
                                    .fontWeight(header == "Size" ? .medium : .regular)
                                    .frame(width: 80, height: 44)
                                    .background(header == "Size" ? Color(.systemGray6) : Color.white)
                            }
                        }
                    }
                }
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(.systemGray4), lineWidth: 1)
                )
            }
        }
    }
    
    private var tipsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Size Tips")
                .font(.headline)
                .fontWeight(.semibold)
            
            VStack(spacing: 12) {
                if category.lowercased().contains("shoes") || category.lowercased().contains("sneakers") || category.lowercased().contains("boots") {
                    TipRow(
                        icon: "clock.fill",
                        iconColor: .blue,
                        text: "Measure your feet in the afternoon when they're largest"
                    )
                    
                    TipRow(
                        icon: "sock.fill",
                        iconColor: .purple,
                        text: "Wear the same type of socks you'll use with these shoes"
                    )
                    
                    TipRow(
                        icon: "ruler.fill",
                        iconColor: .green,
                        text: "Leave about 1/2 inch of space for toe movement"
                    )
                } else {
                    TipRow(
                        icon: "lightbulb.fill",
                        iconColor: .yellow,
                        text: "Measure yourself while wearing light clothing"
                    )
                    
                    TipRow(
                        icon: "ruler.fill",
                        iconColor: .blue,
                        text: "Keep the measuring tape snug but not tight"
                    )
                    
                    TipRow(
                        icon: "person.fill.questionmark",
                        iconColor: .green,
                        text: "When in doubt, size up for comfort"
                    )
                }
                
                TipRow(
                    icon: "arrow.left.arrow.right",
                    iconColor: .orange,
                    text: "Our free returns make it easy to exchange sizes"
                )
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
    
    private var contactSupportSection: some View {
        VStack(spacing: 12) {
            Text("Need help finding your size?")
                .font(.subheadline)
                .fontWeight(.medium)
            
            Button {
                // TODO: Implement contact support
            } label: {
                HStack {
                    Image(systemName: "message.fill")
                    Text("Contact Support")
                }
                .font(.subheadline)
                .fontWeight(.medium)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.blue)
                .cornerRadius(12)
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

// MARK: - Supporting Views
struct MeasurementInstructionRow: View {
    let title: String
    let description: String
    let icon: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(.blue)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

struct TipRow: View {
    let icon: String
    let iconColor: Color
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(iconColor)
                .frame(width: 20)
            
            Text(text)
                .font(.subheadline)
            
            Spacer()
        }
    }
}

// MARK: - Supporting Models
struct SizeChartItem {
    let size: String
    let chest: String?
    let waist: String?
    let hip: String?
    let length: String?
    let inseam: String?
    let bust: String?
    let us: String?
    let eu: String?
    let uk: String?
    
    init(size: String, chest: String? = nil, waist: String? = nil, hip: String? = nil, length: String? = nil, inseam: String? = nil, bust: String? = nil, us: String? = nil, eu: String? = nil, uk: String? = nil) {
        self.size = size
        self.chest = chest
        self.waist = waist
        self.hip = hip
        self.length = length
        self.inseam = inseam
        self.bust = bust
        self.us = us
        self.eu = eu
        self.uk = uk
    }
    
    func value(for header: String) -> String {
        switch header {
        case "Size":
            return size
        case "Chest":
            return chest ?? "-"
        case "Waist":
            return waist ?? "-"
        case "Hip":
            return hip ?? "-"
        case "Length":
            return length ?? "-"
        case "Inseam":
            return inseam ?? "-"
        case "Bust":
            return bust ?? "-"
        case "US":
            return us ?? "-"
        case "EU":
            return eu ?? "-"
        case "UK":
            return uk ?? "-"
        default:
            return "-"
        }
    }
}

#Preview {
    SizeGuideSheet(
        isPresented: .constant(true),
        productName: "Classic Cotton T-Shirt",
        category: "T-Shirts"
    )
}
