"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase-client"
import { useAuth } from "@/contexts/auth-context"
import { User, Store, SettingsIcon } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { profile } = useAuth()
  const [storeSettings, setStoreSettings] = useState({
    store_name: "",
    store_address: "",
    store_phone: "",
    gst_number: "",
    default_gst_rate: "",
    receipt_footer: "",
  })
  const [profileData, setProfileData] = useState({
    full_name: profile?.full_name || "",
    email: profile?.email || "",
    role: profile?.role || "cashier",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const { data, error } = await supabase.from("settings").select("key, value")

    if (error) {
      console.error("Error fetching settings:", error)
      return
    }

    const settings =
      data?.reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value
          return acc
        },
        {} as Record<string, string>,
      ) || {}

    setStoreSettings({
      store_name: settings.store_name || "",
      store_address: settings.store_address || "",
      store_phone: settings.store_phone || "",
      gst_number: settings.gst_number || "",
      default_gst_rate: settings.default_gst_rate || "",
      receipt_footer: settings.receipt_footer || "",
    })
  }

  const updateSettings = async () => {
    setLoading(true)
    try {
      const settingsArray = Object.entries(storeSettings).map(([key, value]) => ({
        key,
        value,
      }))

      for (const setting of settingsArray) {
        await supabase.from("settings").upsert(setting, { onConflict: "key" })
      }

              toast.success("Settings updated successfully!")
    } catch (error) {
      console.error("Error updating settings:", error)
              toast.error("Error updating settings")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          role: profileData.role,
        })
        .eq("id", profile?.id)

      if (error) throw error

              toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
              toast.error("Error updating profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account, store, and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Profile
            </CardTitle>
            <p className="text-sm text-muted-foreground">Update your personal information and role.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Name</Label>
              <Input
                id="full_name"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profileData.email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={profileData.role}
                onValueChange={(value) => setProfileData({ ...profileData, role: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="cashier">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={updateProfile} disabled={loading} className="w-full">
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Store className="h-5 w-5 mr-2" />
              Store Information
            </CardTitle>
            <p className="text-sm text-muted-foreground">{"Manage your store's details for invoices and records."}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name</Label>
              <Input
                id="store_name"
                value={storeSettings.store_name}
                onChange={(e) => setStoreSettings({ ...storeSettings, store_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_address">Address</Label>
              <Input
                id="store_address"
                value={storeSettings.store_address}
                onChange={(e) => setStoreSettings({ ...storeSettings, store_address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store_phone">Phone</Label>
              <Input
                id="store_phone"
                value={storeSettings.store_phone}
                onChange={(e) => setStoreSettings({ ...storeSettings, store_phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gst_number">GST Number</Label>
              <Input
                id="gst_number"
                value={storeSettings.gst_number}
                onChange={(e) => setStoreSettings({ ...storeSettings, gst_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default_gst_rate">Default GST Rate (%)</Label>
              <Input
                id="default_gst_rate"
                type="number"
                step="0.01"
                value={storeSettings.default_gst_rate}
                onChange={(e) => setStoreSettings({ ...storeSettings, default_gst_rate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt_footer">Receipt Footer</Label>
              <Input
                id="receipt_footer"
                value={storeSettings.receipt_footer}
                onChange={(e) => setStoreSettings({ ...storeSettings, receipt_footer: e.target.value })}
              />
            </div>
            <Button onClick={updateSettings} disabled={loading} className="w-full">
              Save Store Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            System Settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">Configure system preferences and printer settings.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Printer Settings</h3>
              <div className="space-y-2">
                <Label>Thermal Printer</Label>
                <Select defaultValue="enabled">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Receipt Width</Label>
                <Select defaultValue="3inch">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3inch">3 inch (80mm)</SelectItem>
                    <SelectItem value="2inch">2 inch (58mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Display Settings</h3>
              <div className="space-y-2">
                <Label>Currency Format</Label>
                <Select defaultValue="inr">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                    <SelectItem value="usd">US Dollar ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select defaultValue="dd/mm/yyyy">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                    <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
