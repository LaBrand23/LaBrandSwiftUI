# Category API Integration Documentation

## Overview

This document outlines the changes made to integrate the Category API endpoints with the LaBrandSwiftUI app, based on the backend API documentation provided.

## Changes Made

### 1. Updated Category Model (`Category.swift`)

**Key Changes:**
- Changed `id` from `UUID` to `Int` to match backend API
- Replaced `image` with `imageUrl` and added `displayImage` computed property
- Replaced `parentCategoryID` with `parentId` (Int?)
- Removed `subcategories` array (now loaded dynamically)
- Added new fields: `description`, `slug`, `position`
- Added proper `CodingKeys` for JSON mapping

**New Structure:**
```swift
struct Category: Identifiable, Codable, Hashable {
    let id: Int
    let name: String
    let parentId: Int?
    let description: String?
    let slug: String?
    let position: Int
    let imageUrl: String?
    
    var displayImage: String {
        return imageUrl ?? "cat_women_clothes" // Fallback to local asset
    }
}
```

### 2. Added CategoryProductsCount Model

```swift
struct CategoryProductsCount: Codable {
    let categoryId: Int
    let categoryName: String
    let directProducts: Int
    let subcategoryProducts: Int
    let totalProducts: Int
}
```

### 3. Created CategoryNetworkService (`CategoryNetworkService.swift`)

**Features:**
- Protocol-based design for testability
- All four API endpoints implemented:
  - `fetchCategories(parentId: Int?)` - List categories
  - `fetchCategoryDetails(id: Int)` - Get category details
  - `fetchCategoryChildren(parentId: Int)` - Get subcategories
  - `fetchCategoryProductsCount(categoryId: Int)` - Get product counts

**API Endpoints:**
- `GET /api/v1/categories/` - List all categories
- `GET /api/v1/categories/?parent_id={id}` - List subcategories
- `GET /api/v1/categories/{id}` - Get category details
- `GET /api/v1/categories/{id}/children` - Get category children
- `GET /api/v1/categories/{id}/products-count` - Get product counts

### 4. Updated APIEndpoint Enum

Added new category endpoints:
```swift
case categories = "/categories"
case categoryDetails = "/categories"
case categoryChildren = "/categories"
case categoryProductsCount = "/categories"
```

### 5. Enhanced NetworkManager

- Added support for `customPath` in `APIRequest` protocol
- Updated URL construction to handle dynamic paths
- Maintains backward compatibility with existing endpoints

### 6. Updated CategoriesViewModel

**New Features:**
- Async/await support with proper error handling
- Loading states and error management
- Fallback to mock data when API fails
- Dynamic subcategory loading
- Product count integration

**Key Methods:**
- `loadCategories()` - Load top-level categories
- `loadSubcategories(for categoryId: Int)` - Load subcategories
- `loadCategoryDetails(id: Int)` - Load category details
- `loadCategoryProductsCount(categoryId: Int)` - Load product counts

### 7. Updated UI Components

**CategoriesView:**
- Added loading states and error handling
- Retry functionality for failed API calls
- Proper async/await integration

**CategoryDetailView:**
- Dynamic subcategory loading from API
- Loading states and error handling
- Retry functionality

**CategoryCard:**
- Updated to use `displayImage` property
- Fallback to local assets when API images fail

### 8. Updated Related Files

**HomeNetworkService:**
- Updated conversion methods to use new Category structure
- Fixed `toCategory()` and `toProduct()` methods

**HomeView:**
- Updated `QuickCategoryCard` to use `displayImage`

**ProductCard:**
- Updated preview to use new Category structure

## API Integration Features

### 1. Error Handling
- Comprehensive error handling for network failures
- User-friendly error messages
- Retry functionality
- Fallback to mock data when API is unavailable

### 2. Loading States
- Loading indicators during API calls
- Proper state management
- Non-blocking UI updates

### 3. Caching Strategy
- Ready for future caching implementation
- Efficient data loading patterns
- Minimal API calls

### 4. Offline Support
- Mock data fallback
- Graceful degradation
- Local asset fallbacks for images

## Usage Examples

### Basic Category Loading
```swift
let viewModel = CategoriesViewModel()
await viewModel.loadCategories()
```

### Loading Subcategories
```swift
await viewModel.loadSubcategories(for: categoryId)
```

### Getting Product Counts
```swift
let count = await viewModel.loadCategoryProductsCount(categoryId: categoryId)
```

### Direct API Usage
```swift
let service = CategoryNetworkService()
let categories = try await service.fetchCategories(parentId: nil)
let subcategories = try await service.fetchCategoryChildren(parentId: 1)
```

## Testing

A comprehensive test file (`CategoryNetworkServiceTest.swift`) has been created with:
- Individual test methods for each API endpoint
- Detailed logging and error reporting
- Example usage patterns
- Easy-to-run test suite

## Backward Compatibility

- All existing UI components continue to work
- Mock data is preserved for development
- Gradual migration path available
- No breaking changes to existing functionality

## Future Enhancements

1. **Caching Layer**: Implement local caching for categories
2. **Image Optimization**: Add image caching and optimization
3. **Real-time Updates**: WebSocket integration for category changes
4. **Analytics**: Track category interactions and performance
5. **Search Integration**: Category-based search functionality

## Configuration

The API integration uses the existing configuration system:
- Base URL from `Config.baseURL`
- API version from `Config.apiVersion`
- Environment-specific settings
- Proper error handling and logging

## Security

- All category endpoints are public (no authentication required)
- Proper input validation
- Secure URL construction
- Error message sanitization

This integration provides a robust, scalable foundation for category management in the LaBrandSwiftUI app, following iOS best practices and the provided backend API specification.
