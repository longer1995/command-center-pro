# API Integration Guide

## 🌐 Live Data Sources

### 1. SAM.gov API

**Purpose**: Federal contract opportunities and entity registration
**Status**: Framework ready, needs API key

```javascript
// API Endpoint Structure
const SAM_API = {
  baseUrl: 'https://api.sam.gov/opportunities/v2/search',
  apiKey: 'YOUR_SAM_GOV_API_KEY',
  methods: {
    searchOpportunities: async (params) => {
      // Search federal opportunities
      const response = await fetch(`${SAM_API.baseUrl}?api_key=${SAM_API.apiKey}&${params}`);
      return response.json();
    }
  }
}
```

**Key Parameters**:
- `keyword`: Search terms (equipment, machinery, etc.)
- `postedFrom`/`postedTo`: Date range filters
- `awardNumber`: Specific award tracking
- `naicsCode`: Industry classification codes

**Sample Integration**:
```javascript
async function syncSAMOpportunities() {
  try {
    const params = new URLSearchParams({
      keyword: 'heavy equipment',
      postedFrom: '30 days ago',
      limit: 100
    });
    
    const data = await SAM_API.searchOpportunities(params);
    const opportunities = data.opportunitiesData;
    
    opportunities.forEach(opp => {
      // Convert to demand format
      const demandEntry = {
        id: nextId(demandData),
        buyer: opp.organizationName,
        need: opp.title,
        category: categorizeFromDescription(opp.description),
        budget: extractBudget(opp.description),
        location: opp.placeOfPerformance,
        urgency: 'normal',
        date: opp.postedDate,
        source: 'SAM.gov',
        link: opp.uiLink,
        requirements: opp.description
      };
      
      demandData.push(demandEntry);
    });
    
    saveData('demand', demandData);
  } catch (error) {
    console.error('SAM.gov sync failed:', error);
  }
}
```

### 2. GovPlanet Web Scraping

**Purpose**: Government surplus vehicle and equipment auctions
**Status**: Requires web scraping implementation

```javascript
// Web Scraping Structure (requires server-side implementation)
const GOVPLANET_SCRAPER = {
  baseUrl: 'https://www.govplanet.com/search',
  categories: ['trucks', 'heavy-equipment', 'generators', 'trailers'],
  
  // This would run server-side with Puppeteer or similar
  scrapeAuctions: async () => {
    // Server-side scraping implementation needed
    // Returns array of auction items
  }
}
```

**Data Mapping**:
```javascript
function mapGovPlanetToSupply(item) {
  return {
    id: nextId(supplyData),
    item: item.title,
    category: categorizeEquipment(item.title),
    source: 'GovPlanet',
    seller: 'DLA Disposition',
    model: extractModel(item.title),
    price: item.currentBid || item.reservePrice,
    location: item.location,
    condition: item.condition || 'unknown',
    date: new Date().toISOString().slice(0,10),
    link: item.url,
    notes: `Auction ends: ${item.auctionEndDate}`,
    apiSource: 'govplanet'
  };
}
```

### 3. IronPlanet Integration

**Purpose**: Heavy equipment marketplace
**Status**: API exploration needed

```javascript
const IRONPLANET_API = {
  // Note: IronPlanet may not have public API
  // May require partnership or scraping approach
  searchUrl: 'https://www.ironplanet.com/search',
  categories: ['excavators', 'dozers', 'loaders', 'cranes']
}
```

### 4. Defense Industry APIs

**GunBroker API** (if available):
```javascript
const GUNBROKER_API = {
  baseUrl: 'https://api.gunbroker.com/v1',
  // Requires FFL verification and API access
  categories: ['firearms', 'ammunition', 'accessories']
}
```

---

## 🔧 Implementation Strategy

### Phase 1: SAM.gov Integration (Week 1)
1. **API Key Acquisition**
   - Register at sam.gov
   - Apply for API access (may take 3-5 business days)
   - Test with basic opportunity search

2. **Data Pipeline**
   - Implement sync function
   - Add error handling
   - Create sync logging

3. **Testing**
   - Start with limited keyword searches
   - Validate data mapping
   - Monitor rate limits

### Phase 2: Web Scraping Setup (Week 2-3)
1. **Server Infrastructure**
   - Set up Node.js server for scraping
   - Install Puppeteer/Playwright
   - Implement rate limiting

