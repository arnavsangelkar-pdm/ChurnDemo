"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Customer } from "@/lib/types"
import { CustomerHeader } from "@/components/customers/customer-header"
import { CustomerTimeline } from "@/components/customers/customer-timeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiClient } from "@/lib/api"
import { useToast } from "@/components/ui/toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CustomerDetailPage() {
  const { addToast } = useToast()
  const params = useParams()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        setLoading(true)
        const [customerData, timelineData] = await Promise.all([
          apiClient.get<Customer>(`/customers/${customerId}`),
          apiClient.get<any[]>(`/customers/${customerId}/timeline`)
        ])
        
        setCustomer(customerData)
        setTimeline(timelineData)
      } catch (error) {
        addToast({ title: "Error", description: "Failed to load customer data", type: "error" })
        console.error("Error loading customer:", error)
      } finally {
        setLoading(false)
      }
    }

    if (customerId) {
      loadCustomer()
    }
  }, [customerId])

  const handleTriggerPlay = async () => {
    try {
      await apiClient.post('/trigger-play', {
        customerId,
        playId: 'play-001' // Default play
      })
      addToast({ title: "Success", description: "Play triggered successfully", type: "success" })
    } catch (error) {
      addToast({ title: "Error", description: "Failed to trigger play", type: "error" })
      console.error("Error triggering play:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
            <p className="text-muted-foreground">Loading customer information...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading customer data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Not Found</h1>
            <p className="text-muted-foreground">The requested customer could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Details</h1>
          <p className="text-muted-foreground">View and manage customer information</p>
        </div>
      </div>

      <CustomerHeader customer={customer} onTriggerPlay={handleTriggerPlay} />

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="plays">Plays</TabsTrigger>
          <TabsTrigger value="engagement">Email Engagement</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <CustomerTimeline events={timeline} />
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {customer.name}</div>
                    <div><strong>Email:</strong> {customer.email}</div>
                    <div><strong>Location:</strong> {customer.location.city}, {customer.location.state}</div>
                    <div><strong>First Purchase:</strong> {new Date(customer.firstPurchaseAt).toLocaleDateString()}</div>
                    <div><strong>Last Purchase:</strong> {customer.lastPurchaseAt ? new Date(customer.lastPurchaseAt).toLocaleDateString() : 'Never'}</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Orders:</strong> {customer.totalOrders}</div>
                    <div><strong>Total Revenue:</strong> ${customer.totalRevenue.toLocaleString()}</div>
                    <div><strong>Lifetime Value:</strong> ${customer.ltv.toLocaleString()}</div>
                    <div><strong>Margin Rate:</strong> {(customer.marginRate * 100).toFixed(1)}%</div>
                    <div><strong>Risk Score:</strong> {customer.riskScore}/100</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Plays</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Plays that can be triggered for this customer based on their profile and eligibility rules.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{(customer.emailEngagement.openRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Open Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{(customer.emailEngagement.clickRate * 100).toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Click Rate</div>
                  </div>
                </div>
                <div className="text-sm">
                  <div><strong>Unsubscribed:</strong> {customer.emailEngagement.unsubscribed ? 'Yes' : 'No'}</div>
                  {customer.emailEngagement.lastOpenAt && (
                    <div><strong>Last Open:</strong> {new Date(customer.emailEngagement.lastOpenAt).toLocaleDateString()}</div>
                  )}
                  {customer.emailEngagement.lastClickAt && (
                    <div><strong>Last Click:</strong> {new Date(customer.emailEngagement.lastClickAt).toLocaleDateString()}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Transaction history will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
