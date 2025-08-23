import { type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type CartItem, type InsertCartItem, type InventoryTransaction, type ProductWithStock, type OrderWithItems, type CartItemWithProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product operations
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySku(sku: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product>;
  updateProductStock(id: string, quantity: number): Promise<Product>;
  getLowStockProducts(threshold?: number): Promise<ProductWithStock[]>;

  // Order operations
  getAllOrders(): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined>;
  getOrdersByCustomer(customerId: string): Promise<OrderWithItems[]>;
  getOrdersByStatus(status: string): Promise<OrderWithItems[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  cancelOrder(id: string): Promise<Order>;

  // Cart operations
  getCartItems(userId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartQuantity(userId: string, productId: string, quantity: number): Promise<CartItem>;
  removeFromCart(userId: string, productId: string): Promise<void>;
  clearCart(userId: string): Promise<void>;

  // Inventory operations
  getInventoryTransactions(productId?: string, orderId?: string): Promise<InventoryTransaction[]>;
  recordInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>): Promise<InventoryTransaction>;

  // Analytics
  getOrderMetrics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem[]>;
  private cartItems: Map<string, CartItem[]>;
  private inventoryTransactions: Map<string, InventoryTransaction>;
  private nextOrderNumber: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.cartItems = new Map();
    this.inventoryTransactions = new Map();
    this.nextOrderNumber = 1;
    this.initializeData();
  }

  private initializeData() {
    // Create sample products
    const sampleProducts: Product[] = [
      {
        id: "prod-1",
        name: "Premium Wireless Headphones",
        description: "High-quality wireless headphones with active noise cancellation and 30-hour battery life.",
        sku: "HP-001",
        price: "299.99",
        originalPrice: "399.99",
        stockQuantity: 15,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.8",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-2",
        name: "Professional Laptop Pro",
        description: "High-performance laptop with 16GB RAM, 512GB SSD, and Intel i7 processor for professional work.",
        sku: "LP-002",
        price: "1299.99",
        originalPrice: null,
        stockQuantity: 8,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.9",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-3",
        name: "Athletic Running Shoes",
        description: "Lightweight running shoes with advanced cushioning and breathable mesh upper.",
        sku: "SH-003",
        price: "129.99",
        originalPrice: "159.99",
        stockQuantity: 3,
        category: "Sports",
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.7",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "prod-4",
        name: "Smartphone Pro Max",
        description: "Latest smartphone with advanced camera system, 5G connectivity, and all-day battery life.",
        sku: "SP-004",
        price: "899.99",
        originalPrice: null,
        stockQuantity: 0,
        category: "Electronics",
        imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        rating: "4.6",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Create sample user
    const sampleUser: User = {
      id: "user-1",
      username: "johndoe",
      password: "password123",
      email: "john.doe@email.com",
      firstName: "John",
      lastName: "Doe",
      role: "customer",
      createdAt: new Date(),
    };
    this.users.set(sampleUser.id, sampleUser);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Product operations
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySku(sku: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.sku === sku);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category && p.isActive);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(p => 
      p.isActive && (
        p.name.toLowerCase().includes(lowercaseQuery) ||
        p.description.toLowerCase().includes(lowercaseQuery) ||
        p.category.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { 
      ...insertProduct, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error('Product not found');
    }
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProductStock(id: string, quantity: number): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error('Product not found');
    }
    const updatedProduct = { ...product, stockQuantity: quantity, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async getLowStockProducts(threshold: number = 10): Promise<ProductWithStock[]> {
    return Array.from(this.products.values())
      .filter(p => p.isActive && p.stockQuantity <= threshold)
      .map(p => ({
        ...p,
        lowStock: p.stockQuantity <= threshold && p.stockQuantity > 0,
        outOfStock: p.stockQuantity === 0,
      }));
  }

  // Order operations
  async getAllOrders(): Promise<OrderWithItems[]> {
    return Array.from(this.orders.values()).map(order => ({
      ...order,
      items: this.orderItems.get(order.id) || [],
    }));
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    return {
      ...order,
      items: this.orderItems.get(id) || [],
    };
  }

  async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | undefined> {
    const order = Array.from(this.orders.values()).find(o => o.orderNumber === orderNumber);
    if (!order) return undefined;
    return {
      ...order,
      items: this.orderItems.get(order.id) || [],
    };
  }

  async getOrdersByCustomer(customerId: string): Promise<OrderWithItems[]> {
    return Array.from(this.orders.values())
      .filter(o => o.customerId === customerId)
      .map(order => ({
        ...order,
        items: this.orderItems.get(order.id) || [],
      }));
  }

  async getOrdersByStatus(status: string): Promise<OrderWithItems[]> {
    return Array.from(this.orders.values())
      .filter(o => o.status === status)
      .map(order => ({
        ...order,
        items: this.orderItems.get(order.id) || [],
      }));
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const id = randomUUID();
    const orderNumber = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.nextOrderNumber).padStart(3, '0')}`;
    this.nextOrderNumber++;

    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const orderItemsWithIds = items.map(item => ({
      ...item,
      id: randomUUID(),
      orderId: id,
    }));

    this.orders.set(id, order);
    this.orderItems.set(id, orderItemsWithIds);

    return {
      ...order,
      items: orderItemsWithIds,
    };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) {
      throw new Error('Order not found');
    }
    const updatedOrder = { ...order, status: status as any, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrderStatus(id, 'cancelled');
  }

  // Cart operations
  async getCartItems(userId: string): Promise<CartItemWithProduct[]> {
    const userCartItems = this.cartItems.get(userId) || [];
    return userCartItems.map(item => {
      const product = this.products.get(item.productId);
      if (!product) {
        throw new Error('Product not found');
      }
      return { ...item, product };
    });
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    const userCartItems = this.cartItems.get(insertItem.userId) || [];
    const existingItem = userCartItems.find(item => item.productId === insertItem.productId);

    if (existingItem) {
      existingItem.quantity += insertItem.quantity;
      return existingItem;
    } else {
      const newItem: CartItem = {
        ...insertItem,
        id: randomUUID(),
        createdAt: new Date(),
      };
      userCartItems.push(newItem);
      this.cartItems.set(insertItem.userId, userCartItems);
      return newItem;
    }
  }

  async updateCartQuantity(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const userCartItems = this.cartItems.get(userId) || [];
    const item = userCartItems.find(item => item.productId === productId);
    if (!item) {
      throw new Error('Cart item not found');
    }
    item.quantity = quantity;
    return item;
  }

  async removeFromCart(userId: string, productId: string): Promise<void> {
    const userCartItems = this.cartItems.get(userId) || [];
    const filteredItems = userCartItems.filter(item => item.productId !== productId);
    this.cartItems.set(userId, filteredItems);
  }

  async clearCart(userId: string): Promise<void> {
    this.cartItems.set(userId, []);
  }

  // Inventory operations
  async getInventoryTransactions(productId?: string, orderId?: string): Promise<InventoryTransaction[]> {
    let transactions = Array.from(this.inventoryTransactions.values());
    if (productId) {
      transactions = transactions.filter(t => t.productId === productId);
    }
    if (orderId) {
      transactions = transactions.filter(t => t.orderId === orderId);
    }
    return transactions;
  }

  async recordInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'createdAt'>): Promise<InventoryTransaction> {
    const id = randomUUID();
    const fullTransaction: InventoryTransaction = {
      ...transaction,
      id,
      createdAt: new Date(),
    };
    this.inventoryTransactions.set(id, fullTransaction);
    return fullTransaction;
  }

  // Analytics
  async getOrderMetrics(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    const orders = Array.from(this.orders.values());
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
    };
  }
}

export const storage = new MemStorage();
