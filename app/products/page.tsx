"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { toast } from "sonner"

type Product = {
  id: string
  name: string
  price: number
  stock_quantity: number
  min_stock_level: number
  gst_rate: number
  price_includes_gst: boolean
  hsn_code: string
  brand: string
  barcode?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock_quantity: "",
    min_stock_level: "5",
    gst_rate: "18",
    price_includes_gst: "false",
    hsn_code: "",
    brand: "",
    barcode: "",
  })

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity, min_stock_level, gst_rate, price_includes_gst, hsn_code, brand, barcode")
        .order("name")

      if (error) {
        console.error("Error fetching products:", error)
        toast.error("Failed to load products")
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const productData = {
      name: formData.name,
      price: Number.parseFloat(formData.price),
      stock_quantity: Number.parseInt(formData.stock_quantity),
      min_stock_level: Number.parseInt(formData.min_stock_level),
      gst_rate: Number.parseFloat(formData.gst_rate),
      price_includes_gst: formData.price_includes_gst === "true",
      hsn_code: formData.hsn_code || "999999",
      brand: formData.brand || "Generic",
      barcode: formData.barcode || null,
    }

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)

        if (error) throw error
        toast.success("Product updated successfully!")
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData)

        if (error) throw error
        toast.success("Product added successfully!")
      }

      setShowAddDialog(false)
      setEditingProduct(null)
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("Error saving product")
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      min_stock_level: product.min_stock_level.toString(),
      gst_rate: product.gst_rate.toString(),
      price_includes_gst: product.price_includes_gst.toString(),
      hsn_code: product.hsn_code,
      brand: product.brand,
      barcode: product.barcode || "",
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)

      if (error) throw error
      toast.success("Product deleted successfully!")
      fetchProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Error deleting product")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      stock_quantity: "",
      min_stock_level: "5",
      gst_rate: "18",
      price_includes_gst: "false",
      hsn_code: "",
      brand: "",
      barcode: "",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-2 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(product.price)}
                </span>
                <Badge variant={product.stock_quantity > product.min_stock_level ? "default" : "destructive"}>
                  Stock: {product.stock_quantity}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Brand: {product.brand}</p>
                <p>HSN Code: {product.hsn_code}</p>
                <p>GST Rate: {product.gst_rate}%</p>
                <p>Price Includes GST: {product.price_includes_gst ? "Yes" : "No"}</p>
                <p>Min Level: {product.min_stock_level}</p>
                {product.barcode && <p>Barcode: {product.barcode}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details below." : "Enter product details below."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Generic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hsn_code">HSN Code</Label>
                <Input
                  id="hsn_code"
                  value={formData.hsn_code}
                  onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                  placeholder="999999"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Min Stock Level</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gst_rate">GST Rate (%)</Label>
                <Input
                  id="gst_rate"
                  type="number"
                  step="0.01"
                  value={formData.gst_rate}
                  onChange={(e) => setFormData({ ...formData, gst_rate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (Optional)</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="Enter barcode"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="price_includes_gst"
                checked={formData.price_includes_gst === "true"}
                onChange={(e) => setFormData({ ...formData, price_includes_gst: e.target.checked ? "true" : "false" })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="price_includes_gst" className="text-sm text-muted-foreground">
                Price includes GST
              </Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingProduct ? "Update Product" : "Add Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  setEditingProduct(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
