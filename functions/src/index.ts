import * as functions from "firebase-functions";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// Import controllers
import categoriesController from "./modules/categories/categories.controller";
import brandsController from "./modules/brands/brands.controller";
import productsController from "./modules/products/products.controller";
import usersController from "./modules/users/users.controller";
import ordersController from "./modules/orders/orders.controller";
import favoritesController from "./modules/favorites/favorites.controller";
import reviewsController from "./modules/reviews/reviews.controller";
import analyticsController from "./modules/analytics/analytics.controller";

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Health check
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "LaBrand API",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/categories", categoriesController);
app.use("/brands", brandsController);
app.use("/products", productsController);
app.use("/users", usersController);
app.use("/orders", ordersController);
app.use("/favorites", favoritesController);
app.use("/reviews", reviewsController);
app.use("/analytics", analyticsController);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Export the Express app as a Firebase Cloud Function
export const api = functions
  .region("asia-south1") // Same region as Supabase
  .runWith({
    timeoutSeconds: 60,
    memory: "256MB",
  })
  .https.onRequest(app);

// Export individual functions for better cold start times (optional)
export { app };

