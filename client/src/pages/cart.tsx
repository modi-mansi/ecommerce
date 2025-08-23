import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useCreateOrder } from "@/hooks/use-orders";
import { CartItemComponent } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { ShoppingCart, ArrowLeft } from "lucide-react";

export default function Cart() {
  const { items, getTotalItems, getTotalPrice, clearCart, isLoading } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    address: "",
  });

  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to place an order",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || !shippingInfo.address) {
      toast({
        title: "Missing information",
        description: "Please fill in all shipping information",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderData = {
        order: {
          customerId: user.id,
          customerName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          customerEmail: shippingInfo.email,
          shippingAddress: shippingInfo.address,
        },
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      await createOrder.mutateAsync(orderData);
      await clearCart();
      
      toast({
        title: "Order placed successfully!",
        description: "Your order has been placed and is being processed.",
      });
    } catch (error) {
      toast({
        title: "Order failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
              <p className="text-gray-600 mb-6">You need to login to view your cart and place orders.</p>
              <Link href="/login">
                <Button data-testid="login-button">Login</Button>
              </Link>
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
          <div className="flex items-center space-x-4">
            <Link href="/products">
              <Button variant="ghost" size="sm" data-testid="back-to-products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
              <span className="text-lg text-gray-600" data-testid="cart-item-count">
                {getTotalItems()} items
              </span>
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2" data-testid="empty-cart-title">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started!</p>
              <Link href="/products">
                <Button data-testid="shop-now-button">Shop Now</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <CartItemComponent key={item.id} item={item} />
                  ))}
                </CardContent>
              </Card>

              {/* Shipping Information */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={shippingInfo.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        data-testid="first-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={shippingInfo.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                        data-testid="last-name-input"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john.doe@email.com"
                      data-testid="email-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Shipping Address</Label>
                    <Textarea
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Main Street, City, State, ZIP"
                      rows={3}
                      data-testid="address-input"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium" data-testid="cart-subtotal">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium" data-testid="cart-tax">
                        ${tax.toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900" data-testid="cart-total">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isLoading || createOrder.isPending || items.length === 0}
                    className="w-full"
                    size="lg"
                    data-testid="checkout-button"
                  >
                    {createOrder.isPending ? "Processing..." : "Proceed to Checkout"}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      disabled={isLoading || items.length === 0}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      data-testid="clear-cart-button"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
