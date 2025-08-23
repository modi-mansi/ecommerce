import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Order } from "@/types";
import { Eye, X } from "lucide-react";
import { format } from "date-fns";

interface OrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
  onCancel?: (order: Order) => void;
  showActions?: boolean;
}

export function OrderCard({ order, onViewDetails, onCancel, showActions = true }: OrderCardProps) {
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

  const canCancel = order.status === "pending" || order.status === "processing";

  return (
    <Card className="mb-4" data-testid={`order-card-${order.id}`}>
      <CardContent className="p-6">
        {/* Order Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-900" data-testid={`order-number-${order.id}`}>
              {order.orderNumber}
            </h3>
            <Badge className={getStatusColor(order.status)} data-testid={`order-status-${order.id}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900" data-testid={`order-total-${order.id}`}>
              ${order.totalAmount}
            </div>
            <div className="text-sm text-gray-500" data-testid={`order-date-${order.id}`}>
              {format(new Date(order.createdAt), "MMM dd, yyyy")}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3" data-testid={`order-item-${item.id}`}>
              <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-xs text-gray-500">IMG</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate" data-testid={`item-name-${item.id}`}>
                  {item.productName}
                </div>
                <div className="text-sm text-gray-500">
                  Qty: <span data-testid={`item-quantity-${item.id}`}>{item.quantity}</span> × 
                  <span data-testid={`item-price-${item.id}`}> ${item.unitPrice}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Progress steps would go here - simplified for this example */}
              <div className="text-sm text-gray-600">
                Status: <span className="font-medium">{order.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <div className="font-medium text-gray-900">Customer</div>
            <div className="text-gray-600" data-testid={`customer-name-${order.id}`}>{order.customerName}</div>
            <div className="text-gray-600" data-testid={`customer-email-${order.id}`}>{order.customerEmail}</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Shipping Address</div>
            <div className="text-gray-600" data-testid={`shipping-address-${order.id}`}>
              {order.shippingAddress}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(order)}
                  data-testid={`view-details-${order.id}`}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}
              {onCancel && canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancel(order)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  data-testid={`cancel-order-${order.id}`}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Order
                </Button>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Expected delivery: <strong>
                {format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), "MMM dd, yyyy")}
              </strong>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
