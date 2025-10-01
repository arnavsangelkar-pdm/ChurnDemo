export type Customer = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  firstPurchaseAt: string;
  lastPurchaseAt: string | null;
  totalOrders: number;
  totalRevenue: number;
  marginRate: number; // 0..1
  ltv: number;
  riskScore: number; // 0..100
  riskBand: 'Low' | 'Medium' | 'High';
  ltvTier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  emailEngagement: {
    openRate: number; // 0..1
    clickRate: number; // 0..1
    unsubscribed: boolean;
    lastOpenAt?: string | null;
    lastClickAt?: string | null;
  };
  location: { city: string; state: string; country: string; };
  tags: string[];
  // Additional properties for segment criteria
  loyaltyScore: number; // 0..100
  priceSensitivity: 'low' | 'medium' | 'high';
  customerAge: number; // days since first purchase
  seasonalPattern: boolean;
  status: 'active' | 'churned' | 'dormant';
  engagementScore: number; // 0..100
  daysSinceLastActivity: number;
};

export type Transaction = {
  id: string;
  customerId: string;
  orderId: string;
  purchasedAt: string;
  items: Array<{ sku: string; name: string; category: string; qty: number; price: number }>;
  subtotal: number;
  discount: number;
  refund: number;
};

export type SessionEvent = {
  id: string;
  customerId: string;
  occurredAt: string;
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_start' | 'rage_click' | 'search';
  metadata: Record<string, any>;
};

export type EmailEvent = {
  id: string;
  customerId: string;
  occurredAt: string;
  type: 'delivered' | 'open' | 'click' | 'unsubscribe' | 'complaint';
  campaign: string;
};

export type SupportTicket = {
  id: string;
  customerId: string;
  createdAt: string;
  status: 'open' | 'closed';
  sentiment: 'negative' | 'neutral' | 'positive';
  subject: string;
};

export type Review = {
  id: string;
  customerId: string;
  createdAt: string;
  rating: 1|2|3|4|5;
  product: string;
  text: string;
};

export type Play = {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'On-site' | 'CS';
  kind: 'Discount' | 'Loyalty' | 'Content' | 'Bundle' | 'Service';
  eligibility: string; // e.g., "risk >= 70 AND ltvTier in [Gold,VIP]"
  frequencyCapPer30d: number;
  estUpliftPct: number; // 0..100
  estCostPctOfRev: number; // 0..100
  status: 'Draft' | 'Active' | 'Paused';
  description?: string;
  copy?: string;
};

export type Experiment = {
  id: string;
  name: string;
  segment: string;
  treatmentPlayId: string;
  controlPct: number; // 0..100
  startAt: string;
  endAt?: string;
  status: 'Running' | 'Completed' | 'Paused';
  results?: {
    incrementalRevenue: number;
    winner: 'Treatment' | 'Control' | 'Inconclusive';
    pValue: number;
    upliftPct: number;
  };
};

export type ActivityEvent = {
  id: string;
  type: 'risk_detected' | 'play_triggered' | 'experiment_started' | 'customer_engaged' | 'revenue_impact';
  message: string;
  occurredAt: string;
  metadata?: Record<string, any>;
};

export type KPIs = {
  atRiskCustomers: number;
  predictedChurnRate: number;
  retainedRevenue30d: number;
  unclaimedRevenue: number;
};

export type ChartData = {
  churnRiskByCohort: Array<{ cohort: string; risk: number }>;
  riskOverTime: Array<{ week: string; risk: number }>;
  offerMix: Array<{ type: string; count: number; percentage: number }>;
};

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
};
