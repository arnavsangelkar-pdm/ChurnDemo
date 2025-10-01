import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 100))
    
    // 5% chance of error
    if (Math.random() < 0.05) {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

    const timeline = dataStore.getCustomerTimeline(params.id)
    
    return NextResponse.json({
      success: true,
      data: timeline,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}
