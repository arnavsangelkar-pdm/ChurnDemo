import { Customer, Transaction, SessionEvent, EmailEvent, SupportTicket, Review, Play, Experiment } from './types';
import { calculateRiskScore, getRiskBand, getLTVTier } from './fake-ml';
import dayjs from 'dayjs';

// Sample data for realistic generation
const FIRST_NAMES = [
  'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn',
  'Blake', 'Cameron', 'Drew', 'Emery', 'Finley', 'Hayden', 'Jamie', 'Kendall',
  'Logan', 'Parker', 'Peyton', 'Reese', 'Sage', 'Skyler', 'Sydney', 'Tatum'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White'
];

const CITIES = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego',
  'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco',
  'Indianapolis', 'Seattle', 'Denver', 'Washington', 'Boston', 'El Paso', 'Nashville', 'Detroit'
];

const STATES = [
  'NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'TX', 'CA', 'TX', 'CA', 'TX', 'FL', 'TX', 'OH', 'NC', 'CA',
  'IN', 'WA', 'CO', 'DC', 'MA', 'TX', 'TN', 'MI'
];

const PRODUCTS = [
  { sku: 'PROD-001', name: 'Wireless Headphones', category: 'Electronics', price: 199 },
  { sku: 'PROD-002', name: 'Smart Watch', category: 'Electronics', price: 299 },
  { sku: 'PROD-003', name: 'Coffee Maker', category: 'Appliances', price: 89 },
  { sku: 'PROD-004', name: 'Yoga Mat', category: 'Fitness', price: 45 },
  { sku: 'PROD-005', name: 'Bluetooth Speaker', category: 'Electronics', price: 79 },
  { sku: 'PROD-006', name: 'Running Shoes', category: 'Fashion', price: 120 },
  { sku: 'PROD-007', name: 'Laptop Stand', category: 'Office', price: 65 },
  { sku: 'PROD-008', name: 'Water Bottle', category: 'Fitness', price: 25 },
  { sku: 'PROD-009', name: 'Phone Case', category: 'Accessories', price: 35 },
  { sku: 'PROD-010', name: 'Desk Lamp', category: 'Office', price: 55 }
];

const CAMPAIGNS = [
  'Welcome Series', 'Product Recommendations', 'Abandoned Cart', 'Win-back', 'Seasonal Sale',
  'New Arrivals', 'Customer Feedback', 'Loyalty Program', 'Flash Sale', 'Newsletter'
];

