# Advanced Analytics System with OSLog

## Overview

The LaBrandSwiftUI app now features a comprehensive analytics system built on top of Apple's modern OSLog framework. This system provides structured logging, performance monitoring, error tracking, and user behavior analytics with minimal performance impact.

## Key Features

### 🎯 **Categorized Logging**
- **ViewCycle**: Screen views and view lifecycle events
- **API**: Network requests and responses
- **Authentication**: Login, logout, and auth-related events
- **User**: User actions and interactions
- **Network**: Network performance and errors
- **Performance**: App performance metrics
- **Error**: Error tracking with context
- **Debug**: Debug information
- **Analytics**: General analytics events
- **Storage**: Data persistence events
- **UI**: User interface interactions

### 📊 **Event Types**
- **User Actions**: Login, logout, registration, profile updates
- **Screen Views**: Screen navigation tracking
- **Network Events**: Request/response logging with timing
- **Performance**: App launch, background/foreground, metrics
- **UI Events**: Button taps, gestures, view lifecycle
- **Business Logic**: Purchases, feature usage
- **Error Events**: Error tracking with full context

### 🔧 **Advanced Features**
- **Structured Events**: Codable event objects with context
- **Performance Monitoring**: Response time tracking
- **Error Context**: Rich error information with stack traces
- **User Context**: Session and user identification
- **Device Info**: Automatic device information collection
- **Export Capability**: JSON export for debugging
- **Configurable**: Enable/disable different logging types

## Usage Examples

### Basic Event Logging

```swift
// Simple event
AnalyticsManager.shared.logEvent(
    .userLogin,
    name: "User Login",
    parameters: ["method": "email"],
    level: .info
)

// With Codable model
AnalyticsManager.shared.logEvent(
    .userRegistration,
    name: "User Registration",
    model: userModel,
    level: .info
)
```

### Screen Tracking

```swift
// In SwiftUI views
.onAppear {
    AnalyticsManager.shared.logScreenView("HomeScreen")
    AnalyticsManager.shared.logViewAppear("HomeScreen")
}
.onDisappear {
    AnalyticsManager.shared.logViewDisappear("HomeScreen")
}

// Using convenience extension
.trackScreen("HomeScreen")
```

### Network Request Tracking

```swift
// Automatic tracking in NetworkManager
let response = try await networkManager.performAsync(request)
// Automatically logs request, response time, and any errors
```

### Error Tracking

```swift
do {
    try someRiskyOperation()
} catch {
    AnalyticsManager.shared.logError(
        error,
        context: "UserProfile.updateProfile",
        additionalInfo: ["userId": "123", "field": "email"]
    )
}
```

### Performance Monitoring

```swift
// Track custom performance metrics
AnalyticsManager.shared.logPerformanceMetric(
    name: "image_processing_time",
    value: 150.5,
    unit: "ms"
)

// Using PerformanceTracker helper
let tracker = PerformanceTracker()
tracker.startTracking("database_query")
// ... perform database operation
tracker.endTracking("database_query")
```

### User Actions

```swift
// Track button taps
AnalyticsManager.shared.logButtonTap("login_button", screen: "LoginView")

// Track user actions
AnalyticsManager.shared.logUserAction(
    "product_viewed",
    parameters: ["productId": "123", "category": "electronics"]
)
```

## Configuration

### App Delegate Setup

```swift
func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    
    // Configure analytics
    let analytics = AnalyticsManager.shared
    analytics.enableConsoleLogging = true
    analytics.enableFileLogging = true
    analytics.maxStoredEvents = 1000
    
    // Log app launch
    analytics.logEvent(.appLaunch, name: "App Did Launch", level: .info)
    
    return true
}
```

### App State Change Tracking

```swift
// Set up notifications for app state changes
NotificationCenter.default.addObserver(
    forName: UIApplication.didEnterBackgroundNotification,
    object: nil,
    queue: .main
) { _ in
    AnalyticsManager.shared.logAppStateChange("background")
}

NotificationCenter.default.addObserver(
    forName: UIApplication.willEnterForegroundNotification,
    object: nil,
    queue: .main
) { _ in
    AnalyticsManager.shared.logAppStateChange("foreground")
}
```

## SwiftUI Extensions

### View Extensions

```swift
// Track screen views automatically
.trackScreen("ProductDetailView")

// Track button taps
.trackButtonTap("add_to_cart", screen: "ProductDetailView")
```

### ViewModel Integration

