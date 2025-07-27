import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase-client'

interface DashboardStats {
  totalProducts: number
  totalCustomers: number
  monthlyRevenue: number
  loading: boolean
  error: string | null
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    loading: true,
    error: null
  })

  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }))

      // Get current month range
      const today = new Date()
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)

      // Fetch total products count
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      if (productsError) throw productsError

      // Fetch total customers count
      const { count: customersCount, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      if (customersError) throw customersError

      // Fetch monthly revenue
      const { data: monthlyRevenueData, error: monthlyRevenueError } = await supabase
        .from('transactions')
        .select('total_amount')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .eq('status', 'completed')

      if (monthlyRevenueError) throw monthlyRevenueError

      // Calculate totals
      const monthlyRevenue = monthlyRevenueData?.reduce((sum, transaction) => sum + (transaction.total_amount || 0), 0) || 0

      setStats({
        totalProducts: productsCount || 0,
        totalCustomers: customersCount || 0,
        monthlyRevenue,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats'
      }))
    }
  }

  useEffect(() => {
    // Only fetch stats if Supabase is properly configured
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      fetchStats()

      // Set up real-time subscription for transactions
      const transactionsSubscription = supabase
        .channel('dashboard-transactions')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'transactions' },
          () => {
            // Refetch stats when transactions change
            fetchStats()
          }
        )
        .subscribe()

      // Set up real-time subscription for products
      const productsSubscription = supabase
        .channel('dashboard-products')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' },
          () => {
            // Refetch stats when products change
            fetchStats()
          }
        )
        .subscribe()

      // Set up real-time subscription for customers
      const customersSubscription = supabase
        .channel('dashboard-customers')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'customers' },
          () => {
            // Refetch stats when customers change
            fetchStats()
          }
        )
        .subscribe()

      return () => {
        transactionsSubscription.unsubscribe()
        productsSubscription.unsubscribe()
        customersSubscription.unsubscribe()
      }
    }
  }, [])

  return { ...stats, refresh: fetchStats }
} 