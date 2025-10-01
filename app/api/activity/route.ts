import { NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
  try {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100))
    
    // 5% chance of error
    if (Math.random() < 0.05) {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

    const activity = dataStore.getActivityLog()
    
    return NextResponse.json({
      success: true,
      data: activity,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    )
  }
}
