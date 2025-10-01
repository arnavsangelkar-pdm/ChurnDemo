"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Customer } from "@/lib/types"
import { CustomersTable } from "@/components/customers/customers-table"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/toast"

export default function CustomersPage() {
  const { addToast } = useToast()
  const searchParams = useSearchParams()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<{
    search?: string
    riskBand?: string
    ltvTier?: string
  }>({})

  // Handle URL filter parameter
  useEffect(() => {
    const filter = searchParams.get('filter')
    if (filter === 'at-risk') {
      setFilters(prev => ({ ...prev, riskBand: 'High' }))
    }
  }, [searchParams])

  const loadCustomers = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '50',
        ...filters
      })

      const response = await apiClient.get<{
        customers: Customer[]
        total: number
        hasMore: boolean
      }>(`/customers?${params}`)

      if (reset || pageNum === 1) {
        setCustomers(response.customers)
      } else {
        setCustomers(prev => [...prev, ...response.customers])
      }
      
      setTotal(response.total)
      setHasMore(response.hasMore)
      setPage(pageNum)
    } catch (error) {
      addToast({ title: "Error", description: "Failed to load customers", type: "error" })
      console.error("Error loading customers:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadCustomers(1, true)
  }, [filters])

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search }))
  }

  const handleFilter = (newFilters: { riskBand?: string; ltvTier?: string }) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleLoadMore = () => {
    loadCustomers(page + 1, false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage and analyze customer data
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage and analyze customer data
        </p>
      </div>

      <CustomersTable
        customers={customers}
        total={total}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onSearch={handleSearch}
        onFilter={handleFilter}
        loading={loadingMore}
      />
    </div>
  )
}
