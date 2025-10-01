import { create } from 'zustand';
import { Customer, ActivityEvent, KPIs, ChartData } from './types';
import dayjs from 'dayjs';

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  
  // Live data
  kpis: KPIs;
  activityFeed: ActivityEvent[];
  lastUpdate: string;
  
  // Update methods
  updateKPIs: (kpis: Partial<KPIs>) => void;
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'occurredAt'>) => void;
  
  // Real-time simulation
  isLiveMode: boolean;
  liveUpdateInterval: NodeJS.Timeout | null;
  startLiveUpdates: () => void;
  stopLiveUpdates: () => void;
  setLiveMode: (enabled: boolean) => void;
}

// Generate random activity events
function generateRandomActivity(): Omit<ActivityEvent, 'id' | 'occurredAt'> {
  const activities = [
    {
      type: 'risk_detected' as const,
      message: 'New high-risk customer detected: Sarah Johnson (Risk Score: 78)',
      metadata: { customerId: 'cust-123', riskScore: 78 }
    },
    {
      type: 'play_triggered' as const,
      message: 'Discount code sent to 15 at-risk customers',
      metadata: { playId: 'play-001', customerCount: 15 }
    },
    {
      type: 'customer_engaged' as const,
      message: 'Customer opened email and clicked through to product page',
      metadata: { customerId: 'cust-456', action: 'email_click' }
    },
    {
      type: 'revenue_impact' as const,
      message: 'Retention campaign generated $2,340 in incremental revenue',
      metadata: { revenue: 2340, campaign: 'loyalty-bonus' }
    },
    {
      type: 'experiment_started' as const,
      message: 'New A/B test launched: Bundle Recommendations vs Control',
      metadata: { experimentId: 'exp-003', segment: 'high-value' }
    }
  ];
  
  return activities[Math.floor(Math.random() * activities.length)];
}

export const useAppStore = create<AppState>((set, get) => ({
  // Authentication
  isAuthenticated: false,
  user: null,
  
  login: (email: string, password: string) => {
    // Mock login - any credentials work
    set({
      isAuthenticated: true,
      user: { name: 'Demo User', email }
    });
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('churn-demo-auth', JSON.stringify({ email, name: 'Demo User' }));
    }
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null
    });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('churn-demo-auth');
    }
  },
  
  // Live data
  kpis: {
    atRiskCustomers: 1247,
    predictedChurnRate: 12.3,
    retainedRevenue30d: 2845000,
    avgTreatmentEffect: 18.7
  },
  
  activityFeed: [
    {
      id: 'activity-001',
      type: 'risk_detected',
      message: 'New high-risk customer detected: Alex Chen (Risk Score: 82)',
      occurredAt: dayjs().subtract(2, 'minute').toISOString(),
      metadata: { customerId: 'cust-001', riskScore: 82 }
    },
    {
      id: 'activity-002',
      type: 'play_triggered',
      message: 'Loyalty points bonus sent to 23 customers',
      occurredAt: dayjs().subtract(5, 'minute').toISOString(),
      metadata: { playId: 'play-002', customerCount: 23 }
    },
    {
      id: 'activity-003',
      type: 'revenue_impact',
      message: 'Retention campaign generated $1,890 in incremental revenue',
      occurredAt: dayjs().subtract(8, 'minute').toISOString(),
      metadata: { revenue: 1890, campaign: 'discount-code' }
    }
  ],
  
  lastUpdate: dayjs().toISOString(),
  
  updateKPIs: (kpisUpdate) => {
    set(state => ({
      kpis: { ...state.kpis, ...kpisUpdate },
      lastUpdate: dayjs().toISOString()
    }));
  },
  
  addActivityEvent: (event) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      occurredAt: dayjs().toISOString()
    };
    
    set(state => ({
      activityFeed: [newEvent, ...state.activityFeed.slice(0, 49)], // Keep last 50 events
      lastUpdate: dayjs().toISOString()
    }));
  },
  
  // Real-time simulation
  isLiveMode: true,
  liveUpdateInterval: null as NodeJS.Timeout | null,
  
  startLiveUpdates: () => {
    const interval = setInterval(() => {
      const state = get();
      if (!state.isLiveMode) return;
      
      // Randomly update KPIs slightly
      if (Math.random() < 0.3) {
        const kpisUpdate: Partial<KPIs> = {};
        
        if (Math.random() < 0.5) {
          kpisUpdate.atRiskCustomers = Math.max(0, state.kpis.atRiskCustomers + Math.floor(Math.random() * 6 - 3));
        }
        if (Math.random() < 0.5) {
          kpisUpdate.predictedChurnRate = Math.max(0, state.kpis.predictedChurnRate + (Math.random() * 0.6 - 0.3));
        }
        if (Math.random() < 0.5) {
          kpisUpdate.retainedRevenue30d = Math.max(0, state.kpis.retainedRevenue30d + Math.floor(Math.random() * 20000 - 10000));
        }
        if (Math.random() < 0.5) {
          kpisUpdate.avgTreatmentEffect = Math.max(0, state.kpis.avgTreatmentEffect + (Math.random() * 0.4 - 0.2));
        }
        
        state.updateKPIs(kpisUpdate);
      }
      
      // Add random activity event
      if (Math.random() < 0.4) {
        state.addActivityEvent(generateRandomActivity());
      }
    }, 8000); // Update every 8 seconds
    
    set({ liveUpdateInterval: interval });
  },
  
  stopLiveUpdates: () => {
    const state = get();
    if (state.liveUpdateInterval) {
      clearInterval(state.liveUpdateInterval);
      set({ liveUpdateInterval: null });
    }
  },
  
  setLiveMode: (enabled) => {
    set({ isLiveMode: enabled });
    const state = get();
    
    if (enabled && !state.liveUpdateInterval) {
      state.startLiveUpdates();
    } else if (!enabled && state.liveUpdateInterval) {
      state.stopLiveUpdates();
    }
  }
}));

// Initialize authentication from localStorage
if (typeof window !== 'undefined') {
  const savedAuth = localStorage.getItem('churn-demo-auth');
  if (savedAuth) {
    try {
      const { email, name } = JSON.parse(savedAuth);
      useAppStore.setState({
        isAuthenticated: true,
        user: { name, email }
      });
    } catch (error) {
      console.error('Failed to parse saved auth:', error);
    }
  }
}
