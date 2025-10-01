import { Customer, Play, Experiment } from './types';
import dayjs from 'dayjs';

// Deterministic risk scoring based on multiple factors
export function calculateRiskScore(customer: Customer): number {
  let score = 0;
  
  // Recency factor (0-30 points)
  const daysSinceLastPurchase = customer.lastPurchaseAt 
    ? dayjs().diff(dayjs(customer.lastPurchaseAt), 'day')
    : 999;
  
  if (daysSinceLastPurchase > 90) score += 30;
  else if (daysSinceLastPurchase > 60) score += 20;
  else if (daysSinceLastPurchase > 30) score += 10;
  
  // Frequency factor (0-25 points)
  const avgDaysBetweenOrders = customer.totalOrders > 1 
    ? dayjs(customer.lastPurchaseAt || customer.firstPurchaseAt)
        .diff(dayjs(customer.firstPurchaseAt), 'day') / customer.totalOrders
    : 999;
  
  if (avgDaysBetweenOrders > 60) score += 25;
  else if (avgDaysBetweenOrders > 30) score += 15;
  else if (avgDaysBetweenOrders > 14) score += 5;
  
  // Email engagement factor (0-20 points)
  if (customer.emailEngagement.unsubscribed) score += 20;
  else if (customer.emailEngagement.openRate < 0.1) score += 15;
  else if (customer.emailEngagement.openRate < 0.2) score += 10;
  else if (customer.emailEngagement.openRate < 0.3) score += 5;
  
  // Revenue trend factor (0-15 points)
  const avgOrderValue = customer.totalRevenue / customer.totalOrders;
  if (avgOrderValue < 50) score += 15;
  else if (avgOrderValue < 100) score += 10;
  else if (avgOrderValue < 200) score += 5;
  
  // Tenure factor (0-10 points)
  const tenureDays = dayjs().diff(dayjs(customer.firstPurchaseAt), 'day');
  if (tenureDays < 30) score += 10;
  else if (tenureDays < 90) score += 5;
  
  return Math.min(Math.max(score, 0), 100);
}

export function getRiskBand(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

export function getLTVTier(ltv: number): 'Bronze' | 'Silver' | 'Gold' | 'VIP' {
  if (ltv >= 5000) return 'VIP';
  if (ltv >= 2000) return 'Gold';
  if (ltv >= 500) return 'Silver';
  return 'Bronze';
}

// Next Best Action scoring
export function scorePlays(customer: Customer, plays: Play[]): Array<Play & { score: number }> {
  return plays
    .filter(play => isEligible(customer, play))
    .map(play => ({
      ...play,
      score: calculatePlayScore(customer, play)
    }))
    .sort((a, b) => b.score - a.score);
}

function isEligible(customer: Customer, play: Play): boolean {
  // Simple eligibility parsing - in real app would be more sophisticated
  const rules = play.eligibility.toLowerCase();
  
  if (rules.includes('risk >= 70') && customer.riskScore < 70) return false;
  if (rules.includes('risk >= 50') && customer.riskScore < 50) return false;
  if (rules.includes('ltvtier in [gold,vip]') && !['Gold', 'VIP'].includes(customer.ltvTier)) return false;
  if (rules.includes('ltvtier in [silver,gold,vip]') && !['Silver', 'Gold', 'VIP'].includes(customer.ltvTier)) return false;
  
  return true;
}

function calculatePlayScore(customer: Customer, play: Play): number {
  let score = play.estUpliftPct;
  
  // Boost score for high-risk customers
  if (customer.riskBand === 'High') score *= 1.5;
  else if (customer.riskBand === 'Medium') score *= 1.2;
  
  // Boost score for high-value customers
  if (customer.ltvTier === 'VIP') score *= 1.3;
  else if (customer.ltvTier === 'Gold') score *= 1.1;
  
  // Reduce score based on cost
  score -= play.estCostPctOfRev * 0.5;
  
  return Math.max(score, 0);
}

// Simulate experiment results
export function simulateExperimentResults(
  treatmentPlay: Play,
  controlPct: number,
  segmentSize: number
): Experiment['results'] {
  const baseUplift = treatmentPlay.estUpliftPct;
  const variance = Math.random() * 0.3 - 0.15; // ±15% variance
  const actualUplift = Math.max(0, baseUplift + variance);
  
  const incrementalRevenue = (segmentSize * actualUplift / 100) * 150; // Assume $150 avg order value
  const pValue = Math.random() * 0.1; // Random p-value < 0.1
  
  let winner: 'Treatment' | 'Control' | 'Inconclusive';
  if (pValue < 0.05 && actualUplift > 5) {
    winner = 'Treatment';
  } else if (pValue < 0.05 && actualUplift < -5) {
    winner = 'Control';
  } else {
    winner = 'Inconclusive';
  }
  
  return {
    incrementalRevenue,
    winner,
    pValue,
    upliftPct: actualUplift
  };
}
