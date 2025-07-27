"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase-client"
import { Users, Search, Plus, Edit, Trash2, Phone, Mail, MapPin, Gift, TrendingUp, Star, Award } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

type Customer = {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  date_of_birth: string | null
  loyalty_points: number
  total_spent: number
  visit_count: number
  last_visit: string | null
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalLoyaltyPoints: 0,
    averageSpent: 0,
    topCustomer: null as Customer | null,
  })

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    date_of_birth: "",
  })

  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [])

  const fetchCustomers = async () => {
    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching customers:", error)
      return
    }

    setCustomers(data || [])
    setLoading(false)
  }

  const fetchStats = async () => {
    const { data, error } = await supabase.from("customers").select("*").order("total_spent", { ascending: false })

    if (error) {
      console.error("Error fetching customer stats:", error)
      return
    }

    const totalCustomers = data?.length || 0
    const totalLoyaltyPoints = data?.reduce((sum, c) => sum + c.loyalty_points, 0) || 0
    const averageSpent =
      totalCustomers > 0 ? (data?.reduce((sum, c) => sum + c.total_spent, 0) || 0) / totalCustomers : 0
    const topCustomer = data?.[0] || null

    setStats({
      totalCustomers,
      totalLoyaltyPoints,
      averageSpent,
      topCustomer,
    })
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      date_of_birth: "",
    })
    setEditingCustomer(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const customerData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || null,
      address: formData.address || null,
      date_of_birth: formData.date_of_birth || null,
    }

    try {
      if (editingCustomer) {
        const { error } = await supabase.from("customers").update(customerData).eq("id", editingCustomer.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("customers").insert(customerData)

        if (error) throw error
      }

      fetchCustomers()
      fetchStats()
      setShowAddDialog(false)
      resetForm()
    } catch (error: any) {
      console.error("Error saving customer:", error)
      if (error.code === "23505") {
        toast.error("Phone number already exists!")
      } else {
                  toast.error("Error saving customer")
      }
    }
  }

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
      date_of_birth: customer.date_of_birth || "",
    })
    setEditingCustomer(customer)
    setShowAddDialog(true)
  }

  const handleDelete = async (customerId: string) => {
    try {
      const { error, data } = await supabase
        .from("customers")
        .delete()
        .eq("id", customerId);

      if (error) {
        console.error("Error deleting customer:", error);
        toast.error("Failed to delete customer: " + (error.message || JSON.stringify(error)));
        return;
      }

      // Optionally: check if data is empty (no row deleted)
      if (!data || (Array.isArray(data) && data.length === 0)) {
        toast.error("No customer was deleted. The customer may not exist or is referenced elsewhere.");
        return;
      }

      toast.success("Customer deleted successfully!");
      // Refresh your customer list here (if needed)
    } catch (err) {
      console.error("Unexpected error deleting customer:", err);
      toast.error("Unexpected error: " + (err instanceof Error ? err.message : JSON.stringify(err)));
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getLoyaltyTier = (points: number) => {
    if (points >= 500) return { name: "Platinum", color: "bg-purple-100 text-purple-800", icon: Award }
    if (points >= 200) return { name: "Gold", color: "bg-yellow-100 text-yellow-800", icon: Star }
    if (points >= 50) return { name: "Silver", color: "bg-gray-100 text-gray-800", icon: Gift }
    return { name: "Bronze", color: "bg-orange-100 text-orange-800", icon: Gift }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">Manage customer relationships and loyalty</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage customer relationships and loyalty</p>
        </div>
        <Dialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? "Update customer information" : "Add a new customer to your database"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91-9876543210"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="customer@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600">
                  {editingCustomer ? "Update" : "Add"} Customer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalCustomers}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {stats.totalLoyaltyPoints.toLocaleString()}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">Total Loyalty Points</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(stats.averageSpent)}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Average Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100 truncate">
                  {stats.topCustomer?.name || "N/A"}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">Top Customer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-md"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search customers by name, phone, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Customers Grid */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredCustomers.map((customer, index) => {
            const tier = getLoyaltyTier(customer.loyalty_points)
            const TierIcon = tier.icon

            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {customer.name}
                          <Badge className={`${tier.color} text-xs`}>
                            <TierIcon className="h-3 w-3 mr-1" />
                            {tier.name}
                          </Badge>
                        </CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3 mr-1" />
                          {customer.phone}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(customer)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {customer.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 mr-2" />
                          {customer.email}
                        </div>
                      )}
                      {customer.address && (
                        <div className="flex items-start text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{customer.address}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div className="text-center">
                          <div className="flex items-center justify-center">
                            <Gift className="h-4 w-4 text-purple-600 mr-1" />
                            <span className="text-lg font-bold text-purple-600">{customer.loyalty_points}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Points</p>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{formatCurrency(customer.total_spent)}</div>
                          <p className="text-xs text-muted-foreground">Total Spent</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-sm font-medium">{customer.visit_count}</div>
                          <p className="text-xs text-muted-foreground">Visits</p>
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString("en-IN") : "Never"}
                          </div>
                          <p className="text-xs text-muted-foreground">Last Visit</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {filteredCustomers.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No customers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first customer"}
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </motion.div>
      )}
    </div>
  )
}