const TAGS = [
  'high-value', 'frequent-buyer', 'price-sensitive', 'tech-enthusiast', 'fashion-forward',
  'fitness-focused', 'home-decor', 'gift-giver', 'early-adopter', 'bargain-hunter'
];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomChoices<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate realistic customer data
export function generateCustomer(id: string): Customer {
  const firstName = randomChoice(FIRST_NAMES);
  const lastName = randomChoice(LAST_NAMES);
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomChoice(['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'])}`;
  
  // Create more diverse customer profiles
  const customerType = Math.random();
  let firstPurchaseAt: string;
  let lastPurchaseAt: string | null;
  let totalOrders: number;
  let totalRevenue: number;
  let marginRate: number;
  let ltv: number;
  
  if (customerType < 0.1) {
    // 10% - New customers (high potential)
    firstPurchaseAt = dayjs().subtract(randomInt(1, 30), 'day').toISOString();
    lastPurchaseAt = dayjs().subtract(randomInt(1, 15), 'day').toISOString();
    totalOrders = randomInt(1, 3);
    totalRevenue = randomBetween(100, 800);
    marginRate = randomBetween(0.3, 0.5);
    ltv = totalRevenue * randomBetween(2.0, 4.0);
  } else if (customerType < 0.2) {
    // 10% - Churned customers (resurrectable)
    firstPurchaseAt = dayjs().subtract(randomInt(90, 365), 'day').toISOString();
    lastPurchaseAt = dayjs().subtract(randomInt(60, 120), 'day').toISOString();
    totalOrders = randomInt(3, 15);
    totalRevenue = randomBetween(500, 3000);
    marginRate = randomBetween(0.2, 0.4);
    ltv = totalRevenue * randomBetween(1.5, 2.5);
  } else if (customerType < 0.3) {
    // 10% - High value customers
    firstPurchaseAt = dayjs().subtract(randomInt(60, 300), 'day').toISOString();
    lastPurchaseAt = dayjs().subtract(randomInt(1, 30), 'day').toISOString();
    totalOrders = randomInt(8, 25);
    totalRevenue = randomBetween(2000, 8000);
    marginRate = randomBetween(0.4, 0.6);
    ltv = totalRevenue * randomBetween(1.8, 3.0);
  } else if (customerType < 0.4) {
    // 10% - Price sensitive customers
    firstPurchaseAt = dayjs().subtract(randomInt(30, 180), 'day').toISOString();
    lastPurchaseAt = dayjs().subtract(randomInt(1, 45), 'day').toISOString();
    totalOrders = randomInt(2, 8);
    totalRevenue = randomBetween(50, 500);
    marginRate = randomBetween(0.1, 0.3);
    ltv = totalRevenue * randomBetween(1.2, 2.0);
  } else if (customerType < 0.5) {
    // 10% - Seasonal customers
    firstPurchaseAt = dayjs().subtract(randomInt(120, 400), 'day').toISOString();
    lastPurchaseAt = dayjs().subtract(randomInt(60, 120), 'day').toISOString();
    totalOrders = randomInt(2, 6);
    totalRevenue = randomBetween(200, 1500);
    marginRate = randomBetween(0.2, 0.4);
    ltv = totalRevenue * randomBetween(1.5, 2.5);
  } else {
    // 50% - Regular customers
    firstPurchaseAt = dayjs().subtract(randomInt(30, 180), 'day').toISOString();
    lastPurchaseAt = Math.random() > 0.1 
      ? dayjs().subtract(randomInt(1, 60), 'day').toISOString()
      : null;
    totalOrders = randomInt(1, 15);
    totalRevenue = randomBetween(100, 2000);
    marginRate = randomBetween(0.2, 0.5);
    ltv = totalRevenue * randomBetween(1.2, 2.8);
  }
  
  const city = randomChoice(CITIES);
  const state = randomChoice(STATES);
  
  // Calculate additional properties
  const customerAge = dayjs().diff(dayjs(firstPurchaseAt), 'day');
  const daysSinceLastActivity = lastPurchaseAt 
    ? dayjs().diff(dayjs(lastPurchaseAt), 'day')
    : customerAge;
  
  // Generate email engagement data first
  const emailEngagement = {
    openRate: randomBetween(0.1, 0.8),
    clickRate: randomBetween(0.02, 0.3),
    unsubscribed: Math.random() < 0.05,
    lastOpenAt: Math.random() > 0.3 ? dayjs().subtract(randomInt(1, 30), 'day').toISOString() : null,
    lastClickAt: Math.random() > 0.7 ? dayjs().subtract(randomInt(1, 14), 'day').toISOString() : null
  };
  
  const riskScore = calculateRiskScore({
    id, name, email, firstPurchaseAt, lastPurchaseAt, totalOrders, totalRevenue, marginRate, ltv,
    riskScore: 0, riskBand: 'Low', ltvTier: 'Bronze', emailEngagement,
    location: { city, state, country: 'US' }, tags: [],
    loyaltyScore: 0, priceSensitivity: 'medium', customerAge, seasonalPattern: false,
    status: 'active', engagementScore: 0, daysSinceLastActivity
  });
  
  // Determine customer status
  let status: 'active' | 'churned' | 'dormant' = 'active';
  if (daysSinceLastActivity > 90 && riskScore > 70) {
    status = 'churned';
  } else if (daysSinceLastActivity > 60) {
    status = 'dormant';
  }
  
  // Calculate loyalty score based on various factors
  const loyaltyScore = Math.min(100, Math.max(0, 
    (totalOrders * 10) + 
    (totalRevenue / 50) + 
    (customerAge / 10) + 
    (emailEngagement.openRate * 30) +
    (Math.random() * 20 - 10) // Add some randomness
  ));
  
  // Calculate engagement score
  const engagementScore = Math.min(100, Math.max(0,
    (emailEngagement.openRate * 40) +
    (emailEngagement.clickRate * 60) +
    (totalOrders * 5) +
    (Math.random() * 20 - 10)
  ));
  
  return {
    id,
    name,
    email,
    avatarUrl: `https://images.unsplash.com/photo-${randomInt(1500000000000, 1600000000000)}?w=150&h=150&fit=crop&crop=face`,
    firstPurchaseAt,
    lastPurchaseAt,
    totalOrders,
    totalRevenue,
    marginRate,
    ltv,
    riskScore,
    riskBand: getRiskBand(riskScore),
    ltvTier: getLTVTier(ltv),
    emailEngagement,
    location: { city, state, country: 'US' },
    tags: randomChoices(TAGS, randomInt(1, 4)),
    loyaltyScore: Math.round(loyaltyScore),
    priceSensitivity: customerType < 0.4 ? 'high' : (customerType < 0.7 ? 'medium' : 'low'),
    customerAge,
    seasonalPattern: customerType >= 0.4 && customerType < 0.5, // Seasonal customers have seasonal patterns
    status,
    engagementScore: Math.round(engagementScore),
    daysSinceLastActivity
  };
}

