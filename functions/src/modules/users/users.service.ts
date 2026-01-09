import supabase from "../../config/supabase";
import { auth as firebaseAuth } from "../../config/firebase";
import { User, Address } from "../../types";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { parsePagination, parseSort } from "../../utils/helpers";
import { UserRole } from "../../config/constants";

export class UsersService {
  /**
   * Get all users with pagination (Admin only)
   */
  async getUsers(query: Record<string, unknown>): Promise<{ users: User[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const { field, order } = parseSort(query, ["full_name", "email", "created_at", "role"], "created_at", "desc");

    let queryBuilder = supabase
      .from("users")
      .select("*", { count: "exact" })
      .eq("is_active", true);

    // Filter by role if specified
    if (query.role) {
      queryBuilder = queryBuilder.eq("role", query.role);
    }

    // Filter by brand if specified
    if (query.brand_id) {
      queryBuilder = queryBuilder.eq("brand_id", query.brand_id);
    }

    // Search by name or email
    if (query.search) {
      queryBuilder = queryBuilder.or(`full_name.ilike.%${query.search}%,email.ilike.%${query.search}%`);
    }

    const { data, error, count } = await queryBuilder
      .order(field, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      users: data || [],
      total: count || 0,
    };
  }

  /**
   * Create a new user (Admin only)
   * Creates both Firebase Auth user and Supabase record
   */
  async createUser(input: {
    email: string;
    password: string;
    full_name: string;
    phone?: string;
    role: UserRole;
    brand_id?: string;
    branch_id?: string;
  }): Promise<User> {
    // Validate brand_id for brand managers
    if (input.role === UserRole.BRAND_MANAGER && !input.brand_id) {
      throw new BadRequestError("Brand ID is required for brand managers");
    }

    // Check if email already exists in Supabase
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", input.email)
      .single();

    if (existingUser) {
      throw new BadRequestError("A user with this email already exists");
    }

    // Create Firebase Auth user
    let firebaseUser;
    try {
      firebaseUser = await firebaseAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.full_name,
        emailVerified: true, // Auto-verify for admin-created accounts
      });
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === "auth/email-already-exists") {
        throw new BadRequestError("A user with this email already exists in Firebase");
      }
      throw new BadRequestError(error.message || "Failed to create Firebase user");
    }

    // Create Supabase user record
    try {
      const { data: user, error } = await supabase
        .from("users")
        .insert({
          firebase_uid: firebaseUser.uid,
          email: input.email,
          full_name: input.full_name,
          phone: input.phone,
          role: input.role,
          brand_id: input.role === UserRole.BRAND_MANAGER ? input.brand_id : null,
          branch_id: input.role === UserRole.BRAND_MANAGER ? input.branch_id : null,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        // Rollback: delete Firebase user if Supabase insert fails
        await firebaseAuth.deleteUser(firebaseUser.uid);
        throw error;
      }

      return user;
    } catch (err) {
      // Rollback: delete Firebase user if anything fails
      try {
        await firebaseAuth.deleteUser(firebaseUser.uid);
      } catch {
        console.error("Failed to rollback Firebase user:", firebaseUser.uid);
      }
      throw err;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        brand:brands(id, name, slug)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError("User not found");
    }

    return data;
  }

  /**
   * Get user by Firebase UID
   */
  async getUserByFirebaseUid(firebaseUid: string): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (error || !data) {
      throw new NotFoundError("User not found");
    }

    return data;
  }

  /**
   * Create or update user from Firebase auth
   */
  async upsertUser(firebaseUid: string, input: {
    email?: string;
    phone?: string;
    full_name?: string;
    avatar_url?: string;
  }): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .upsert({
        firebase_uid: firebaseUid,
        email: input.email,
        phone: input.phone,
        full_name: input.full_name,
        avatar_url: input.avatar_url,
      }, {
        onConflict: "firebase_uid",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update user profile
   */
  async updateProfile(
    id: string,
    input: Partial<{
      full_name: string;
      phone: string;
      avatar_url: string;
    }>
  ): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("User not found");
    
    return data;
  }

  /**
   * Update user role (Root Admin only)
   */
  async updateRole(id: string, role: UserRole, brandId?: string): Promise<User> {
    const updateData: Record<string, unknown> = { role };
    
    // If setting brand manager, brand_id is required
    if (role === UserRole.BRAND_MANAGER && brandId) {
      updateData.brand_id = brandId;
    } else if (role !== UserRole.BRAND_MANAGER) {
      updateData.brand_id = null;
    }

    const { data, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("User not found");
    
    return data;
  }

  /**
   * Add address to user
   */
  async addAddress(userId: string, address: Address): Promise<User> {
    // Get current addresses
    const user = await this.getUserById(userId);
    const addresses = user.addresses || [];
    
    // If this is the first address or marked as default, set as default
    if (addresses.length === 0 || address.is_default) {
      addresses.forEach(addr => addr.is_default = false);
      address.is_default = true;
    }
    
    // Generate ID for address
    address.id = crypto.randomUUID();
    addresses.push(address);

    const { data, error } = await supabase
      .from("users")
      .update({ addresses })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update address
   */
  async updateAddress(userId: string, addressId: string, updates: Partial<Address>): Promise<User> {
    const user = await this.getUserById(userId);
    const addresses = user.addresses || [];
    
    const index = addresses.findIndex(addr => addr.id === addressId);
    if (index === -1) {
      throw new NotFoundError("Address not found");
    }

    // If setting as default, unset others
    if (updates.is_default) {
      addresses.forEach(addr => addr.is_default = false);
    }

    addresses[index] = { ...addresses[index], ...updates };

    const { data, error } = await supabase
      .from("users")
      .update({ addresses })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete address
   */
  async deleteAddress(userId: string, addressId: string): Promise<User> {
    const user = await this.getUserById(userId);
    const addresses = (user.addresses || []).filter(addr => addr.id !== addressId);

    const { data, error } = await supabase
      .from("users")
      .update({ addresses })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(id: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  }
}

export const usersService = new UsersService();

