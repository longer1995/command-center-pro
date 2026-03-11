// Command Center Pro - Configuration File
// Customize these settings for your specific needs

const CONFIG = {
  // Business Settings
  BUSINESS: {
    companyName: 'Longer Industries',
    location: 'Houston, TX',
    monthlyTarget: 14000, // $14K monthly revenue target
    defaultCommissionRate: 6, // 6% commission rate
    targetCurrency: 'USD'
  },

  // Revenue Targets
  TARGETS: {
    monthlyRevenue: 14000,
    yearlyRevenue: 168000, // $14K * 12
    avgDealSize: 700, // Target average commission per deal
    dealsPerMonth: 20, // Target number of deals per month
    quickWinThreshold: 25000, // Deals under $25K for quick wins
    highValueThreshold: 5000 // Commission threshold for high-value deals
  },

  // Matching Algorithm Settings
  MATCHING: {
    minimumScore: 30, // Minimum match score to display
    highConfidenceThreshold: 80, // 80%+ = high confidence
    mediumConfidenceThreshold: 60, // 60-79% = medium confidence
    priceMarkupPercent: 6, // Default markup percentage
    locationBonusPoints: 10, // Bonus for same-state matches
    urgencyBonusPoints: 5, // Bonus for urgent buyers
    categoryMatchPoints: 30 // Base points for category matching
  },

  // API & Sync Settings
  API: {
    syncIntervals: {
      default: 900000, // 15 minutes in milliseconds
      options: [
        { label: '15 minutes', value: 900000 },
        { label: '30 minutes', value: 1800000 },
        { label: '1 hour', value: 3600000 },
        { label: '4 hours', value: 14400000 }
      ]
    },
    autoMatch: true, // Run matching after sync
    maxRetries: 3, // API retry attempts
    timeoutMs: 30000 // 30 second timeout
  },

  // Data Sources Configuration
  SOURCES: {
    'SAM.gov': {
      enabled: true,
      priority: 'high',
      syncFrequency: 4 * 60 * 60 * 1000, // 4 hours
      categories: ['equipment', 'machinery', 'arms'],
      searchKeywords: [
        'heavy equipment', 'construction equipment', 'military vehicle',
        'generator', 'truck', 'excavator', 'dozer', 'loader'
      ]
    },
    'GovPlanet': {
      enabled: true,
      priority: 'high',
      syncFrequency: 1 * 60 * 60 * 1000, // 1 hour
      categories: ['equipment', 'machinery', 'arms'],
      respectRateLimit: true
    },
    'IronPlanet': {
      enabled: true,
      priority: 'medium',
      syncFrequency: 2 * 60 * 60 * 1000, // 2 hours
      categories: ['machinery', 'equipment']
    },
    'Direct': {
      enabled: true,
      priority: 'high',
      categories: ['valves', 'equipment', 'machinery', 'arms', 'ammo']
    }
  },

  // Geographic Settings
  GEOGRAPHY: {
    primaryMarkets: ['Texas', 'Louisiana', 'Oklahoma', 'New Mexico'],
    internationalMarkets: ['Mexico', 'Colombia', 'Iraq', 'Philippines'],
    shippingCostFactors: {
      local: 1.0, // Same state
      regional: 1.1, // Neighboring states  
      national: 1.2, // Cross-country
      international: 1.5 // International shipping
    }
  },

  // Industry-Specific Settings
  INDUSTRIES: {
    oilAndGas: {
      categories: ['valves', 'equipment'],
      keywords: ['valve', 'gate', 'ball', 'wellhead', 'BOP', 'choke'],
      highValue: true,
      avgMargin: 0.15 // 15% average margin
    },
    defense: {
      categories: ['arms', 'ammo', 'equipment'],
      keywords: ['rifle', 'pistol', 'ammunition', 'vehicle', 'armor'],
      requiresLicense: true,
      avgMargin: 0.20 // 20% average margin
    },
    construction: {
      categories: ['machinery', 'equipment'],
      keywords: ['excavator', 'dozer', 'loader', 'crane', 'truck'],
      seasonal: true,
      avgMargin: 0.10 // 10% average margin
    }
  },

  // Notification Settings
  NOTIFICATIONS: {
    toast: {
      duration: 4000, // 4 seconds
      position: 'top-right'
    },
    alerts: {
      highValueMatch: true, // Alert for matches with high commissions
      urgentBuyer: true, // Alert for urgent buyers
      apiFailure: true, // Alert for API sync failures
      dailySummary: false // Daily summary notifications
    },
    channels: {
      browser: true, // Browser notifications
      email: false, // Email notifications (requires setup)
      sms: false // SMS notifications (requires setup)
    }
  },

  // Export Settings
  EXPORT: {
    formats: ['CSV', 'Excel', 'PDF'],
    defaultFormat: 'CSV',
    includeConfidentialData: false,
    maxRecords: 1000
  },

  // Performance Settings
  PERFORMANCE: {
    maxSupplyRecords: 10000,
    maxDemandRecords: 5000,
    maxMatchesDisplayed: 100,
    tablePagination: 50,
    autoSave: true,
    autoSaveInterval: 300000 // 5 minutes
  },

  // UI Customization
  UI: {
    theme: 'dark', // 'dark' or 'light'
    compactMode: false,
    showAdvancedFilters: true,
    defaultPanel: 'dashboard',
    showBadges: true, // Show notification badges
    animateTransitions: true
  },

  // Security Settings
  SECURITY: {
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours
    maxLoginAttempts: 5,
    requireStrongPasswords: false, // Future feature
    encryptSensitiveData: false, // Future feature
    auditTrail: true
  },

  // Feature Flags
  FEATURES: {
    aiMatching: true,
    revenueTracking: true,
    apiIntegration: true,
    exportFunctionality: true,
    advancedFiltering: true,
    dealPipeline: true,
    mobileResponsive: true,
    realTimeSync: false, // Future feature
    collaborativeEditing: false, // Future feature
    mlPredictions: false // Future feature
  },

  // Development Settings
  DEVELOPMENT: {
    debugMode: false,
    mockApiCalls: true, // Use mock data for development
    verboseLogging: false,
    testDataEnabled: true,
    bypassRateLimits: false
  }
};

