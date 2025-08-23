import { useState } from "react";
import { Star, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addToCart, isLoading } = useCart();
  const { toast } = useToast();

  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  const handleAddToCart = async () => {
    if (product.stockQuantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    await addToCart(product.id);
  };

  const getStockStatus = () => {
    if (product.stockQuantity === 0) {
      return { color: "bg-red-500", text: "Out of Stock" };
    } else if (product.stockQuantity <= 5) {
      return { color: "bg-orange-500", text: `Low Stock: ${product.stockQuantity}` };
    } else {
      return { color: "bg-green-500", text: `Stock: ${product.stockQuantity}` };
    }
  };

  const stockStatus = getStockStatus();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1" data-testid={`product-card-${product.id}`}>
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`w-full h-48 object-cover transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          data-testid={`product-image-${product.id}`}
        />
        {!imageLoaded && (
          <div className="w-full h-48 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading...</div>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {hasDiscount && (
            <Badge variant="destructive" className="text-xs">
              {discountPercentage}% OFF
            </Badge>
          )}
          {product.category === "Electronics" && (
            <Badge variant="secondary" className="text-xs">
              NEW
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        {/* Product Info */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1" data-testid={`product-name-${product.id}`}>
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex items-center text-sm text-gray-500 ml-2">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span className="ml-1" data-testid={`product-rating-${product.id}`}>{product.rating}</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2" data-testid={`product-description-${product.id}`}>
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900" data-testid={`product-price-${product.id}`}>
              ${product.price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through" data-testid={`product-original-price-${product.id}`}>
                ${product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-sm">
            <div className={`w-2 h-2 ${stockStatus.color} rounded-full mr-2`}></div>
            <span className="text-gray-600" data-testid={`product-stock-${product.id}`}>
              {stockStatus.text}
            </span>
          </div>
          <span className="text-xs text-gray-500" data-testid={`product-sku-${product.id}`}>
            SKU: {product.sku}
          </span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0 || isLoading}
          className="w-full"
          data-testid={`add-to-cart-${product.id}`}
        >
          {product.stockQuantity === 0 ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isLoading ? "Adding..." : "Add to Cart"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
