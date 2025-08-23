import { useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CartItem } from "@/types";
import { useCart } from "@/context/cart-context";

interface CartItemProps {
  item: CartItem;
}

export function CartItemComponent({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const { updateQuantity, removeFromCart, isLoading } = useCart();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    await updateQuantity(item.productId, newQuantity);
  };

  const handleRemove = async () => {
    await removeFromCart(item.productId);
  };

  const itemTotal = parseFloat(item.product.price) * quantity;

  return (
    <Card className="mb-4" data-testid={`cart-item-${item.productId}`}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          {/* Product Image */}
          <img
            src={item.product.imageUrl}
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            data-testid={`cart-item-image-${item.productId}`}
          />

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate" data-testid={`cart-item-name-${item.productId}`}>
              {item.product.name}
            </h3>
            <p className="text-gray-600 mt-1" data-testid={`cart-item-sku-${item.productId}`}>
              SKU: {item.product.sku}
            </p>
            <div className="flex items-center mt-2">
              <span className="text-lg font-bold text-gray-900" data-testid={`cart-item-price-${item.productId}`}>
                ${item.product.price}
              </span>
              {item.product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2" data-testid={`cart-item-original-price-${item.productId}`}>
                  ${item.product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1 || isLoading}
              data-testid={`decrease-quantity-${item.productId}`}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value);
                if (newQuantity >= 1) {
                  handleQuantityChange(newQuantity);
                }
              }}
              className="w-20 text-center"
              min="1"
              data-testid={`quantity-input-${item.productId}`}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isLoading}
              data-testid={`increase-quantity-${item.productId}`}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Total Price */}
          <div className="text-right min-w-0">
            <div className="text-lg font-bold text-gray-900" data-testid={`cart-item-total-${item.productId}`}>
              ${itemTotal.toFixed(2)}
            </div>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isLoading}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            data-testid={`remove-item-${item.productId}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