// Validation function to ensure config integrity
function validateConfig() {
  const errors = [];
  
  if (CONFIG.TARGETS.monthlyRevenue !== CONFIG.BUSINESS.monthlyTarget) {
    errors.push('Monthly revenue target mismatch between BUSINESS and TARGETS');
  }
  
  if (CONFIG.MATCHING.highConfidenceThreshold <= CONFIG.MATCHING.mediumConfidenceThreshold) {
    errors.push('High confidence threshold must be greater than medium confidence threshold');
  }
  
  if (CONFIG.MATCHING.minimumScore >= CONFIG.MATCHING.mediumConfidenceThreshold) {
    errors.push('Minimum score should be less than medium confidence threshold');
  }
  
  return errors;
}

// Initialize configuration with validation
function initConfig() {
  const errors = validateConfig();
  if (errors.length > 0) {
    console.warn('Configuration validation errors:', errors);
  }
  
  // Apply configuration to global scope
  window.COMMAND_CENTER_CONFIG = CONFIG;
  
  // Apply UI theme
  if (CONFIG.UI.theme === 'light') {
    document.documentElement.classList.add('light-theme');
  }
  
  console.log('Command Center Pro configuration loaded successfully');
  return CONFIG;
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, validateConfig, initConfig };
} else {
  // Browser environment
  window.CONFIG = CONFIG;
  window.validateConfig = validateConfig;
  window.initConfig = initConfig;
}

// Usage Examples:
// 
// 1. Change monthly target:
//    CONFIG.BUSINESS.monthlyTarget = 20000;
//
// 2. Adjust matching sensitivity:
//    CONFIG.MATCHING.minimumScore = 40;
//
// 3. Enable real-time notifications:
//    CONFIG.NOTIFICATIONS.channels.email = true;
//
// 4. Add new data source:
//    CONFIG.SOURCES['NewSource'] = { enabled: true, priority: 'medium' };
//
// 5. Customize for different markets:
//    CONFIG.GEOGRAPHY.primaryMarkets.push('California');
//
// 6. Industry-specific tuning:
//    CONFIG.INDUSTRIES.oilAndGas.avgMargin = 0.18;