2. **GovPlanet Scraper**
   - Build auction item parser
   - Handle pagination
   - Monitor for site changes

3. **Data Quality**
   - Implement duplicate detection
   - Add data validation
   - Create update mechanisms

### Phase 3: Advanced Features (Month 2)
1. **Real-time Alerts**
   - Email notifications for new matches
   - SMS alerts for urgent opportunities
   - Webhook integration capabilities

2. **Machine Learning**
   - Improve matching accuracy
   - Price prediction models
   - Market trend analysis

---

## 📊 Data Synchronization

### Sync Frequency Recommendations
- **SAM.gov**: Every 4 hours (respects rate limits)
- **GovPlanet**: Every hour during business hours
- **IronPlanet**: Every 2 hours
- **Manual Sources**: On-demand only

### Rate Limiting Strategy
```javascript
const RATE_LIMITS = {
  'SAM.gov': {
    requestsPerMinute: 10,
    requestsPerDay: 1000
  },
  'GovPlanet': {
    requestsPerMinute: 2, // Respectful scraping
    concurrent: 1
  }
}
```

### Error Handling
```javascript
async function syncWithRetry(source, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await syncSource(source);
      return { status: 'success', attempts: i + 1 };
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000); // Exponential backoff
    }
  }
}
```

---

## 🚀 Production Deployment

### Server Requirements
- **Node.js 18+** for web scraping
- **Redis** for rate limiting and caching  
- **PostgreSQL** for production data storage
- **Email Service** (SendGrid, AWS SES) for notifications

### Environment Variables
```bash
# API Keys
SAM_GOV_API_KEY=your_sam_api_key
GOVPLANET_USER_AGENT=your_scraper_ua

# Database
DATABASE_URL=postgresql://user:pass@host:port/dbname
REDIS_URL=redis://host:port

# Notifications  
SENDGRID_API_KEY=your_sendgrid_key
SMS_SERVICE_KEY=your_sms_key
```

### Deployment Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Server    │    │   Data Sources  │
│   (Browser)     │◄──►│   (Node.js)     │◄──►│   (SAM.gov,     │
│                 │    │                 │    │    GovPlanet)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌─────────────────┐               
│   LocalStorage  │    │   PostgreSQL    │               
│   (Dev/Demo)    │    │   (Production)  │               
└─────────────────┘    └─────────────────┘               
```

---

## 🔐 Security Considerations

### API Key Management
- Store keys in environment variables
- Rotate keys regularly
- Use least-privilege access principles
- Monitor usage quotas

### Web Scraping Ethics
- Respect robots.txt files
- Implement reasonable delays
- Monitor for anti-bot measures
- Consider rate limiting

### Data Privacy
- Don't store sensitive buyer information
- Anonymize where possible
- Regular data cleanup
- Secure transmission (HTTPS)

---

## 📈 Performance Optimization

### Caching Strategy
```javascript
const CACHE_DURATIONS = {
  'sam-opportunities': 4 * 60 * 60 * 1000, // 4 hours
  'govplanet-auctions': 1 * 60 * 60 * 1000, // 1 hour
  'match-results': 15 * 60 * 1000 // 15 minutes
}
```

### Database Indexing
- Index on price ranges for fast filtering
- Index on categories for quick searches
- Index on dates for time-based queries
- Full-text search on descriptions

---

## 🧪 Testing Strategy

### API Testing
```javascript
// Jest/Mocha test examples
describe('SAM.gov API Integration', () => {
  test('should fetch opportunities', async () => {
    const data = await SAM_API.searchOpportunities('keyword=excavator');
    expect(data.opportunitiesData).toBeDefined();
    expect(data.opportunitiesData.length).toBeGreaterThan(0);
  });
});
```

### Integration Testing
- Mock API responses for consistent testing
- Test data mapping accuracy
- Validate duplicate detection
- Test rate limiting compliance

---

## 📞 Support & Monitoring

### Health Checks
```javascript
const healthCheck = {
  apis: {
    'SAM.gov': () => testSAMConnection(),
    'GovPlanet': () => testGovPlanetScraping()
  },
  database: () => testDatabaseConnection(),
  storage: () => testStorageAccess()
}
```

### Monitoring Alerts
- API quota approaching limits
- Scraping failures or blocks
- Data sync failures
- Unusual traffic patterns

---

*This integration guide provides the roadmap for connecting the Command Center Pro with live data sources to maximize deal identification and revenue opportunities.*