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
    const { customerId, playId, customerCount } = body

    // Add activity event
    const play = dataStore.getPlay(playId)
    const message = customerCount 
      ? `${play?.name} triggered for ${customerCount} customers`
      : `${play?.name} triggered for customer ${customerId}`
    
    dataStore.addActivityEvent({
      type: 'play_triggered',
      message,
      metadata: { customerId, playId, customerCount }
    })
    
    return NextResponse.json({
      success: true,
      data: { message: 'Play triggered successfully' },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to trigger play' },
      { status: 500 }
    )
  }
}
