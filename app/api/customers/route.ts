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
    const riskBandParam = searchParams.get('riskBand') || undefined
    const ltvTierParam = searchParams.get('ltvTier') || undefined
    const statusParam = searchParams.get('status') || undefined
    const priceSensitivityParam = searchParams.get('priceSensitivity') || undefined
    const seasonalPatternParam = searchParams.get('seasonalPattern')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Handle comma-separated values for array parameters
    const riskBand = riskBandParam?.includes(',') ? riskBandParam.split(',') : riskBandParam
    const ltvTier = ltvTierParam?.includes(',') ? ltvTierParam.split(',') : ltvTierParam
    const status = statusParam?.includes(',') ? statusParam.split(',') : statusParam
    const priceSensitivity = priceSensitivityParam?.includes(',') ? priceSensitivityParam.split(',') : priceSensitivityParam
    const seasonalPattern = seasonalPatternParam ? seasonalPatternParam === 'true' : undefined

    // Handle range parameters
    const customerAgeMin = searchParams.get('customerAgeMin') ? parseInt(searchParams.get('customerAgeMin')!) : undefined
    const customerAgeMax = searchParams.get('customerAgeMax') ? parseInt(searchParams.get('customerAgeMax')!) : undefined
    const engagementScoreMin = searchParams.get('engagementScoreMin') ? parseInt(searchParams.get('engagementScoreMin')!) : undefined
    const engagementScoreMax = searchParams.get('engagementScoreMax') ? parseInt(searchParams.get('engagementScoreMax')!) : undefined
    const loyaltyScoreMin = searchParams.get('loyaltyScoreMin') ? parseInt(searchParams.get('loyaltyScoreMin')!) : undefined
    const loyaltyScoreMax = searchParams.get('loyaltyScoreMax') ? parseInt(searchParams.get('loyaltyScoreMax')!) : undefined
    const daysSinceLastActivityMin = searchParams.get('daysSinceLastActivityMin') ? parseInt(searchParams.get('daysSinceLastActivityMin')!) : undefined
    const daysSinceLastActivityMax = searchParams.get('daysSinceLastActivityMax') ? parseInt(searchParams.get('daysSinceLastActivityMax')!) : undefined

    const result = dataStore.getCustomers({
      search,
      riskBand,
      ltvTier,
      status,
      priceSensitivity,
      seasonalPattern,
      customerAge: (customerAgeMin !== undefined || customerAgeMax !== undefined) ? {
        min: customerAgeMin,
        max: customerAgeMax
      } : undefined,
      engagementScore: (engagementScoreMin !== undefined || engagementScoreMax !== undefined) ? {
        min: engagementScoreMin,
        max: engagementScoreMax
      } : undefined,
      loyaltyScore: (loyaltyScoreMin !== undefined || loyaltyScoreMax !== undefined) ? {
        min: loyaltyScoreMin,
        max: loyaltyScoreMax
      } : undefined,
      daysSinceLastActivity: (daysSinceLastActivityMin !== undefined || daysSinceLastActivityMax !== undefined) ? {
        min: daysSinceLastActivityMin,
        max: daysSinceLastActivityMax
      } : undefined,
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
