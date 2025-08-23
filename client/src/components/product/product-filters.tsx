import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProductFilters } from "@/types";

interface ProductFiltersProps {
  filters: ProductFilters;
  onFiltersChange: (filters: ProductFilters) => void;
  totalProducts?: number;
  isLoading?: boolean;
}

export function ProductFiltersComponent({ 
  filters, 
  onFiltersChange, 
  totalProducts = 0,
  isLoading = false 
}: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput.trim() || undefined });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category: category === "all" ? undefined : category });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split("-") as [string, "asc" | "desc"];
    onFiltersChange({ ...filters, sortBy: sortBy as any, sortOrder });
  };

  const handleInStockChange = (checked: boolean) => {
    onFiltersChange({ ...filters, inStock: checked || undefined });
  };

  const clearFilters = () => {
    setSearchInput("");
    onFiltersChange({});
  };

  const getSortValue = () => {
    if (filters.sortBy && filters.sortOrder) {
      return `${filters.sortBy}-${filters.sortOrder}`;
    }
    return "name-asc";
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                  data-testid="product-search-input"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </form>

            {/* Category Filter */}
            <Select 
              value={filters.category || "all"} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full sm:w-48" data-testid="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Clothing">Clothing</SelectItem>
                <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={getSortValue()} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-48" data-testid="sort-filter">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name: A to Z</SelectItem>
                <SelectItem value="name-desc">Name: Z to A</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating-desc">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {/* In Stock Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={filters.inStock || false}
                onCheckedChange={handleInStockChange}
                data-testid="in-stock-filter"
              />
              <Label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                In Stock Only
              </Label>
            </div>
          </div>

          {/* Results Info and Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="text-sm text-gray-600" data-testid="products-count">
              {isLoading ? (
                "Loading..."
              ) : (
                `Showing ${totalProducts} products`
              )}
            </div>

            {/* Clear Filters */}
            {(filters.search || filters.category || filters.inStock || filters.sortBy) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                data-testid="clear-filters-button"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