export function generateTransaction(customerId: string, customer: Customer): Transaction {
  const itemCount = randomInt(1, 4);
  const items = randomChoices(PRODUCTS, itemCount).map(product => ({
    ...product,
    qty: randomInt(1, 3),
    price: product.price * randomBetween(0.8, 1.2)
  }));
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = Math.random() < 0.3 ? subtotal * randomBetween(0.05, 0.25) : 0;
  const refund = Math.random() < 0.05 ? subtotal * randomBetween(0.1, 0.5) : 0;
  
  return {
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    orderId: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    purchasedAt: dayjs(customer.firstPurchaseAt).add(randomInt(0, 180), 'day').toISOString(),
    items,
    subtotal,
    discount,
    refund
  };
}

export function generateSessionEvent(customerId: string): SessionEvent {
  const types: SessionEvent['type'][] = ['page_view', 'product_view', 'add_to_cart', 'checkout_start', 'rage_click', 'search'];
  
  return {
    id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    occurredAt: dayjs().subtract(randomInt(0, 30), 'day').toISOString(),
    type: randomChoice(types),
    metadata: {
      page: randomChoice(['/products', '/cart', '/checkout', '/home', '/search']),
      duration: randomInt(10, 300),
      ...(Math.random() > 0.5 && { productId: randomChoice(PRODUCTS).sku })
    }
  };
}

export function generateEmailEvent(customerId: string): EmailEvent {
  const types: EmailEvent['type'][] = ['delivered', 'open', 'click', 'unsubscribe', 'complaint'];
  
  return {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    occurredAt: dayjs().subtract(randomInt(0, 30), 'day').toISOString(),
    type: randomChoice(types),
    campaign: randomChoice(CAMPAIGNS)
  };
}

