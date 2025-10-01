import { NextRequest, NextResponse } from 'next/server'
import { dataStore } from '@/lib/data-store'

export async function GET(request: NextRequest) {
  try {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 200))
    
    // 5% chance of error
    if (Math.random() < 0.05) {
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const riskBand = searchParams.get('riskBand') || undefined
    const ltvTier = searchParams.get('ltvTier') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    const result = dataStore.getCustomers({
      search,
      riskBand,
      ltvTier,
      limit,
      offset
    })
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}
