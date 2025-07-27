"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { CustomerSelector } from "./customer-selector"
import { ReceiptPreview } from "./receipt-preview"
import { Search, Plus, Minus, Trash2, CreditCard, Smartphone, Banknote, Receipt } from "lucide-react"
import { toast } from "sonner"

type Product = {
  id: string
  name: string
  price: number
  stock_quantity: number
  gst_rate: number
  price_includes_gst: boolean
  barcode?: string
}

type CartItem = {
  product: Product
  quantity: number
  total: number
}

type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  loyalty_points: number
  total_spent: number
}

type PaymentMethod = "cash" | "card" | "upi"

export function POSInterface() {
  const { profile } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [cashReceived, setCashReceived] = useState("")
  const [loading, setLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<any>(null)
  const lastBillNumberRef = useRef<string>("NM 0000")

  useEffect(() => {
    fetchProducts()
    fetchLastBillNumber()
  }, [])

  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const { data, error } = await supabase.from("products").select("*").gt("stock_quantity", 0).order("name")

      if (error) {
        console.error("Error fetching products:", error)
        return
      }

      setProducts(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchLastBillNumber = async () => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("invoice_number")
        .like("invoice_number", "NM %")
        .order("invoice_number", { ascending: false })
        .limit(1)

      if (error) {
        console.error("Error fetching last bill number:", error)
        return
      }

      if (data && data.length > 0) {
        lastBillNumberRef.current = data[0].invoice_number
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const getNextBillNumber = () => {
    const currentNumber = parseInt(lastBillNumberRef.current.replace("NM ", ""))
    const nextNumber = currentNumber + 1
    const formattedNumber = `NM ${nextNumber.toString().padStart(4, "0")}`
    lastBillNumberRef.current = formattedNumber
    return formattedNumber
  }

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode?.includes(searchTerm),
  )

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.id === product.id)

    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        updateQuantity(product.id, existingItem.quantity + 1)
      }
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        total: product.price,
      }
      setCart([...cart, newItem])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(
      cart.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity: newQuantity,
            total: item.product.price * newQuantity,
          }
        }
        return item
      }),
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId))
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
    
    // Calculate GST based on whether price includes GST or not
    const gstAmount = cart.reduce((sum, item) => {
      let itemGst = 0
      if (item.product.price_includes_gst) {
        // If price includes GST, extract GST amount
        const priceWithoutGst = item.total / (1 + item.product.gst_rate / 100)
        itemGst = item.total - priceWithoutGst
      } else {
        // If price excludes GST, add GST amount
        itemGst = (item.total * item.product.gst_rate) / 100
      }
      return sum + itemGst
    }, 0)
    
    const total = subtotal + gstAmount
    
    // Round the total to nearest rupee (no paise)
    const roundedTotal = Math.round(total)
    const roundingAdjustment = roundedTotal - total

    return { subtotal, gstAmount, total, roundedTotal, roundingAdjustment }
  }

  const { subtotal, gstAmount, total, roundedTotal, roundingAdjustment } = calculateTotals()
  const changeAmount = paymentMethod === "cash" ? Math.max(0, Number.parseFloat(cashReceived || "0") - roundedTotal) : 0
  const loyaltyPointsEarned = Math.floor(roundedTotal / 100)

  const processPayment = async () => {
    if (cart.length === 0) return

    if (paymentMethod === "cash" && Number.parseFloat(cashReceived || "0") < roundedTotal) {
      toast.error("Insufficient cash received")
      return
    }

    setLoading(true)

    try {
      // Generate invoice number
      const invoiceNumber = getNextBillNumber()

      // Create transaction
      const transactionData = {
        invoice_number: invoiceNumber,
        cashier_id: profile?.id,
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || null,
        customer_phone: selectedCustomer?.phone || null,
        subtotal,
        gst_amount: gstAmount,
        total_amount: roundedTotal,
        rounding_adjustment: roundingAdjustment,
        payment_method: paymentMethod,
        cash_received: paymentMethod === "cash" ? Number.parseFloat(cashReceived) : null,
        change_amount: paymentMethod === "cash" ? changeAmount : null,
        status: "completed" as const,
      }

      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert(transactionData)
        .select()
        .single()

      if (transactionError) throw transactionError

      // Create transaction items
      const transactionItems = cart.map((item) => ({
        transaction_id: transaction.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.total,
        gst_rate: item.product.gst_rate,
        price_includes_gst: item.product.price_includes_gst,
      }))

      const { error: itemsError } = await supabase.from("transaction_items").insert(transactionItems)

      if (itemsError) throw itemsError

      // Update stock quantities
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from("products")
          .update({
            stock_quantity: item.product.stock_quantity - item.quantity,
          })
          .eq("id", item.product.id)

        if (stockError) throw stockError
      }

      // Update customer loyalty points if customer is selected
      if (selectedCustomer && loyaltyPointsEarned > 0) {
        await supabase
          .from("customers")
          .update({
            loyalty_points: selectedCustomer.loyalty_points + loyaltyPointsEarned,
            total_spent: selectedCustomer.total_spent + roundedTotal,
          })
          .eq("id", selectedCustomer.id)
      }

      // Prepare transaction data for receipt
      const receiptTransaction = {
        ...transaction,
        items: cart,
        customer: selectedCustomer,
        cashier: profile,
        loyalty_points_earned: selectedCustomer ? loyaltyPointsEarned : 0,
      }

      // Clear cart and show success
      setCart([])
      setCashReceived("")
      setSelectedCustomer(null)

      // Show receipt
      setLastTransaction(receiptTransaction)
      setShowReceipt(true)

      // Refresh products to update stock
      fetchProducts()
    } catch (error) {
      console.error("Error processing payment:", error)
      toast.error("Error processing payment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const clearCart = () => {
    setCart([])
    setCashReceived("")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full p-6">
      {/* Products Section */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products or scan barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">{formatCurrency(product.price)}</span>
                        <Badge variant="secondary" className="text-xs">
                          Stock: {product.stock_quantity}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cart Section */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Shopping Cart
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Customer Selection */}
            <CustomerSelector selectedCustomer={selectedCustomer} onCustomerSelect={setSelectedCustomer} />

            <Separator />

            {/* Cart Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Cart is empty</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2 border rounded transition-all hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(item.product.price)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.product.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>GST:</span>
                <span>{formatCurrency(gstAmount)}</span>
              </div>
              {roundingAdjustment !== 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Rounding:</span>
                  <span>{formatCurrency(roundingAdjustment)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(roundedTotal)}</span>
              </div>
              {selectedCustomer && loyaltyPointsEarned > 0 && (
                <div className="flex justify-between text-sm text-purple-600">
                  <span>Loyalty Points:</span>
                  <span>+{loyaltyPointsEarned} pts</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Payment Method */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Payment Method:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === "cash" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("cash")}
                >
                  <Banknote className="h-4 w-4 mr-1" />
                  Cash
                </Button>
                <Button
                  variant={paymentMethod === "card" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("card")}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Card
                </Button>
                <Button
                  variant={paymentMethod === "upi" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPaymentMethod("upi")}
                >
                  <Smartphone className="h-4 w-4 mr-1" />
                  UPI
                </Button>
              </div>

              {paymentMethod === "cash" && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Cash Received"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="text-lg font-medium"
                  />
                  {cashReceived && Number.parseFloat(cashReceived) >= roundedTotal && (
                    <div className="text-sm bg-green-50 dark:bg-green-950/20 p-2 rounded">
                      <span className="font-medium">Change: </span>
                      <span className="text-green-600 font-bold text-lg">{formatCurrency(changeAmount)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-6"
              onClick={processPayment}
              disabled={
                cart.length === 0 ||
                loading ||
                (paymentMethod === "cash" && Number.parseFloat(cashReceived || "0") < roundedTotal)
              }
            >
              {loading ? (
                "Processing..."
              ) : (
                <>
                  <Receipt className="h-5 w-5 mr-2" />
                  Pay {formatCurrency(roundedTotal)}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Receipt Dialog */}
      {showReceipt && lastTransaction && (
        <ReceiptPreview transaction={lastTransaction} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  )
}
