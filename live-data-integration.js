// Live Data Integration for Command Center Pro
// SAM.gov API and other government contract data sources

class LiveDataFeeds {
    constructor() {
        this.baseUrls = {
            sam: 'https://api.sam.gov/opportunities/v2/search',
            beta: 'https://beta.sam.gov/api/prod/sgs/v1/search'
        };
        this.apiKey = null; // Will need SAM.gov API key
        this.cache = new Map();
        this.lastUpdate = null;
    }

    // Initialize API connections
    async init(apiKey) {
        this.apiKey = apiKey;
        console.log('Live data feeds initialized');
        return this.testConnection();
    }

    // Test SAM.gov API connection
    async testConnection() {
        try {
            const response = await fetch(this.baseUrls.sam + '?limit=1', {
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            console.error('SAM.gov API connection failed:', error);
            return false;
        }
    }

    // Fetch government opportunities by category
    async fetchGovernmentOpportunities(category = '', minValue = 10000, maxValue = 1000000) {
        if (!this.apiKey) {
            return this.getMockGovernmentData();
        }

        const params = new URLSearchParams({
            limit: 50,
            offset: 0,
            postedFrom: this.getDateDaysAgo(30),
            postedTo: new Date().toISOString().split('T')[0],
            setAsideCode: '',
            typeOfSetAsideCode: '',
            naics: '',
            classificationCode: category
        });

        try {
            const response = await fetch(`${this.baseUrls.sam}?${params}`, {
                headers: {
                    'X-Api-Key': this.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`SAM API error: ${response.status}`);
            }

            const data = await response.json();
            return this.processOpportunities(data.opportunities || []);
        } catch (error) {
            console.error('Error fetching SAM opportunities:', error);
            return this.getMockGovernmentData();
        }
    }

    // Process and format opportunities for brokerage platform
    processOpportunities(opportunities) {
        return opportunities.map(opp => ({
            id: opp.noticeId || `sam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: opp.title || 'Government Opportunity',
            description: opp.description || opp.synopsis || '',
            value: this.parseValue(opp.awardCeiling || opp.estimatedValue),
            category: this.mapCategory(opp.naicsCode),
            location: opp.placeOfPerformance?.cityName || 'Various',
            state: opp.placeOfPerformance?.state || 'US',
            dueDate: opp.responseDeadLine || opp.submissionDeadLine,
            postedDate: opp.postedDate,
            agency: opp.departmentName || opp.agencyName || 'Federal Government',
            setAside: opp.typeOfSetAside || '',
            naicsCode: opp.naicsCode,
            source: 'SAM.gov',
            type: 'Government Contract',
            status: 'Active',
            url: `https://sam.gov/opp/${opp.noticeId}`,
            commission: this.calculateCommission(this.parseValue(opp.awardCeiling)),
            priority: this.calculatePriority(opp)
        }));
    }

    // Calculate Brandon's commission potential
    calculateCommission(value, rate = 0.06) {
        if (!value || value < 10000) return 0;
        return Math.round(value * rate);
    }

    // Calculate priority based on Brandon's expertise
    calculatePriority(opp) {
        let score = 0;
        const title = (opp.title || '').toLowerCase();
        const desc = (opp.description || '').toLowerCase();
        
        // Defense/ammunition expertise bonus
        if (title.includes('ammunition') || title.includes('ordnance') || title.includes('defense')) score += 30;
        if (desc.includes('ammunition') || desc.includes('ordnance') || desc.includes('weapon')) score += 20;
        
        // Manufacturing expertise bonus
        if (title.includes('manufacturing') || title.includes('production')) score += 25;
        if (desc.includes('manufacturing') || desc.includes('production')) score += 15;
        
        // Valve/industrial expertise bonus
        if (title.includes('valve') || title.includes('industrial')) score += 25;
        if (desc.includes('valve') || desc.includes('industrial')) score += 15;
        
        // International experience bonus
        if (title.includes('international') || title.includes('export')) score += 20;
        
        // Size bonus (sweet spot for Brandon)
        const value = this.parseValue(opp.awardCeiling);
        if (value >= 100000 && value <= 5000000) score += 15;
        
        return score >= 50 ? 'HIGH' : score >= 25 ? 'MEDIUM' : 'LOW';
    }

    // Map NAICS codes to Brandon's categories
    mapCategory(naicsCode) {
        const code = naicsCode?.toString();
        if (!code) return 'General';
        
        if (code.startsWith('336414')) return 'Aircraft/Defense';
        if (code.startsWith('332')) return 'Machinery/Equipment';
        if (code.startsWith('333')) return 'Industrial Equipment';
        if (code.startsWith('334')) return 'Technology/Electronics';
        if (code.startsWith('562')) return 'Waste/Environmental';
        return 'General';
    }

    // Parse monetary values from various formats
    parseValue(valueStr) {
        if (!valueStr) return 0;
        const str = valueStr.toString().replace(/[,$]/g, '');
        return parseFloat(str) || 0;
    }

    // Get date N days ago in YYYY-MM-DD format
    getDateDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    // Mock data for testing without API key
    getMockGovernmentData() {
        return [
            {
                id: 'sam-mock-1',
                title: 'Industrial Valve Maintenance Contract',
                description: 'Maintenance and repair services for industrial valves at federal facilities',
                value: 250000,
                category: 'Industrial Equipment',
                location: 'Houston',
                state: 'TX',
                dueDate: '2026-04-15',
                postedDate: '2026-03-01',
                agency: 'General Services Administration',
                source: 'SAM.gov',
                type: 'Government Contract',
                status: 'Active',
                commission: 15000,
                priority: 'HIGH'
            },
            {
                id: 'sam-mock-2',
                title: 'Manufacturing Equipment Procurement',
                description: 'Procurement of specialized manufacturing equipment for defense applications',
                value: 500000,
                category: 'Machinery/Equipment',
                location: 'Various',
                state: 'US',
                dueDate: '2026-04-20',
                postedDate: '2026-02-28',
                agency: 'Department of Defense',
                source: 'SAM.gov',
                type: 'Government Contract',
                status: 'Active',
                commission: 30000,
                priority: 'HIGH'
            },
            {
                id: 'sam-mock-3',
                title: 'Surplus Equipment Disposal Services',
                description: 'Management and disposal of surplus government equipment and machinery',
                value: 150000,
                category: 'General',
                location: 'Fort Worth',
                state: 'TX',
                dueDate: '2026-05-01',
                postedDate: '2026-03-05',
                agency: 'Defense Logistics Agency',
                source: 'SAM.gov',
                type: 'Government Contract',
                status: 'Active',
                commission: 9000,
                priority: 'MEDIUM'
            }
        ];
    }

    // Integration with Command Center Pro
    async updateBrokerageData() {
        try {
            const opportunities = await this.fetchGovernmentOpportunities();
            
            // Update the opportunities display
            this.displayOpportunities(opportunities);
            
            // Update dashboard stats
            this.updateDashboardStats(opportunities);
            
            this.lastUpdate = new Date().toISOString();
            console.log(`Updated ${opportunities.length} opportunities at ${this.lastUpdate}`);
            
        } catch (error) {
            console.error('Error updating brokerage data:', error);
        }
    }

    displayOpportunities(opportunities) {
        const container = document.getElementById('live-opportunities');
        if (!container) return;

        const html = opportunities.map(opp => `
            <div class="opportunity-card ${opp.priority.toLowerCase()}-priority">
                <div class="opp-header">
                    <h4>${opp.title}</h4>
                    <span class="priority-badge ${opp.priority.toLowerCase()}">${opp.priority}</span>
                </div>
                <div class="opp-details">
                    <p class="opp-value">$${opp.value.toLocaleString()}</p>
                    <p class="opp-commission">Commission: $${opp.commission.toLocaleString()}</p>
                    <p class="opp-location">${opp.location}, ${opp.state}</p>
                    <p class="opp-agency">${opp.agency}</p>
                    <p class="opp-due">Due: ${new Date(opp.dueDate).toLocaleDateString()}</p>
                </div>
                <div class="opp-actions">
                    <button onclick="trackOpportunity('${opp.id}')" class="btn-track">Track</button>
                    <a href="${opp.url}" target="_blank" class="btn-view">View</a>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    updateDashboardStats(opportunities) {
        const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
        const totalCommission = opportunities.reduce((sum, opp) => sum + opp.commission, 0);
        const highPriority = opportunities.filter(opp => opp.priority === 'HIGH').length;

        document.getElementById('total-opp-value').textContent = `$${totalValue.toLocaleString()}`;
        document.getElementById('potential-commission').textContent = `$${totalCommission.toLocaleString()}`;
        document.getElementById('high-priority-count').textContent = highPriority;
    }

    // Auto-refresh every 30 minutes
    startAutoRefresh(intervalMinutes = 30) {
        setInterval(() => {
            this.updateBrokerageData();
        }, intervalMinutes * 60 * 1000);
    }
}

// Initialize live data feeds
const liveFeeds = new LiveDataFeeds();

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiveDataFeeds;
}

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize with mock data first, replace with real API key later
    liveFeeds.init(null).then(() => {
        liveFeeds.updateBrokerageData();
        liveFeeds.startAutoRefresh(30);
    });
});