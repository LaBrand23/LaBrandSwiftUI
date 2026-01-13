import supabase from "../../config/supabase";
import { Brand, Branch } from "../../types";
import { NotFoundError, ConflictError } from "../../utils/errors";
import { generateSlug, parsePagination, parseSort } from "../../utils/helpers";

export class BrandsService {
  /**
   * Get all brands with pagination
   */
  async getBrands(query: Record<string, unknown>): Promise<{ brands: Brand[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const { field, order } = parseSort(query, ["name", "created_at"], "name", "asc");

    const { data, error, count } = await supabase
      .from("brands")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order(field, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      brands: data || [],
      total: count || 0,
    };
  }

  /**
   * Get brand by ID with branches
   */
  async getBrandById(id: string): Promise<Brand & { branches: Branch[] }> {
    const { data: brand, error } = await supabase
      .from("brands")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !brand) {
      throw new NotFoundError("Brand not found");
    }

    const { data: branches } = await supabase
      .from("branches")
      .select("*")
      .eq("brand_id", id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    return { ...brand, branches: branches || [] };
  }

  /**
   * Get brand by slug
   */
  async getBrandBySlug(slug: string): Promise<Brand> {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      throw new NotFoundError("Brand not found");
    }

    return data;
  }

  /**
   * Create a new brand (Admin only)
   */
  async createBrand(input: {
    name: string;
    slug?: string;
    logo_url?: string;
    description?: string;
    website?: string;
    is_featured?: boolean;
  }): Promise<Brand> {
    // Use provided slug or generate from name
    const slug = input.slug || generateSlug(input.name);

    // Validate slug is not empty
    if (!slug) {
      throw new ConflictError("Brand name must contain valid characters");
    }

    // Check for duplicate
    const { data: existing } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      throw new ConflictError("Brand with this name already exists");
    }

    const { data, error } = await supabase
      .from("brands")
      .insert({
        name: input.name,
        slug,
        logo_url: input.logo_url || null,
        description: input.description || null,
        website: input.website || null,
        is_active: true,
        is_featured: input.is_featured || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating brand:", error);
      throw new ConflictError("Failed to create brand: " + error.message);
    }
    return data;
  }

  /**
   * Update a brand
   */
  async updateBrand(
    id: string,
    input: Partial<{
      name: string;
      logo_url: string;
      description: string;
      is_active: boolean;
    }>
  ): Promise<Brand> {
    const updateData: Record<string, unknown> = { ...input };
    
    if (input.name) {
      updateData.slug = generateSlug(input.name);
    }

    const { data, error } = await supabase
      .from("brands")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("Brand not found");
    
    return data;
  }

  /**
   * Delete (deactivate) a brand
   */
  async deleteBrand(id: string): Promise<void> {
    const { error } = await supabase
      .from("brands")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Get branches for a brand
   */
  async getBranches(brandId: string): Promise<Branch[]> {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("brand_id", brandId)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a branch for a brand
   */
  async createBranch(
    brandId: string,
    input: {
      name: string;
      address: string;
      city?: string;
      location?: { lat: number; lng: number };
      phone?: string;
      working_hours?: Record<string, string>;
    }
  ): Promise<Branch> {
    // Verify brand exists
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("id", brandId)
      .single();

    if (!brand) {
      throw new NotFoundError("Brand not found");
    }

    const { data, error } = await supabase
      .from("branches")
      .insert({
        brand_id: brandId,
        name: input.name,
        address: input.address,
        city: input.city,
        location: input.location,
        phone: input.phone,
        working_hours: input.working_hours,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a branch
   */
  async updateBranch(
    id: string,
    input: Partial<{
      name: string;
      address: string;
      city: string;
      location: { lat: number; lng: number };
      phone: string;
      working_hours: Record<string, string>;
      is_active: boolean;
    }>
  ): Promise<Branch> {
    const { data, error } = await supabase
      .from("branches")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("Branch not found");

    return data;
  }

  /**
   * Delete (deactivate) a branch
   */
  async deleteBranch(id: string): Promise<void> {
    const { error } = await supabase
      .from("branches")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Get a single branch by ID
   */
  async getBranchById(id: string): Promise<Branch> {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError("Branch not found");
    }

    return data;
  }

  /**
   * Assign a manager to a brand
   */
  async assignManager(brandId: string, userId: string): Promise<void> {
    // Check if user is already a manager of another brand
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, brand_id, role")
      .eq("id", userId)
      .single();

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    if (existingUser.brand_id && existingUser.brand_id !== brandId) {
      throw new ConflictError("User is already a manager of another brand");
    }

    // Update user's brand and role
    const { error } = await supabase
      .from("users")
      .update({ brand_id: brandId, role: "brand_manager" })
      .eq("id", userId);

    if (error) throw error;
  }

  /**
   * Remove manager from a brand
   */
  async removeManager(userId: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .update({ brand_id: null, role: "client" })
      .eq("id", userId);

    if (error) throw error;
  }
}

export const brandsService = new BrandsService();

