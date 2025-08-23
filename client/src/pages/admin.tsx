import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useProducts } from "@/hooks/use-products";
import { useMetrics } from "@/hooks/use-inventory";
import { MetricsCards } from "@/components/admin/metrics-cards";
import { OrdersTable } from "@/components/admin/orders-table";
import { InventoryTable } from "@/components/admin/inventory-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Order } from "@/types";
import { BarChart3, Package, ShoppingCart, Users, Settings, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Admin() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

  const { data: metrics, isLoading: metricsLoading } = useMetrics();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: products = [], isLoading: productsLoading } = useProducts();

  // Get recent orders (last 10)
  const recentOrders = orders.slice(0, 10);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="flex">
        <div className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-16 z-40">
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Admin Panel</h2>
            <nav className="space-y-2">
              <a href="#dashboard" className="flex items-center space-x-3 text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
              <a href="#orders" className="flex items-center space-x-3 text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </a>
              <a href="#inventory" className="flex items-center space-x-3 text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                <Package className="h-5 w-5" />
                <span>Inventory</span>
              </a>
              <a href="#analytics" className="flex items-center space-x-3 text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                <TrendingUp className="h-5 w-5" />
                <span>Analytics</span>
              </a>
              <a href="#settings" className="flex items-center space-x-3 text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </a>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Monitor your ecommerce operations</p>
          </div>

          {/* Metrics Cards */}
          {metrics && (
            <MetricsCards metrics={metrics} isLoading={metricsLoading} />
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="orders" data-testid="tab-orders">Orders</TabsTrigger>
              <TabsTrigger value="inventory" data-testid="tab-inventory">Inventory</TabsTrigger>
              <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Recent Orders */}
              <OrdersTable
                orders={recentOrders}
                isLoading={ordersLoading}
                onViewOrder={handleViewOrder}
              />

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">API</div>
                      <div className="text-sm text-green-600" data-testid="api-status">Operational</div>
                      <div className="text-xs text-gray-500 mt-1">Uptime: 99.9%</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">Database</div>
                      <div className="text-sm text-green-600" data-testid="database-status">Healthy</div>
                      <div className="text-xs text-gray-500 mt-1">Response: 15ms</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full"></div>
                      </div>
                      <div className="text-lg font-semibold text-gray-900">Storage</div>
                      <div className="text-sm text-green-600" data-testid="storage-status">Available</div>
                      <div className="text-xs text-gray-500 mt-1">Usage: 45%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <OrdersTable
                orders={orders}
                isLoading={ordersLoading}
                onViewOrder={handleViewOrder}
              />
            </TabsContent>

            <TabsContent value="inventory">
              <InventoryTable
                products={products}
                isLoading={productsLoading}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Sales charts and analytics would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Performance metrics would be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Information */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Order Number:</strong> 
                    <span className="ml-2" data-testid="admin-modal-order-number">{selectedOrder.orderNumber}</span>
                  </div>
                  <div>
                    <strong>Status:</strong> 
                    <span className="ml-2 capitalize" data-testid="admin-modal-order-status">{selectedOrder.status}</span>
                  </div>
                  <div>
                    <strong>Customer:</strong> 
                    <span className="ml-2" data-testid="admin-modal-customer-name">{selectedOrder.customerName}</span>
                  </div>
                  <div>
                    <strong>Email:</strong> 
                    <span className="ml-2" data-testid="admin-modal-customer-email">{selectedOrder.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                <p className="text-sm text-gray-600" data-testid="admin-modal-shipping-address">
                  {selectedOrder.shippingAddress}
                </p>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900" data-testid={`admin-modal-item-name-${item.id}`}>
                          {item.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          SKU: <span data-testid={`admin-modal-item-sku-${item.id}`}>{item.productSku}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          <span data-testid={`admin-modal-item-quantity-${item.id}`}>{item.quantity}</span> × 
                          <span data-testid={`admin-modal-item-price-${item.id}`}> ${item.unitPrice}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Total: <span data-testid={`admin-modal-item-total-${item.id}`}>${item.totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-semibold text-gray-900">
                    Total: <span data-testid="admin-modal-order-total">${selectedOrder.totalAmount}</span>
                  </div>
                  <Button
                    onClick={() => setOrderDetailsOpen(false)}
                    data-testid="admin-close-modal-button"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
