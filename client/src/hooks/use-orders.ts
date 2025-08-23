import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";
import { Order } from "@/types";

export function useOrders(filters?: { status?: string; customerId?: string }) {
  return useQuery({
    queryKey: ["/api/orders", filters],
    queryFn: () => ordersApi.getAll(filters),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["/api/orders", id],
    queryFn: () => ordersApi.getById(id),
    enabled: !!id,
  });
}

export function useOrderByNumber(orderNumber: string) {
  return useQuery({
    queryKey: ["/api/orders/number", orderNumber],
    queryFn: () => ordersApi.getByNumber(orderNumber),
    enabled: !!orderNumber,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (orderData: {
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
    }) => ordersApi.create(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/metrics"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/metrics"] });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => ordersApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/metrics"] });
    },
  });
}
