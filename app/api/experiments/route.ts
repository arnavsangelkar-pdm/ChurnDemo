import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET() {
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

    const experiments = dataStore.getExperiments()
    
    return NextResponse.json({
      success: true,
      data: experiments,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200))
    
    // 5% chance of error
    if (Math.random() < 0.05) {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const experiment = dataStore.createExperiment(body)
    
    return NextResponse.json({
      success: true,
      data: experiment,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create experiment' },
      { status: 500 }
    )
  }
}
