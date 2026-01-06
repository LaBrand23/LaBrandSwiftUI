import supabase from "../../config/supabase";
import { db } from "../../config/firebase";
import { Order } from "../../types";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { parsePagination, parseSort, formatPrice, calculateDiscount } from "../../utils/helpers";
import { OrderStatus, UserRole } from "../../config/constants";

interface CreateOrderInput {
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
  }>;
  shipping_address: {
    full_name: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  promo_code?: string;
  notes?: string;
}

export class OrdersService {
  /**
   * Get orders with role-based filtering
   */
  async getOrders(
    query: Record<string, unknown>,
    userId: string,
    userRole: UserRole,
    userBrandId?: string | null
  ): Promise<{ orders: Order[]; total: number }> {
    const { limit, offset } = parsePagination(query);
    const { field, order } = parseSort(
      query,
      ["created_at", "total", "status"],
      "created_at",
      "desc"
    );

    let queryBuilder = supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*)
      `, { count: "exact" });

    // Role-based filtering
    if (userRole === UserRole.CLIENT) {
      queryBuilder = queryBuilder.eq("user_id", userId);
    } else if (userRole === UserRole.BRAND_MANAGER && userBrandId) {
      queryBuilder = queryBuilder.eq("brand_id", userBrandId);
    }
    // Admins see all orders

    // Filter by status if specified
    if (query.status) {
      queryBuilder = queryBuilder.eq("status", query.status);
    }

    const { data, error, count } = await queryBuilder
      .order(field, { ascending: order === "asc" })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      orders: data || [],
      total: count || 0,
    };
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items(*),
        user:users(id, full_name, email, phone)
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      throw new NotFoundError("Order not found");
    }

    return data;
  }

  /**
   * Create a new order
   */
  async createOrder(userId: string, input: CreateOrderInput): Promise<Order> {
    // Get product details for items
    const productIds = input.items.map((item) => item.product_id);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select(`
        id, name, price, sale_price, brand_id,
        variants:product_variants(id, size, color, stock, price_adjustment)
      `)
      .in("id", productIds);

    if (productsError || !products) {
      throw new BadRequestError("Failed to fetch products");
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems: Array<{
      product_id: string;
      variant_id: string | null;
      product_name: string;
      variant_info: { size?: string; color?: string } | null;
      quantity: number;
      unit_price: number;
      total_price: number;
    }> = [];

    let brandId: string | null = null;

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product) {
        throw new BadRequestError(`Product ${item.product_id} not found`);
      }

      // Set brand_id from first product (assuming single-brand orders)
      if (!brandId) {
        brandId = product.brand_id;
      }

      let unitPrice = product.sale_price || product.price;
      let variantInfo = null;

      if (item.variant_id) {
        const variant = product.variants?.find((v: { id: string }) => v.id === item.variant_id);
        if (!variant) {
          throw new BadRequestError(`Variant ${item.variant_id} not found`);
        }
        if (variant.stock < item.quantity) {
          throw new BadRequestError(`Insufficient stock for ${product.name}`);
        }
        unitPrice += variant.price_adjustment || 0;
        variantInfo = { size: variant.size, color: variant.color };
      }

      const totalPrice = formatPrice(unitPrice * item.quantity);
      subtotal += totalPrice;

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id || null,
        product_name: product.name,
        variant_info: variantInfo,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      });
    }

    // Apply promo code if provided
    let discount = 0;
    if (input.promo_code) {
      const { data: promo } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", input.promo_code)
        .eq("is_active", true)
        .single();

      if (promo) {
        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
          throw new BadRequestError("Promo code has expired");
        }
        if (promo.usage_limit && promo.used_count >= promo.usage_limit) {
          throw new BadRequestError("Promo code usage limit reached");
        }
        if (subtotal < promo.min_order_amount) {
          throw new BadRequestError(`Minimum order amount is ${promo.min_order_amount}`);
        }

        discount = calculateDiscount(
          subtotal,
          promo.discount_type,
          promo.discount_value,
          promo.max_discount
        );

        // Increment promo code usage
        await supabase
          .from("promo_codes")
          .update({ used_count: promo.used_count + 1 })
          .eq("id", promo.id);
      }
    }

    const shippingFee = 0; // Free shipping for now
    const total = formatPrice(subtotal - discount + shippingFee);

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        brand_id: brandId,
        status: OrderStatus.PENDING,
        subtotal: formatPrice(subtotal),
        shipping_fee: shippingFee,
        discount: formatPrice(discount),
        total,
        shipping_address: input.shipping_address,
        promo_code: input.promo_code,
        notes: input.notes,
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error("Failed to create order");
    }

    // Create order items
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

    if (itemsError) {
      // Rollback order
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error("Failed to create order items");
    }

    // Update stock quantities
    for (const item of input.items) {
      if (item.variant_id) {
        await supabase.rpc("decrement_variant_stock", {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        });
      } else {
        await supabase.rpc("decrement_product_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
      }
    }

    // Sync to Firestore for real-time updates
    await db.collection("orders").doc(order.id).set({
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      user_id: userId,
    });

    return { ...order, items: orderItems };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    userId: string,
    userRole: UserRole,
    userBrandId?: string | null
  ): Promise<Order> {
    // Get current order
    const order = await this.getOrderById(id);

    // Role-based access check
    if (userRole === UserRole.CLIENT) {
      if (order.user_id !== userId) {
        throw new BadRequestError("You can only access your own orders");
      }
      // Clients can only cancel
      if (status !== OrderStatus.CANCELLED) {
        throw new BadRequestError("You can only cancel orders");
      }
      if (order.status !== OrderStatus.PENDING) {
        throw new BadRequestError("Only pending orders can be cancelled");
      }
    } else if (userRole === UserRole.BRAND_MANAGER) {
      if (order.brand_id !== userBrandId) {
        throw new BadRequestError("You can only manage your brand's orders");
      }
    }

    // Update status
    const { data, error } = await supabase
      .from("orders")
      .update({ 
        status,
        delivered_at: status === OrderStatus.DELIVERED ? new Date().toISOString() : null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update Firestore for real-time
    await db.collection("orders").doc(id).update({
      status,
      updated_at: new Date().toISOString(),
    });

    return data;
  }

  /**
   * Cancel order
   */
  async cancelOrder(id: string, userId: string): Promise<Order> {
    return this.updateOrderStatus(id, OrderStatus.CANCELLED, userId, UserRole.CLIENT);
  }
}

export const ordersService = new OrdersService();

