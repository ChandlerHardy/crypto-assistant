export interface DashboardSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  component: 'summary-cards' | 'performance-chart' | 'portfolio-list' | 'top-cryptos';
  size: 'full' | 'half' | 'quarter' | 'three-quarters';
}

export interface DashboardLayout {
  sections: DashboardSection[];
  lastModified: string;
}

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayout = {
  sections: [
    {
      id: 'summary-cards',
      title: 'Portfolio Summary',
      enabled: true,
      order: 0,
      component: 'summary-cards',
      size: 'full'
    },
    {
      id: 'performance-chart',
      title: 'Performance Chart',
      enabled: true,
      order: 1,
      component: 'performance-chart',
      size: 'full'
    },
    {
      id: 'portfolio-list',
      title: 'Your Portfolios',
      enabled: true,
      order: 2,
      component: 'portfolio-list',
      size: 'full'
    },
    {
      id: 'top-cryptos',
      title: 'Top Cryptocurrencies',
      enabled: true,
      order: 3,
      component: 'top-cryptos',
      size: 'quarter'
    }
  ],
  lastModified: new Date().toISOString()
};

export const DASHBOARD_PRESETS: Record<string, DashboardLayout> = {
  default: DEFAULT_DASHBOARD_LAYOUT,
  trading: {
    sections: [
      { ...DEFAULT_DASHBOARD_LAYOUT.sections[1], order: 0, size: 'half' }, // Chart first - half width
      { ...DEFAULT_DASHBOARD_LAYOUT.sections[2], order: 1, size: 'half' }, // Top cryptos - half width
      { ...DEFAULT_DASHBOARD_LAYOUT.sections[0], order: 2 }, // Summary cards
      { ...DEFAULT_DASHBOARD_LAYOUT.sections[3], order: 3 }  // Portfolio list
    ],
    lastModified: new Date().toISOString()
  },
  minimal: {
    sections: [
      { ...DEFAULT_DASHBOARD_LAYOUT.sections[0], order: 0 },
      { ...DEFAULT_DASHBOARD_LAYOUT.sections[3], order: 1, enabled: true }
    ].concat([
      { ...DEFAULT_DASHBOARD_LAYOUT.sections[1], enabled: false, order: 2 },
      { ...DEFAULT_DASHBOARD_LAYOUT.sections[2], enabled: false, order: 3 }
    ]),
    lastModified: new Date().toISOString()
  }
};