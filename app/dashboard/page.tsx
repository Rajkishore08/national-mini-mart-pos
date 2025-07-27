"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, UserPlus } from "lucide-react"
import Link from "next/link"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default function DashboardPage() {
  const { profile } = useAuth()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Good morning, {profile?.full_name?.split(" ")[0] || "User"}!</h1>
          <p className="text-muted-foreground">Welcome to National Mini Mart POS System</p>
        </div>
        <div className="flex gap-2">
          <Link href="/pos">
            <Button className="bg-green-600 hover:bg-green-700">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Quick POS
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Products
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <DashboardStats />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/pos">
              <Button className="w-full h-20 text-lg bg-green-600 hover:bg-green-700">
                <ShoppingCart className="h-6 w-6 mr-2" />
                Start Billing
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" className="w-full h-20 text-lg bg-transparent">
                <Package className="h-6 w-6 mr-2" />
                Manage Products
              </Button>
            </Link>
            <Link href="/customers">
              <Button variant="outline" className="w-full h-20 text-lg bg-transparent">
                <UserPlus className="h-6 w-6 mr-2" />
                Add Customer
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium">Set up your products</p>
                <p className="text-sm text-muted-foreground">Add products with prices and stock levels</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium">Configure store settings</p>
                <p className="text-sm text-muted-foreground">Update store information and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium">Start making sales</p>
                <p className="text-sm text-muted-foreground">Use the POS system to process transactions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