```swift
@MainActor
class ProductViewModel: ObservableObject {
    private let analytics = AnalyticsManager.shared
    
    func loadProduct(id: String) async {
        analytics.logEvent(.featureUsage, name: "Product Load", parameters: ["productId": id])
        
        do {
            let product = try await productService.getProduct(id: id)
            analytics.logEvent(.featureUsage, name: "Product Load Success", parameters: ["productId": id])
        } catch {
            analytics.logError(error, context: "ProductViewModel.loadProduct")
        }
    }
}
```

## Debugging and Export

### Export Events

```swift
// Export all stored events as JSON
let exportedData = AnalyticsManager.shared.exportEvents()
print(exportedData)

// Get stored events
let events = AnalyticsManager.shared.getStoredEvents()
print("Total events: \(events.count)")

// Clear stored events
AnalyticsManager.shared.clearStoredEvents()
```

### Debug Helpers

```swift
#if DEBUG
// Print all events to console
AnalyticsManager.shared.debugPrintEvents()
#endif
```

## OSLog Integration

The system uses Apple's OSLog framework for efficient logging:

```swift
// Direct OSLog usage
Logger.api.info("🌐 GET /api/products")
Logger.error.error("❌ Network error: \(error.localizedDescription)")
Logger.performance.info("⚡ Database query: 45ms")
```

### Console Filtering

In Xcode console, you can filter logs by category:
- `subsystem:com.labrand.app category:API`
- `subsystem:com.labrand.app category:Error`
- `subsystem:com.labrand.app category:Performance`

## Performance Considerations

- **Async Processing**: All analytics events are processed asynchronously
- **Memory Management**: Events are automatically cleaned up after reaching max count
- **OSLog Efficiency**: Uses Apple's optimized logging system
- **Configurable Storage**: Can disable file logging for performance
- **Background Processing**: Uses utility QoS for minimal impact

## Best Practices

### 1. **Use Appropriate Log Levels**
- `.debug`: Development and debugging information
- `.info`: General information and user actions
- `.warning`: Potential issues that don't break functionality
- `.error`: Errors that affect functionality
- `.critical`: Critical errors that may crash the app

### 2. **Provide Rich Context**
```swift
analytics.logError(
    error,
    context: "UserProfile.updateProfile",
    additionalInfo: [
        "userId": userId,
        "field": "email",
        "screen": "ProfileView"
    ]
)
```

### 3. **Track User Journey**
```swift
// Track complete user flows
analytics.logEvent(.featureUsage, name: "Checkout Started", parameters: ["cartItems": "3"])
analytics.logEvent(.featureUsage, name: "Payment Method Selected", parameters: ["method": "credit_card"])
analytics.logEvent(.purchaseSuccess, name: "Purchase Completed", parameters: ["amount": "99.99"])
```

### 4. **Monitor Performance**
```swift
// Track app performance
analytics.logPerformanceMetric("app_launch_time", value: launchTime, unit: "ms")
analytics.logPerformanceMetric("network_response_time", value: responseTime, unit: "ms")
analytics.logPerformanceMetric("database_query_time", value: queryTime, unit: "ms")
```

### 5. **Error Tracking**
```swift
// Always provide context for errors
analytics.logError(
    error,
    context: "NetworkManager.performRequest",
    additionalInfo: [
        "url": request.url?.absoluteString ?? "unknown",
        "method": request.httpMethod ?? "unknown",
        "statusCode": String(httpResponse.statusCode)
    ]
)
```

## Migration from Old System

The new system is backward compatible. Old calls like:
```swift
analyticsManager.logEvent("LoginSuccess", model: token, level: .success)
```

Can be updated to:
```swift
analyticsManager.logEvent(.userLogin, name: "Login Success", model: token, level: .info)
```

## Future Enhancements

- **Remote Logging**: Integration with Firebase Analytics, Crashlytics
- **Real-time Monitoring**: Live dashboard for analytics
- **A/B Testing**: Built-in A/B testing support
- **User Segmentation**: Advanced user behavior analysis
- **Custom Dashboards**: In-app analytics dashboard

## Troubleshooting

### Common Issues

1. **Events not appearing in console**
   - Check if `enableConsoleLogging` is true
   - Verify OSLog category filters in Xcode

2. **Performance impact**
   - Disable file logging if not needed
   - Reduce `maxStoredEvents` value
   - Use appropriate log levels

3. **Memory usage**
   - Events are automatically cleaned up
   - Check `maxStoredEvents` configuration

### Debug Commands

```swift
// Check current configuration
print("Console logging: \(AnalyticsManager.shared.enableConsoleLogging)")
print("File logging: \(AnalyticsManager.shared.enableFileLogging)")
print("Stored events: \(AnalyticsManager.shared.getStoredEvents().count)")

// Export for analysis
let json = AnalyticsManager.shared.exportEvents()
// Save to file or send to debugging tool
```
