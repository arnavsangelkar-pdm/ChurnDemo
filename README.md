# ChurnGuard - AI-Powered Retention & Churn Prevention Demo

A comprehensive, production-ready demo of an AI-powered customer retention and churn prevention platform. This application showcases realistic dashboards, customer management, retention plays, A/B testing, and live data updates - all with mock data for demonstration purposes.

## 🚀 Features

### Core Functionality
- **Real-time Dashboard** - Live KPIs, charts, and activity feed
- **Customer Management** - Detailed customer profiles with risk scoring and timeline
- **Segments & Bulk Actions** - Customer segmentation with bulk play triggering
- **Retention Plays** - Create and manage retention campaigns
- **A/B Testing** - Experiment management with statistical results
- **Settings & Preferences** - Configurable platform settings

### Technical Features
- **Mock Authentication** - Any email/password combination works
- **Live Data Updates** - Simulated real-time updates every 8 seconds
- **Error Simulation** - Random API errors with retry mechanisms
- **Dark Mode** - Full dark/light theme support
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Type Safety** - Full TypeScript implementation

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Date Handling**: Day.js
- **Notifications**: Sonner

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd churn-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment to Render

### One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Manual Deploy

1. **Connect your repository** to Render
2. **Create a new Web Service** with these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
   - **Plan**: `Free` (or higher for production)

3. **Set environment variables**:
   ```
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
   ```

4. **Deploy** - Render will automatically build and deploy your app

### Using render.yaml
The included `render.yaml` file provides a complete configuration for automatic deployment:

```yaml
services:
  - type: web
    name: churn-demo
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

## 📊 Data Model

The application uses a comprehensive mock data model with:

- **500+ Customers** with realistic profiles, risk scores, and engagement metrics
- **Transaction History** with product details and revenue data
- **Email Events** tracking opens, clicks, and engagement
- **Session Events** including page views, cart actions, and user behavior
- **Support Tickets** with sentiment analysis
- **Product Reviews** with ratings and feedback
- **Retention Plays** with eligibility rules and performance metrics
- **A/B Experiments** with statistical results and winner determination

## 🎯 Key Pages

### Dashboard (`/dashboard`)
- Real-time KPIs (At-Risk Customers, Churn Rate, Revenue, Treatment Effect)
- Interactive charts (Risk by Cohort, Risk Over Time, Offer Mix)
- Live activity feed with simulated events

### Customers (`/customers`)
- Searchable and filterable customer list
- Detailed customer profiles with timeline
- Risk scoring and LTV tier classification
- Email engagement metrics

### Segments (`/segments`)
- Predefined customer segments
- Bulk selection and actions
- Segment performance metrics
- Apply plays to multiple customers

### Plays (`/plays`)
- Create and manage retention campaigns
- Play simulation with estimated impact
- Eligibility rules and frequency caps
- Performance tracking

### Experiments (`/experiments`)
- A/B test management
- Statistical significance testing
- Winner determination
- Revenue impact measurement

### Settings (`/settings`)
- Platform configuration
- Real-time mode controls
- Data management options
- Demo data reset functionality

## 🔧 Development

### Project Structure
```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (app)/             # Main application pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard-specific components
│   └── customers/        # Customer-specific components
├── lib/                  # Utility functions and data
│   ├── types.ts         # TypeScript type definitions
│   ├── store.ts         # Zustand state management
│   ├── seed.ts          # Mock data generation
│   ├── fake-ml.ts       # Mock ML algorithms
│   └── utils.ts         # Utility functions
└── public/              # Static assets
```

### Key Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Adding New Features
1. **Create components** in the appropriate directory
2. **Add types** to `lib/types.ts`
3. **Update the store** in `lib/store.ts` if needed
4. **Add API routes** in `app/api/`
5. **Update navigation** in `components/layout/sidebar.tsx`

## 🎨 Customization

### Theming
The app uses Tailwind CSS with a custom design system. Key customization points:

- **Colors**: Defined in `tailwind.config.js` and `app/globals.css`
- **Components**: shadcn/ui components in `components/ui/`
- **Layout**: Responsive grid system with consistent spacing

### Data Customization
- **Customer Data**: Modify `lib/seed.ts` to change customer generation
- **Risk Scoring**: Update `lib/fake-ml.ts` for different risk algorithms
- **Plays**: Edit `DEFAULT_PLAYS` in `lib/seed.ts`

## 🔍 Mock Intelligence

The application includes sophisticated mock AI features:

### Risk Scoring Algorithm
- **Recency Factor**: Days since last purchase
- **Frequency Factor**: Average days between orders
- **Email Engagement**: Open rates and subscription status
- **Revenue Trends**: Average order value analysis
- **Tenure Factor**: Customer lifetime duration

### Next Best Action
- **Eligibility Rules**: Rule-based play selection
- **Scoring System**: Weighted scoring based on customer profile
- **Margin Optimization**: Cost vs. uplift analysis

### Experiment Simulation
- **Statistical Significance**: Mock p-value calculation
- **Winner Determination**: Treatment vs. control comparison
- **Revenue Impact**: Incremental revenue estimation

## 🚨 Error Handling

The application includes realistic error simulation:

- **5% API Error Rate**: Random 500 errors for realism
- **Variable Latency**: 200-800ms response times
- **Retry Mechanisms**: User-friendly error recovery
- **Loading States**: Skeleton loaders and progress indicators

## 📱 Responsive Design

- **Mobile-First**: Optimized for all screen sizes
- **Touch-Friendly**: Large tap targets and gestures
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility**: WCAG 2.1 AA compliant

## 🔐 Security

- **Mock Authentication**: No real security implementation
- **Route Guards**: Client-side authentication checks
- **Input Validation**: Form validation and sanitization
- **XSS Protection**: React's built-in XSS prevention

## 📈 Performance

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Built-in bundle analyzer
- **Caching**: API response caching and memoization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Next.js** for the React framework
- **Render** for the deployment platform

---

**Note**: This is a demonstration application with mock data. Do not use in production without proper security, authentication, and data validation implementations.
