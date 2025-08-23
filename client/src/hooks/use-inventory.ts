import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";

export function useMetrics() {
  return useQuery({
    queryKey: ["/api/analytics/metrics"],
    queryFn: () => analyticsApi.getMetrics(),
  });
}
