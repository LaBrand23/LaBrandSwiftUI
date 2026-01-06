import supabase from "../../config/supabase";
import { Product, ProductVariant, ProductImage } from "../../types";
import { NotFoundError } from "../../utils/errors";
import { generateSlug, parsePagination, parseSort } from "../../utils/helpers";

interface ProductFilters {
  category_id?: string;
  brand_id?: string;
  is_new?: boolean;
  is_featured?: boolean;
  is_on_sale?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
}

export class ProductsService {
  /**
   * Get products with filters and pagination
   */
  async getProducts(
    query: Record<string, unknown>,
    filters: ProductFilters = {}
  ): Promise<{ products: Product[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const { field, order } = parseSort(
      query,
      ["name", "price", "created_at", "rating_average"],
      "created_at",
      "desc"
    );

    let queryBuilder = supabase
      .from("products")
      .select(`
        *,
        brand:brands(id, name, slug),
        category:categories(id, name, slug),
        images:product_images(*)
      `, { count: "exact" })
      .eq("is_active", true);

    // Apply filters
    if (filters.category_id) {
      // Get all child categories for recursive filtering
      const { data: childIds } = await supabase
        .rpc("get_category_children", { category_uuid: filters.category_id });
      
      if (childIds && childIds.length > 0) {
        queryBuilder = queryBuilder.in("category_id", childIds);
      }
    }

    if (filters.brand_id) {
      queryBuilder = queryBuilder.eq("brand_id", filters.brand_id);
    }

    if (filters.is_new !== undefined) {
      queryBuilder = queryBuilder.eq("is_new", filters.is_new);
    }

    if (filters.is_featured !== undefined) {
      queryBuilder = queryBuilder.eq("is_featured", filters.is_featured);
    }

    if (filters.is_on_sale !== undefined) {
      queryBuilder = queryBuilder.eq("is_on_sale", filters.is_on_sale);
    }

    if (filters.min_price !== undefined) {
      queryBuilder = queryBuilder.gte("price", filters.min_price);
    }

    if (filters.max_price !== undefined) {
      queryBuilder = queryBuilder.lte("price", filters.max_price);
    }

    if (filters.search) {
      queryBuilder = queryBuilder.ilike("name", `%${filters.search}%`);
    }

    // Apply sorting and pagination
    const { data, error, count } = await queryBuilder
      .order(field, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      products: data || [],
      total: count || 0,
    };
  }

  /**
   * Get product by ID with full details
   */
  async getProductById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        brand:brands(id, name, slug, logo_url),
        category:categories(id, name, slug),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError("Product not found");
    }

    return data;
  }

  /**
   * Get product by slug
   */
  async getProductBySlug(brandSlug: string, productSlug: string): Promise<Product> {
    // First get the brand
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", brandSlug)
      .single();

    if (!brand) {
      throw new NotFoundError("Brand not found");
    }

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        brand:brands(id, name, slug, logo_url),
        category:categories(id, name, slug),
        variants:product_variants(*),
        images:product_images(*)
      `)
      .eq("brand_id", brand.id)
      .eq("slug", productSlug)
      .single();

    if (error || !data) {
      throw new NotFoundError("Product not found");
    }

    return data;
  }

  /**
   * Create a product (Brand Manager)
   */
  async createProduct(
    brandId: string,
    input: {
      name: string;
      category_id: string;
      description?: string;
      price: number;
      sale_price?: number;
      is_new?: boolean;
      is_featured?: boolean;
      stock_quantity?: number;
    }
  ): Promise<Product> {
    const slug = generateSlug(input.name);

    const { data, error } = await supabase
      .from("products")
      .insert({
        brand_id: brandId,
        category_id: input.category_id,
        name: input.name,
        slug,
        description: input.description,
        price: input.price,
        sale_price: input.sale_price,
        is_new: input.is_new || false,
        is_featured: input.is_featured || false,
        is_on_sale: input.sale_price ? true : false,
        stock_quantity: input.stock_quantity || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a product
   */
  async updateProduct(
    id: string,
    input: Partial<{
      name: string;
      category_id: string;
      description: string;
      price: number;
      sale_price: number | null;
      is_new: boolean;
      is_featured: boolean;
      stock_quantity: number;
      is_active: boolean;
    }>
  ): Promise<Product> {
    const updateData: Record<string, unknown> = { ...input };
    
    if (input.name) {
      updateData.slug = generateSlug(input.name);
    }

    if (input.sale_price !== undefined) {
      updateData.is_on_sale = input.sale_price !== null;
    }

    const { data, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("Product not found");
    
    return data;
  }

  /**
   * Delete (deactivate) a product
   */
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  }

  /**
   * Add a variant to a product
   */
  async addVariant(
    productId: string,
    input: {
      size?: string;
      color?: string;
      color_hex?: string;
      stock?: number;
      sku?: string;
      price_adjustment?: number;
    }
  ): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from("product_variants")
      .insert({
        product_id: productId,
        ...input,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a variant
   */
  async updateVariant(
    id: string,
    input: Partial<ProductVariant>
  ): Promise<ProductVariant> {
    const { data, error } = await supabase
      .from("product_variants")
      .update(input)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new NotFoundError("Variant not found");
    
    return data;
  }

  /**
   * Add an image to a product
   */
  async addImage(
    productId: string,
    input: {
      image_url: string;
      alt_text?: string;
      position?: number;
      is_primary?: boolean;
    }
  ): Promise<ProductImage> {
    // If this is primary, unset other primaries
    if (input.is_primary) {
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId);
    }

    const { data, error } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        ...input,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete an image
   */
  async deleteImage(id: string): Promise<void> {
    const { error } = await supabase
      .from("product_images")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}

export const productsService = new ProductsService();