export function generateSupportTicket(customerId: string): SupportTicket {
  const subjects = [
    'Product not working as expected',
    'Shipping delay inquiry',
    'Return request',
    'Billing question',
    'Technical support needed',
    'Product recommendation request'
  ];
  
  return {
    id: `ticket-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    createdAt: dayjs().subtract(randomInt(0, 60), 'day').toISOString(),
    status: Math.random() > 0.3 ? 'closed' : 'open',
    sentiment: randomChoice(['negative', 'neutral', 'positive']),
    subject: randomChoice(subjects)
  };
}

export function generateReview(customerId: string): Review {
  const products = randomChoices(PRODUCTS, 3);
  const texts = [
    'Great product, highly recommend!',
    'Good value for money',
    'Could be better quality',
    'Exactly what I was looking for',
    'Fast shipping and good packaging',
    'Not as described',
    'Love this product!',
    'Average quality, decent price'
  ];
  
  return {
    id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    createdAt: dayjs().subtract(randomInt(0, 90), 'day').toISOString(),
    rating: randomInt(1, 5) as 1|2|3|4|5,
    product: randomChoice(products).name,
    text: randomChoice(texts)
  };
}

// Generate seed data
export function generateSeedData() {
  const customers: Customer[] = [];
  const transactions: Transaction[] = [];
  const sessionEvents: SessionEvent[] = [];
  const emailEvents: EmailEvent[] = [];
  const supportTickets: SupportTicket[] = [];
  const reviews: Review[] = [];
  
  // Generate 1000 customers for better segment distribution
  for (let i = 0; i < 1000; i++) {
    const customer = generateCustomer(`cust-${i.toString().padStart(3, '0')}`);
    customers.push(customer);
    
    // Generate 2-8 transactions per customer
    const transactionCount = randomInt(2, 8);
    for (let j = 0; j < transactionCount; j++) {
      transactions.push(generateTransaction(customer.id, customer));
    }
    
    // Generate 5-20 session events per customer
    const sessionCount = randomInt(5, 20);
    for (let j = 0; j < sessionCount; j++) {
      sessionEvents.push(generateSessionEvent(customer.id));
    }
    
    // Generate 3-15 email events per customer
    const emailCount = randomInt(3, 15);
    for (let j = 0; j < emailCount; j++) {
      emailEvents.push(generateEmailEvent(customer.id));
    }
    
    // Generate 0-3 support tickets per customer
    if (Math.random() < 0.3) {
      const ticketCount = randomInt(1, 3);
      for (let j = 0; j < ticketCount; j++) {
        supportTickets.push(generateSupportTicket(customer.id));
      }
    }
    
    // Generate 0-5 reviews per customer
    if (Math.random() < 0.4) {
      const reviewCount = randomInt(1, 5);
      for (let j = 0; j < reviewCount; j++) {
        reviews.push(generateReview(customer.id));
      }
    }
  }
  
  return {
    customers,
    transactions,
    sessionEvents,
    emailEvents,
    supportTickets,
    reviews
  };
}

// Predefined plays and experiments
export const DEFAULT_PLAYS: Play[] = [
  {
    id: 'play-001',
    name: '20% Discount Code',
    channel: 'Email',
    kind: 'Discount',
    eligibility: 'risk >= 50 AND ltvTier in [Bronze,Silver,Gold,VIP]',
    frequencyCapPer30d: 1,
    estUpliftPct: 15,
    estCostPctOfRev: 20,
    status: 'Active',
    description: 'Send personalized discount code to at-risk customers',
    copy: 'We miss you! Here\'s 20% off your next order. Use code SAVE20'
  },
  {
    id: 'play-002',
    name: 'Loyalty Points Bonus',
    channel: 'Email',
    kind: 'Loyalty',
    eligibility: 'risk >= 40 AND ltvTier in [Silver,Gold,VIP]',
    frequencyCapPer30d: 2,
    estUpliftPct: 12,
    estCostPctOfRev: 8,
    status: 'Active',
    description: 'Award bonus loyalty points to encourage return visits',
    copy: 'Earn 2x loyalty points on your next purchase!'
  },
  {
    id: 'play-003',
    name: 'Personalized Bundle',
    channel: 'On-site',
    kind: 'Bundle',
    eligibility: 'risk >= 60 AND ltvTier in [Gold,VIP]',
    frequencyCapPer30d: 1,
    estUpliftPct: 25,
    estCostPctOfRev: 15,
    status: 'Active',
    description: 'Show personalized product bundles on site',
    copy: 'Complete your look with these recommended items'
  },
  {
    id: 'play-004',
    name: 'Content Nurture Series',
    channel: 'Email',
    kind: 'Content',
    eligibility: 'risk >= 30 AND emailEngagement.openRate >= 0.2',
    frequencyCapPer30d: 3,
    estUpliftPct: 8,
    estCostPctOfRev: 2,
    status: 'Active',
    description: 'Send educational content to re-engage customers',
    copy: 'Tips and tricks to get the most out of your purchase'
  },
  {
    id: 'play-005',
    name: 'CS Outreach Call',
    channel: 'CS',
    kind: 'Service',
    eligibility: 'risk >= 70 AND ltvTier in [Gold,VIP]',
    frequencyCapPer30d: 1,
    estUpliftPct: 35,
    estCostPctOfRev: 5,
    status: 'Active',
    description: 'Proactive customer service outreach',
    copy: 'We\'d love to hear about your experience and help with any questions'
  }
];

export const DEFAULT_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-001',
    name: 'Discount vs Loyalty Points',
    segment: 'Medium Risk Customers',
    treatmentPlayId: 'play-001',
    controlPct: 50,
    startAt: dayjs().subtract(14, 'day').toISOString(),
    endAt: dayjs().add(14, 'day').toISOString(),
    status: 'Running'
  },
  {
    id: 'exp-002',
    name: 'Bundle Recommendation Test',
    segment: 'High Value Customers',
    treatmentPlayId: 'play-003',
    controlPct: 30,
    startAt: dayjs().subtract(30, 'day').toISOString(),
    endAt: dayjs().subtract(7, 'day').toISOString(),
    status: 'Completed',
    results: {
      incrementalRevenue: 12500,
      winner: 'Treatment',
      pValue: 0.023,
      upliftPct: 18.5
    }
  }
];
