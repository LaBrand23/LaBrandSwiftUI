//
//  SocialProofView.swift
//  LaBrandSwiftUI
//
//  Created by Shaxzod on 19/04/25
//

import SwiftUI

struct SocialProofView: View {
    let socialProof: SocialProof
    
    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "flame.fill")
                .font(.caption)
                .foregroundColor(.orange)
            
            Text(socialProof.message)
                .font(.caption)
                .foregroundColor(.secondary)
            
            if socialProof.trending {
                Text("🔥")
                    .font(.caption)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.orange.opacity(0.1))
        )
    }
}

#Preview {
    SocialProofView(socialProof: SocialProof(
        recentBuyers: 12,
        timeFrame: "24 hours",
        trending: true
    ))
    .padding()
}
