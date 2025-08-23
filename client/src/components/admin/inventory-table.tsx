import { useState } from "react";
import { Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Product } from "@/types";
import { useUpdateProductStock } from "@/hooks/use-products";
import { useToast } from "@/hooks/use-toast";

interface InventoryTableProps {
  products: Product[];
  isLoading?: boolean;
}

export function InventoryTable({ products, isLoading }: InventoryTableProps) {
  const [restockDialogOpen, setRestockDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStock, setNewStock] = useState("");
  const updateStock = useUpdateProductStock();
  const { toast } = useToast();

  const lowStockProducts = products.filter(p => p.stockQuantity <= 10);

  const handleRestock = async () => {
    if (!selectedProduct || !newStock) return;

    const quantity = parseInt(newStock);
    if (isNaN(quantity) || quantity < 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateStock.mutateAsync({ id: selectedProduct.id, quantity });
      toast({
        title: "Stock updated",
        description: `${selectedProduct.name} stock updated to ${quantity}`,
      });
      setRestockDialogOpen(false);
      setSelectedProduct(null);
      setNewStock("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive",
      });
    }
  };

  const openRestockDialog = (product: Product) => {
    setSelectedProduct(product);
    setNewStock(product.stockQuantity.toString());
    setRestockDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Alert</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Low Stock Alert
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button data-testid="manage-inventory-button">
                  <Package className="h-4 w-4 mr-2" />
                  Manage Inventory
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Inventory Management</DialogTitle>
                </DialogHeader>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-10 h-10 object-cover rounded"
                              />
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-gray-500">${product.price}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{product.sku}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${
                              product.stockQuantity === 0 ? 'text-red-600' :
                              product.stockQuantity <= 5 ? 'text-orange-600' :
                              'text-green-600'
                            }`}>
                              {product.stockQuantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRestockDialog(product)}
                            >
                              Update Stock
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Min. Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map((product) => (
                  <TableRow key={product.id} data-testid={`low-stock-row-${product.id}`}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                          data-testid={`product-image-${product.id}`}
                        />
                        <div>
                          <div className="font-medium" data-testid={`product-name-${product.id}`}>
                            {product.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell data-testid={`product-sku-${product.id}`}>
                      {product.sku}
                    </TableCell>
                    <TableCell>
                      <span 
                        className={`font-medium ${
                          product.stockQuantity === 0 ? 'text-red-600' : 'text-orange-600'
                        }`}
                        data-testid={`current-stock-${product.id}`}
                      >
                        {product.stockQuantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500" data-testid={`min-stock-${product.id}`}>
                      10
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRestockDialog(product)}
                        data-testid={`restock-button-${product.id}`}
                      >
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {lowStockProducts.length === 0 && (
              <div className="text-center py-8 text-gray-500" data-testid="no-low-stock">
                No low stock items
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={restockDialogOpen} onOpenChange={setRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <Label>Product</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{selectedProduct.name}</div>
                  <div className="text-sm text-gray-500">SKU: {selectedProduct.sku}</div>
                  <div className="text-sm text-gray-500">Current Stock: {selectedProduct.stockQuantity}</div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newStock">New Stock Quantity</Label>
                <Input
                  id="newStock"
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Enter new stock quantity"
                  min="0"
                  data-testid="new-stock-input"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={handleRestock}
                  disabled={updateStock.isPending}
                  data-testid="confirm-restock-button"
                >
                  {updateStock.isPending ? "Updating..." : "Update Stock"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRestockDialogOpen(false)}
                  data-testid="cancel-restock-button"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
