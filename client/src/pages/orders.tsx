import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/context/auth-context";
import { OrderCard } from "@/components/order/order-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Package, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Orders() {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const { toast } = useToast();

  const filters = statusFilter === "all" ? { customerId: user?.id } : { status: statusFilter, customerId: user?.id };
  const { data: orders = [], isLoading, error } = useOrders(filters);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  const handleCancelOrder = async (order: Order) => {
    // This would typically call the cancel order API
    toast({
      title: "Order cancellation requested",
      description: `Order ${order.orderNumber} cancellation has been requested.`,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
              <p className="text-gray-600 mb-6">You need to login to view your orders.</p>
              <Link href="/login">
                <Button data-testid="login-button">Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Orders</h2>
              <p className="text-gray-600">Failed to load your orders. Please try again later.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your orders</p>
          </div>
          <div className="flex space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="status-filter">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6" data-testid="orders-list">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                onCancel={handleCancelOrder}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="no-orders-title">
                {statusFilter === "all" ? "No orders yet" : `No ${statusFilter} orders`}
              </h2>
              <p className="text-gray-600 mb-6">
                {statusFilter === "all" 
                  ? "Start shopping to see your orders here!"
                  : `You don't have any ${statusFilter} orders.`}
              </p>
              {statusFilter === "all" && (
                <Link href="/products">
                  <Button data-testid="start-shopping-button">Start Shopping</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination would go here in a real app */}
        {orders.length > 0 && (
          <div className="flex justify-center mt-8">
            <div className="text-sm text-gray-500">
              Showing {orders.length} orders
            </div>
          </div>
        )}

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
                      <span className="ml-2" data-testid="modal-order-number">{selectedOrder.orderNumber}</span>
                    </div>
                    <div>
                      <strong>Status:</strong> 
                      <span className="ml-2 capitalize" data-testid="modal-order-status">{selectedOrder.status}</span>
                    </div>
                    <div>
                      <strong>Customer:</strong> 
                      <span className="ml-2" data-testid="modal-customer-name">{selectedOrder.customerName}</span>
                    </div>
                    <div>
                      <strong>Email:</strong> 
                      <span className="ml-2" data-testid="modal-customer-email">{selectedOrder.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                  <p className="text-sm text-gray-600" data-testid="modal-shipping-address">
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
                          <div className="font-medium text-gray-900" data-testid={`modal-item-name-${item.id}`}>
                            {item.productName}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: <span data-testid={`modal-item-sku-${item.id}`}>{item.productSku}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            <span data-testid={`modal-item-quantity-${item.id}`}>{item.quantity}</span> × 
                            <span data-testid={`modal-item-price-${item.id}`}> ${item.unitPrice}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            Total: <span data-testid={`modal-item-total-${item.id}`}>${item.totalPrice}</span>
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
                      Total: <span data-testid="modal-order-total">${selectedOrder.totalAmount}</span>
                    </div>
                    <Button
                      onClick={() => setOrderDetailsOpen(false)}
                      data-testid="close-modal-button"
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
    </div>
  );
}
