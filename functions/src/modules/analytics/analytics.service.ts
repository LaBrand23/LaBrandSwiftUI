import { supabase } from "../../config/supabase";

export interface DashboardData {
  overview: {
    total_revenue: number;
    revenue_change: number;
    total_orders: number;
    orders_change: number;
    total_customers: number;
    customers_change: number;
    average_order_value: number;
    aov_change: number;
  };
  revenue_chart: Array<{ date: string; revenue: number }>;
  top_products: Array<{
    id: string;
    name: string;
    total_sold: number;
    revenue: number;
  }>;
  top_brands: Array<{
    id: string;
    name: string;
    total_orders: number;
    revenue: number;
  }>;
  orders_by_status: Record<string, number>;
  recent_orders: Array<{
    id: string;
    order_number: string;
    customer: { full_name: string };
    total: number;
    status: string;
    created_at: string;
  }>;
  low_stock_products: Array<{
    id: string;
    name: string;
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
  }>;
}

function getPeriodDays(period: string): number {
  switch (period) {
    case "7d":
      return 7;
    case "30d":
      return 30;
    case "90d":
      return 90;
    case "1y":
      return 365;
    default:
      return 30;
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function getDashboardData(period: string = "30d"): Promise<DashboardData> {
  const days = getPeriodDays(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  // Previous period for comparison
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);
  const prevStartDateStr = prevStartDate.toISOString();

  // Get current period orders
  const { data: currentOrders, error: ordersError } = await supabase
    .from("orders")
    .select("id, total, status, created_at")
    .gte("created_at", startDateStr);

  if (ordersError) {
    console.error("Error fetching current orders:", ordersError);
  }

  // Get previous period orders for comparison
  const { data: prevOrders } = await supabase
    .from("orders")
    .select("id, total")
    .gte("created_at", prevStartDateStr)
    .lt("created_at", startDateStr);

  // Get total customers
  const { count: totalCustomers } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "client");

  // Get previous period customers
  const { count: prevCustomers } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "client")
    .lt("created_at", startDateStr);

  // Calculate overview metrics
  const orders: any[] = currentOrders || [];
  const prevOrdersList: any[] = prevOrders || [];

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const prevRevenue = prevOrdersList.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
  const revenueChange = prevRevenue > 0
    ? ((totalRevenue - prevRevenue) / prevRevenue) * 100
    : 0;

  const totalOrdersCount = orders.length;
  const prevOrdersCount = prevOrdersList.length;
  const ordersChange = prevOrdersCount > 0
    ? ((totalOrdersCount - prevOrdersCount) / prevOrdersCount) * 100
    : 0;

  const customersChange = prevCustomers && prevCustomers > 0
    ? (((totalCustomers || 0) - prevCustomers) / prevCustomers) * 100
    : 0;

  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;
  const prevAOV = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;
  const aovChange = prevAOV > 0 ? ((averageOrderValue - prevAOV) / prevAOV) * 100 : 0;

  // Orders by status
  const ordersByStatus: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };
  orders.forEach((order: any) => {
    if (order.status && ordersByStatus[order.status] !== undefined) {
      ordersByStatus[order.status]++;
    }
  });

  // Get recent orders with customer info
  const { data: recentOrdersData } = await supabase
    .from("orders")
    .select(`
      id,
      order_number,
      total,
      status,
      created_at,
      user:users!orders_user_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get low stock products
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, sku, stock_quantity, low_stock_threshold")
    .order("stock_quantity", { ascending: true })
    .limit(100);

  const lowStockProducts = (allProducts || []).filter(
    (p: any) => (p.stock_quantity || 0) < (p.low_stock_threshold || 10)
  ).slice(0, 10);

  // Get top products by revenue
  const { data: topProductsData } = await supabase
    .from("order_items")
    .select(`
      product_id,
      quantity,
      price,
      product:products!order_items_product_id_fkey(id, name)
    `)
    .gte("created_at", startDateStr);

  // Aggregate top products
  const productMap = new Map<string, { id: string; name: string; total_sold: number; revenue: number }>();
  (topProductsData || []).forEach((item: any) => {
    const productId = item.product_id;
    const existing = productMap.get(productId);
    const revenue = (item.quantity || 0) * (item.price || 0);
    const productName = Array.isArray(item.product) ? item.product[0]?.name : item.product?.name;
    if (existing) {
      existing.total_sold += item.quantity || 0;
      existing.revenue += revenue;
    } else {
      productMap.set(productId, {
        id: productId,
        name: productName || "Unknown",
        total_sold: item.quantity || 0,
        revenue,
      });
    }
  });
  const topProductsList = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Format recent orders
  const recentOrders = (recentOrdersData || []).map((order: any) => {
    const userName = Array.isArray(order.user) ? order.user[0]?.full_name : order.user?.full_name;
    return {
      id: order.id,
      order_number: order.order_number,
      customer: { full_name: userName || "Unknown" },
      total: order.total,
      status: order.status,
      created_at: order.created_at,
    };
  });

  return {
    overview: {
      total_revenue: totalRevenue,
      revenue_change: Math.round(revenueChange * 10) / 10,
      total_orders: totalOrdersCount,
      orders_change: Math.round(ordersChange * 10) / 10,
      total_customers: totalCustomers || 0,
      customers_change: Math.round(customersChange * 10) / 10,
      average_order_value: Math.round(averageOrderValue),
      aov_change: Math.round(aovChange * 10) / 10,
    },
    revenue_chart: [],
    top_products: topProductsList,
    top_brands: [],
    orders_by_status: ordersByStatus,
    recent_orders: recentOrders,
    low_stock_products: lowStockProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku || "",
      stock_quantity: p.stock_quantity || 0,
      low_stock_threshold: p.low_stock_threshold || 10,
    })),
  };
}

export async function getBrandDashboardData(
  brandId: string,
  period: string = "30d"
): Promise<DashboardData> {
  const days = getPeriodDays(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString();

  // Get orders for this brand's products
  const { data: orderItemsData } = await supabase
    .from("order_items")
    .select(`
      id,
      quantity,
      price,
      created_at,
      order_id,
      product_id,
      order:orders!order_items_order_id_fkey(id, order_number, status, created_at, user:users!orders_user_id_fkey(full_name)),
      product:products!order_items_product_id_fkey(id, name, brand_id)
    `)
    .gte("created_at", startDateStr);

  // Filter items by brand - handle array joins
  const items = (orderItemsData || []).filter((item: any) => {
    const product = Array.isArray(item.product) ? item.product[0] : item.product;
    return product?.brand_id === brandId;
  });

  const totalRevenue = items.reduce((sum: number, item: any) => sum + (item.quantity || 0) * (item.price || 0), 0);
  const uniqueOrders = new Set(items.map((item: any) => {
    const order = Array.isArray(item.order) ? item.order[0] : item.order;
    return order?.id;
  }));
  const totalOrders = uniqueOrders.size;

  // Orders by status
  const ordersByStatus: Record<string, number> = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  const processedOrders = new Set<string>();
  items.forEach((item: any) => {
    const order = Array.isArray(item.order) ? item.order[0] : item.order;
    if (order && !processedOrders.has(order.id)) {
      processedOrders.add(order.id);
      if (order.status && ordersByStatus[order.status] !== undefined) {
        ordersByStatus[order.status]++;
      }
    }
  });

  // Get recent orders
  const recentOrdersMap = new Map<string, {
    id: string;
    order_number: string;
    customer: { full_name: string };
    total: number;
    status: string;
    created_at: string;
  }>();

  items.forEach((item: any) => {
    const order = Array.isArray(item.order) ? item.order[0] : item.order;
    if (order && !recentOrdersMap.has(order.id)) {
      const userName = Array.isArray(order.user) ? order.user[0]?.full_name : order.user?.full_name;
      recentOrdersMap.set(order.id, {
        id: order.id,
        order_number: order.order_number,
        customer: { full_name: userName || "Unknown" },
        total: (item.quantity || 0) * (item.price || 0),
        status: order.status,
        created_at: order.created_at,
      });
    }
  });

  const recentOrders = Array.from(recentOrdersMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  // Get low stock products for this brand
  const { data: brandProducts } = await supabase
    .from("products")
    .select("id, name, sku, stock_quantity, low_stock_threshold")
    .eq("brand_id", brandId)
    .order("stock_quantity", { ascending: true })
    .limit(100);

  const lowStockProducts = (brandProducts || []).filter(
    (p: any) => (p.stock_quantity || 0) < (p.low_stock_threshold || 10)
  ).slice(0, 10);

  return {
    overview: {
      total_revenue: totalRevenue,
      revenue_change: 0,
      total_orders: totalOrders,
      orders_change: 0,
      total_customers: 0,
      customers_change: 0,
      average_order_value: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      aov_change: 0,
    },
    revenue_chart: [],
    top_products: [],
    top_brands: [],
    orders_by_status: ordersByStatus,
    recent_orders: recentOrders,
    low_stock_products: lowStockProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      sku: p.sku || "",
      stock_quantity: p.stock_quantity || 0,
      low_stock_threshold: p.low_stock_threshold || 10,
    })),
  };
}
