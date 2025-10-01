import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function POST(request: NextRequest) {
  try {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 300))
    
    // 5% chance of error
    if (Math.random() < 0.05) {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { segmentId, playId, customerCount } = body

    // Get the play details
    const play = dataStore.getPlay(playId)
    if (!play) {
      return NextResponse.json(
        { success: false, error: 'Play not found' },
        { status: 404 }
      )
    }

    // Get customers that match the segment criteria
    let segmentCustomers = []
    
    // Apply segment criteria based on predefined rules
    const allCustomers = dataStore.getCustomers({ limit: 10000 }).customers
    
    switch (segmentId) {
      case 'previously-high-value-likely-churn':
        segmentCustomers = allCustomers.filter(c => 
          ['Gold', 'VIP'].includes(c.ltvTier) && c.riskScore >= 60
        )
        break
      case 'lost-customers-resurrectable':
        segmentCustomers = allCustomers.filter(c => 
          c.status === 'churned' && 
          ['Silver', 'Gold', 'VIP'].includes(c.ltvTier) && 
          c.daysSinceLastActivity < 90
        )
        break
      case 'high-value-no-discount-needed':
        segmentCustomers = allCustomers.filter(c => 
          ['Gold', 'VIP'].includes(c.ltvTier) && 
          c.riskScore < 30 && 
          c.loyaltyScore >= 80
        )
        break
      case 'price-sensitive-at-risk':
        segmentCustomers = allCustomers.filter(c => 
          c.riskScore >= 50 && c.priceSensitivity === 'high'
        )
        break
      case 'new-customers-high-potential':
        segmentCustomers = allCustomers.filter(c => 
          c.customerAge < 30 && c.engagementScore >= 70
        )
        break
      case 'seasonal-customers-dormant':
        segmentCustomers = allCustomers.filter(c => 
          c.daysSinceLastActivity > 60 && c.seasonalPattern === true
        )
        break
      case 'high-frequency-low-value':
        segmentCustomers = allCustomers.filter(c => 
          c.totalOrders >= 10 && (c.totalRevenue / c.totalOrders) < 50
        )
        break
      case 'one-time-buyers-engaged':
        segmentCustomers = allCustomers.filter(c => 
          c.totalOrders === 1 && c.engagementScore >= 80 && c.emailEngagement.openRate >= 0.4
        )
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid segment ID' },
          { status: 400 }
        )
    }

    // Add activity event
    const message = `${play.name} triggered for segment ${segmentId} (${segmentCustomers.length} customers)`
    
    dataStore.addActivityEvent({
      type: 'play_triggered',
      message,
      metadata: { 
        segmentId, 
        playId, 
        customerCount: segmentCustomers.length,
        customerIds: segmentCustomers.map(c => c.id)
      }
    })
    
    return NextResponse.json({
      success: true,
      data: { 
        message: 'Segment play triggered successfully',
        segmentId,
        playId,
        actualCustomerCount: segmentCustomers.length,
        estimatedCustomerCount: customerCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to trigger segment play' },
      { status: 500 }
    )
  }
}
