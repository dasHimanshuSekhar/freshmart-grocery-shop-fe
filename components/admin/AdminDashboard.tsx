"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Package, ShoppingBag, Bell, Users } from "lucide-react";
import { toast } from "sonner";

const API_BASE_URL = "http://localhost:8080/api";

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
}

interface Order {
  id: string;
  customerId: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  totalAmount: number;
  status: string;
  orderDate: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", imageUrl: "" });
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", categoryId: "", imageUrl: "", stockQuantity: "", unit: ""
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryForm.name) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Category created successfully");
        setCategoryForm({ name: "", description: "", imageUrl: "" });
        fetchCategories();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      toast.error("Please fill required fields");
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        stockQuantity: parseInt(productForm.stockQuantity) || 0,
      };

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Product created successfully");
        setProductForm({
          name: "", description: "", price: "", categoryId: "", imageUrl: "", stockQuantity: "", unit: ""
        });
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, deliveryTime?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, deliveryTime }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Order status updated successfully");
        fetchOrders();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update order status");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Product deleted successfully");
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED": return "bg-blue-100 text-blue-800";
      case "PREPARING": return "bg-orange-100 text-orange-800";
      case "OUT_FOR_DELIVERY": return "bg-purple-100 text-purple-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const pendingOrders = orders.filter(order => order.status === "PENDING");
  const totalRevenue = orders.filter(order => order.status === "DELIVERED")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-500" />
          {pendingOrders.length > 0 && (
            <Badge variant="destructive">{pendingOrders.length}</Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
              </CardContent>
            </Card>
          </div>

          {pendingOrders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Orders waiting for confirmation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.customerEmail}</p>
                        <p className="text-sm text-gray-500">₹{order.totalAmount} • {order.items.length} items</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, "CONFIRMED", "2-3 hours")}
                          disabled={loading}
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
              <CardDescription>Create a new product category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input
                    id="category-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="e.g., Fruits, Vegetables"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category-image">Image URL</Label>
                  <Input
                    id="category-image"
                    value={categoryForm.imageUrl}
                    onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Category description"
                />
              </div>
              <Button onClick={handleCreateCategory} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{category.name}</h3>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{category.description}</p>
                    <Badge variant={category.isActive ? "default" : "secondary"} className="mt-2">
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>Add a new product to your inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input
                    id="product-name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g., Fresh Apples"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <Select
                    value={productForm.categoryId}
                    onValueChange={(value) => setProductForm({ ...productForm, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-price">Price (₹)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-stock">Stock Quantity</Label>
                  <Input
                    id="product-stock"
                    type="number"
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-unit">Unit</Label>
                  <Input
                    id="product-unit"
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                    placeholder="kg, pieces, liters"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="product-image">Image URL</Label>
                  <Input
                    id="product-image"
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product-description">Description</Label>
                <Textarea
                  id="product-description"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product description"
                />
              </div>
              <Button onClick={handleCreateProduct} disabled={loading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">₹{product.price}</span>
                      <Badge variant={product.stockQuantity > 0 ? "default" : "destructive"}>
                        Stock: {product.stockQuantity} {product.unit}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>Manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-medium">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-500">{order.customerEmail}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm"><strong>Phone:</strong> {order.customerPhone}</p>
                        <p className="text-sm"><strong>Address:</strong> {order.deliveryAddress}</p>
                      </div>
                      <div>
                        <p className="text-sm"><strong>Total:</strong> ₹{order.totalAmount}</p>
                        <p className="text-sm"><strong>Items:</strong> {order.items.length}</p>
                      </div>
                    </div>
                    {order.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(order.id, "CONFIRMED", "2-3 hours")}
                          disabled={loading}
                        >
                          Confirm Order
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                          disabled={loading}
                        >
                          Cancel Order
                        </Button>
                      </div>
                    )}
                    {order.status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, "PREPARING")}
                        disabled={loading}
                      >
                        Mark as Preparing
                      </Button>
                    )}
                    {order.status === "PREPARING" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, "OUT_FOR_DELIVERY")}
                        disabled={loading}
                      >
                        Out for Delivery
                      </Button>
                    )}
                    {order.status === "OUT_FOR_DELIVERY" && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, "DELIVERED")}
                        disabled={loading}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
