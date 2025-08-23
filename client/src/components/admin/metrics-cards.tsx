import { Card, CardContent } from "@/components/ui/card";
import { Metrics } from "@/types";
import { TrendingUp, ShoppingCart, DollarSign, Package, AlertTriangle } from "lucide-react";

interface MetricsCardsProps {
  metrics: Metrics;
  isLoading?: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Orders",
      value: metrics.totalOrders,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeColor: "text-green-600",
      testId: "metric-total-orders"
    },
    {
      title: "Revenue",
      value: `$${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+8%",
      changeColor: "text-green-600",
      testId: "metric-revenue"
    },
    {
      title: "Low Stock Items",
      value: metrics.lowStockCount,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "Requires attention",
      changeColor: "text-orange-600",
      testId: "metric-low-stock"
    },
    {
      title: "Completed Orders",
      value: metrics.completedOrders,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+15%",
      changeColor: "text-green-600",
      testId: "metric-completed-orders"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div className={`text-sm ${card.changeColor}`}>
                  {card.change}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1" data-testid={card.testId}>
                {card.value}
              </div>
              <div className="text-gray-600">{card.title}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
