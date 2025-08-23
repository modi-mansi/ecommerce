import { useState } from "react";
import { useLocation } from "wouter";
import { ProductCard } from "@/components/product/product-card";
import { ProductFiltersComponent } from "@/components/product/product-filters";
import { useProducts } from "@/hooks/use-products";
import { ProductFilters } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  
  const [filters, setFilters] = useState<ProductFilters>({
    category: urlParams.get("category") || undefined,
    search: urlParams.get("search") || undefined,
    inStock: urlParams.get("inStock") === "true" || undefined,
    sortBy: (urlParams.get("sortBy") as any) || "name",
    sortOrder: (urlParams.get("sortOrder") as any) || "asc",
  });

  const { data: products = [], isLoading, error } = useProducts(filters);

  // Sort products client-side since API doesn't handle all sorting
  const sortedProducts = [...products].sort((a, b) => {
    const { sortBy = "name", sortOrder = "asc" } = filters;
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "price":
        comparison = parseFloat(a.price) - parseFloat(b.price);
        break;
      case "rating":
        comparison = parseFloat(a.rating || "0") - parseFloat(b.rating || "0");
        break;
      default:
        comparison = 0;
    }

    return sortOrder === "desc" ? -comparison : comparison;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Products</h1>
            <p className="text-gray-600">Failed to load products. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Discover our amazing collection of products</p>
        </div>

        {/* Filters */}
        <ProductFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          totalProducts={sortedProducts.length}
          isLoading={isLoading}
        />

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="products-grid">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" data-testid="no-products">
            <div className="text-gray-500 text-lg">No products found</div>
            <p className="text-gray-400 mt-2">Try adjusting your filters or search terms</p>
          </div>
        )}

        {/* Pagination would go here in a real app */}
        {sortedProducts.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="text-sm text-gray-500">
              Showing {sortedProducts.length} products
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
