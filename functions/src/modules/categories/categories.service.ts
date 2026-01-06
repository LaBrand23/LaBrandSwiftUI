import supabase from "../../config/supabase";
import { Category } from "../../types";
import { NotFoundError } from "../../utils/errors";
import { generateSlug } from "../../utils/helpers";

export class CategoriesService {
  /**
   * Get all root categories with children (tree structure)
   */
  async getCategoryTree(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (error) throw error;

    // Build tree structure
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map
    data.forEach((cat: Category) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    data.forEach((cat: Category) => {
      const category = categoryMap.get(cat.id)!;
      if (cat.parent_id) {
        const parent = categoryMap.get(cat.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }

  /**
   * Get category by ID with children
   */
  async getCategoryById(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError("Category not found");
    }

    // Get children
    const { data: children } = await supabase
      .from("categories")
      .select("*")
      .eq("parent_id", id)
      .eq("is_active", true)
      .order("position", { ascending: true });

    return { ...data, children: children || [] };
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      throw new NotFoundError("Category not found");
    }

    return data;
  }

  /**
   * Get all child category IDs (recursive)
   */
  async getCategoryChildrenIds(categoryId: string): Promise<string[]> {
    const { data, error } = await supabase
      .rpc("get_category_children", { category_uuid: categoryId });

    if (error) throw error;
    return data || [categoryId];
  }

  /**
   * Create a new category (Admin only)
   */
  async createCategory(input: {
    name: string;
    parent_id?: string;
    image_url?: string;
    gender?: string;
    position?: number;
  }): Promise<Category> {
    const slug = generateSlug(input.name);

    // Check for duplicate slug under same parent
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .eq("parent_id", input.parent_id || null)
      .single();

    if (existing) {
      throw new Error("Category with this name already exists");
    }

    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: input.name,
        slug,
        parent_id: input.parent_id || null,
        image_url: input.image_url,
        gender: input.gender,
        position: input.position || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a category (Admin only)
   */
  async updateCategory(
    id: string,
    input: Partial<{
      name: string;
      image_url: string;
      position: number;
      is_active: boolean;
    }>
  ): Promise<Category> {
    const updateData: Record<string, unknown> = { ...input };
    
    if (input.name) {
      updateData.slug = generateSlug(input.name);
    }

    const { data, error } = await supabase
      .from("categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("Category not found");
    
    return data;
  }

  /**
   * Delete (deactivate) a category
   */
  async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  }
}

export const categoriesService = new CategoriesService();

