# LaBrandSwiftUI

A modern e-commerce iOS app built with SwiftUI following MVVM architecture and iOS best practices.

## Features

- 🔐 Authentication
  - Sign in/Sign up with email
  - Social authentication (Google, Facebook)
  - Forgot password flow
  
- 🏠 Home Screen
  - Featured promotions carousel
  - Category navigation
  - New arrivals section
  - Sale products section
  
- 🔍 Search
  - Text-based search with debouncing
  - Visual search using Vision framework
  - Recent searches history
  - Trending products
  
- 🛍️ Product Features
  - Product categories
  - Product details
  - Reviews and ratings
  - Size and color selection
  
- 👤 Profile Management
  - User profile
  - Order history
  - Favorites
  - Settings

## Requirements

- iOS 15.0+
- Xcode 13.0+
- Swift 5.5+

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/LaBrandSwiftUI.git
```

2. Open the project in Xcode
```bash
cd LaBrandSwiftUI
open LaBrandSwiftUI.xcodeproj
```

3. Build and run the project

## Architecture

The app follows MVVM (Model-View-ViewModel) architecture and is organized by features:

```
LaBrandSwiftUI/
├── App/
├── Features/
│   ├── Authentication/
│   ├── Home/
│   ├── Search/
│   ├── Categories/
│   └── Profile/
├── Core/
│   ├── Models/
│   ├── Services/
│   └── Utils/
├── UI/
└── Resources/
```

## Technologies

- SwiftUI for UI
- Combine for reactive programming
- Vision framework for image analysis
- Core Data for persistence
- Swift Concurrency (async/await)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 