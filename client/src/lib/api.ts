import { Product, Order, CartItem, Metrics, ProductFilters } from "@/types";

const API_BASE = "/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("auth_token");
  
  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Network error occurred");
  }
}

export const productsApi = {
  getAll: (filters?: ProductFilters): Promise<Product[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.set("category", filters.category);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.inStock) params.set("inStock", "true");
    
    const query = params.toString();
    return apiRequest(`/products${query ? `?${query}` : ""}`);
  },

  getById: (id: string): Promise<Product> =>
    apiRequest(`/products/${id}`),

  create: (product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> =>
    apiRequest("/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),

  update: (id: string, updates: Partial<Product>): Promise<Product> =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    }),

  updateStock: (id: string, quantity: number): Promise<Product> =>
    apiRequest(`/products/${id}/stock`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  getLowStock: (threshold?: number): Promise<Product[]> => {
    const params = threshold ? `?threshold=${threshold}` : "";
    return apiRequest(`/products/low-stock${params}`);
  },
};

export const ordersApi = {
  getAll: (filters?: { status?: string; customerId?: string }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.customerId) params.set("customerId", filters.customerId);
    
    const query = params.toString();
    return apiRequest(`/orders${query ? `?${query}` : ""}`);
  },

  getById: (id: string): Promise<Order> =>
    apiRequest(`/orders/${id}`),

  getByNumber: (orderNumber: string): Promise<Order> =>
    apiRequest(`/orders/number/${orderNumber}`),

  create: (orderData: {
    order: {
      customerId: string;
      customerName: string;
      customerEmail: string;
      shippingAddress: string;
    };
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }): Promise<Order> =>
    apiRequest("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),

  updateStatus: (id: string, status: string): Promise<Order> =>
    apiRequest(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  cancel: (id: string): Promise<Order> =>
    apiRequest(`/orders/${id}/cancel`, {
      method: "POST",
    }),
};

export const cartApi = {
  getItems: (userId: string): Promise<CartItem[]> =>
    apiRequest(`/cart/${userId}`),

  addItem: (userId: string, productId: string, quantity: number): Promise<CartItem> =>
    apiRequest("/cart", {
      method: "POST",
      body: JSON.stringify({ userId, productId, quantity }),
    }),

  updateQuantity: (userId: string, productId: string, quantity: number): Promise<CartItem> =>
    apiRequest(`/cart/${userId}/${productId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (userId: string, productId: string): Promise<void> =>
    apiRequest(`/cart/${userId}/${productId}`, {
      method: "DELETE",
    }),

  clear: (userId: string): Promise<void> =>
    apiRequest(`/cart/${userId}`, {
      method: "DELETE",
    }),
};

export const analyticsApi = {
  getMetrics: (): Promise<Metrics> =>
    apiRequest("/analytics/metrics"),
};

export const authApi = {
  login: (username: string, password: string): Promise<{
    user: any;
    access_token: string;
    message: string;
  }> =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<{
    user: any;
    access_token: string;
    message: string;
  }> =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getCurrentUser: (): Promise<{ user: any }> =>
    apiRequest("/auth/me"),
};

export { ApiError };
