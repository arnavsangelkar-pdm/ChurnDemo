import { 
  Customer, 
  Transaction, 
  SessionEvent, 
  EmailEvent, 
  SupportTicket, 
  Review, 
  Play, 
  Experiment,
  ActivityEvent,
  KPIs
} from './types'
import { generateSeedData, DEFAULT_PLAYS, DEFAULT_EXPERIMENTS } from './seed'
import { simulateExperimentResults } from './fake-ml'

// In-memory data store
class DataStore {
  private customers: Customer[] = []
  private transactions: Transaction[] = []
  private sessionEvents: SessionEvent[] = []
  private emailEvents: EmailEvent[] = []
  private supportTickets: SupportTicket[] = []
  private reviews: Review[] = []
  private plays: Play[] = [...DEFAULT_PLAYS]
  private experiments: Experiment[] = [...DEFAULT_EXPERIMENTS]
  private activityLog: ActivityEvent[] = []
  private isInitialized = false

  initialize() {
    if (this.isInitialized) return

    const seedData = generateSeedData()
    this.customers = seedData.customers
    this.transactions = seedData.transactions
    this.sessionEvents = seedData.sessionEvents
    this.emailEvents = seedData.emailEvents
    this.supportTickets = seedData.supportTickets
    this.reviews = seedData.reviews

    this.isInitialized = true
  }

  // Customer methods
  getCustomers(filters?: {
    search?: string
    riskBand?: string
    ltvTier?: string
    limit?: number
    offset?: number
  }) {
    let filtered = [...this.customers]

    if (filters?.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.id.toLowerCase().includes(search)
      )
    }

    if (filters?.riskBand) {
      filtered = filtered.filter(c => c.riskBand === filters.riskBand)
    }

    if (filters?.ltvTier) {
      filtered = filtered.filter(c => c.ltvTier === filters.ltvTier)
    }

    const total = filtered.length
    const offset = filters?.offset || 0
    const limit = filters?.limit || 50

    return {
      customers: filtered.slice(offset, offset + limit),
      total,
      hasMore: offset + limit < total
    }
  }

  getCustomer(id: string) {
    return this.customers.find(c => c.id === id)
  }

  getCustomerTimeline(customerId: string) {
    const customer = this.getCustomer(customerId)
    if (!customer) return []

    const timeline = [
      ...this.transactions
        .filter(t => t.customerId === customerId)
        .map(t => ({ ...t, type: 'transaction' as const })),
      ...this.sessionEvents
        .filter(s => s.customerId === customerId)
        .map(s => ({ ...s, type: 'session' as const })),
      ...this.emailEvents
        .filter(e => e.customerId === customerId)
        .map(e => ({ ...e, type: 'email' as const })),
      ...this.supportTickets
        .filter(st => st.customerId === customerId)
        .map(st => ({ ...st, type: 'support' as const })),
      ...this.reviews
        .filter(r => r.customerId === customerId)
        .map(r => ({ ...r, type: 'review' as const }))
    ]

    return timeline.sort((a, b) => {
      const getTime = (event: any) => {
        if (event.occurredAt) return new Date(event.occurredAt).getTime()
        if (event.createdAt) return new Date(event.createdAt).getTime()
        if (event.purchasedAt) return new Date(event.purchasedAt).getTime()
        return 0
      }
      return getTime(b) - getTime(a)
    })
  }

  // Play methods
  getPlays() {
    return [...this.plays]
  }

  getPlay(id: string) {
    return this.plays.find(p => p.id === id)
  }

  createPlay(play: Omit<Play, 'id'>) {
    const newPlay: Play = {
      ...play,
      id: `play-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    this.plays.push(newPlay)
    return newPlay
  }

  updatePlay(id: string, updates: Partial<Play>) {
    const index = this.plays.findIndex(p => p.id === id)
    if (index !== -1) {
      this.plays[index] = { ...this.plays[index], ...updates }
      return this.plays[index]
    }
    return null
  }

  // Experiment methods
  getExperiments() {
    return [...this.experiments]
  }

  getExperiment(id: string) {
    return this.experiments.find(e => e.id === id)
  }

  createExperiment(experiment: Omit<Experiment, 'id'>) {
    const newExperiment: Experiment = {
      ...experiment,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    this.experiments.push(newExperiment)
    return newExperiment
  }

  completeExperiment(id: string) {
    const experiment = this.getExperiment(id)
    if (experiment && experiment.status === 'Running') {
      const treatmentPlay = this.getPlay(experiment.treatmentPlayId)
      if (treatmentPlay) {
        const results = simulateExperimentResults(
          treatmentPlay,
          experiment.controlPct,
          1000 // Mock segment size
        )
        
        experiment.status = 'Completed'
        experiment.endAt = new Date().toISOString()
        experiment.results = results
        
        return experiment
      }
    }
    return null
  }

  // Activity methods
  getActivityLog() {
    return [...this.activityLog]
  }

  addActivityEvent(event: Omit<ActivityEvent, 'id' | 'occurredAt'>) {
    const newEvent: ActivityEvent = {
      ...event,
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      occurredAt: new Date().toISOString()
    }
    this.activityLog.unshift(newEvent)
    
    // Keep only last 100 events
    if (this.activityLog.length > 100) {
      this.activityLog = this.activityLog.slice(0, 100)
    }
    
    return newEvent
  }

  // KPI methods
  getKPIs(): KPIs {
    const highRiskCustomers = this.customers.filter(c => c.riskBand === 'High').length
    const totalCustomers = this.customers.length
    const avgRiskScore = this.customers.reduce((sum, c) => sum + c.riskScore, 0) / totalCustomers
    
    return {
      atRiskCustomers: highRiskCustomers,
      predictedChurnRate: avgRiskScore,
      retainedRevenue30d: this.customers.reduce((sum, c) => sum + c.totalRevenue, 0) * 0.3,
      unclaimedRevenue: this.customers.reduce((sum, c) => sum + c.totalRevenue, 0) * 0.4 // Mock value
    }
  }

  // Reset data
  resetData() {
    this.initialize()
  }
}

// Singleton instance
export const dataStore = new DataStore()

// Initialize on import
dataStore.initialize()
