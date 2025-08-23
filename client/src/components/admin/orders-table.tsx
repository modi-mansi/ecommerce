import { useState } from "react";
import { format } from "date-fns";
import { Eye, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order } from "@/types";
import { useUpdateOrderStatus, useCancelOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onViewOrder?: (order: Order) => void;
}

export function OrdersTable({ orders, isLoading, onViewOrder }: OrdersTableProps) {
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const updateOrderStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus.mutateAsync({ id: orderId, status: newStatus });
      toast({
        title: "Order updated",
        description: "Order status has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      await cancelOrder.mutateAsync(orderId);
      toast({
        title: "Order cancelled",
        description: "Order has been cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" data-testid="view-all-orders">
            View All Orders
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} data-testid={`order-row-${order.id}`}>
                  <TableCell>
                    <div className="font-medium" data-testid={`order-number-${order.id}`}>
                      {order.orderNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium" data-testid={`customer-name-${order.id}`}>
                        {order.customerName}
                      </div>
                      <div className="text-sm text-gray-500" data-testid={`customer-email-${order.id}`}>
                        {order.customerEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={getStatusColor(order.status)} 
                      data-testid={`order-status-${order.id}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium" data-testid={`order-total-${order.id}`}>
                    ${order.totalAmount}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500" data-testid={`order-date-${order.id}`}>
                    {format(new Date(order.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {onViewOrder && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewOrder(order)}
                          data-testid={`view-order-${order.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {order.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, "processing")}
                          disabled={updatingOrderId === order.id}
                          data-testid={`process-order-${order.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {(order.status === "pending" || order.status === "processing") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={updatingOrderId === order.id}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`cancel-order-${order.id}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {orders.length === 0 && (
            <div className="text-center py-8 text-gray-500" data-testid="no-orders">
              No orders found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
