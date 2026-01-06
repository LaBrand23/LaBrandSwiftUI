import { Request, Response, NextFunction } from "express";
import admin from "../config/firebase";
import supabase from "../config/supabase";
import { UserRole } from "../config/constants";
import { AuthUser } from "../types";
import { unauthorized } from "../utils/response";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Verify Firebase ID token and attach user to request
 */
export async function verifyAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      unauthorized(res, "No token provided");
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Get user from Supabase by Firebase UID
    const { data: user, error } = await supabase
      .from("users")
      .select("id, role, brand_id")
      .eq("firebase_uid", decodedToken.uid)
      .single();

    if (error || !user) {
      // User exists in Firebase but not in Supabase - create them
      if (error?.code === "PGRST116") {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            firebase_uid: decodedToken.uid,
            email: decodedToken.email,
            phone: decodedToken.phone_number,
            full_name: decodedToken.name,
            avatar_url: decodedToken.picture,
            role: UserRole.CLIENT,
          })
          .select("id, role, brand_id")
          .single();

        if (createError || !newUser) {
          unauthorized(res, "Failed to create user profile");
          return;
        }

        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email || null,
          role: newUser.role as UserRole,
          brandId: newUser.brand_id,
          userId: newUser.id,
        };
      } else {
        unauthorized(res, "User not found");
        return;
      }
    } else {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        role: user.role as UserRole,
        brandId: user.brand_id,
        userId: user.id,
      };
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    unauthorized(res, "Invalid token");
  }
}

/**
 * Optional auth - doesn't fail if no token, just doesn't set user
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      next();
      return;
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    const { data: user } = await supabase
      .from("users")
      .select("id, role, brand_id")
      .eq("firebase_uid", decodedToken.uid)
      .single();

    if (user) {
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        role: user.role as UserRole,
        brandId: user.brand_id,
        userId: user.id,
      };
    }

    next();
  } catch {
    // Silently continue without user
    next();
  }
}

