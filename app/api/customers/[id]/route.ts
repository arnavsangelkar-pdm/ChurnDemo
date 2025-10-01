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

    const customer = dataStore.getCustomer(params.id)
    
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: customer,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}
