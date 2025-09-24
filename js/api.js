// API Configuration
const API_BASE_URL = '/api'; // Change this to your domain when publishing

// API Helper Functions
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to localStorage if API fails
            return this.fallbackToLocalStorage(endpoint, options);
        }
    }

    // Fallback to localStorage if API is not available
    static fallbackToLocalStorage(endpoint, options) {
        console.warn('API not available, falling back to localStorage');
        
        if (endpoint.includes('/applications')) {
            if (options.method === 'POST') {
                const data = JSON.parse(options.body);
                let applications = JSON.parse(localStorage.getItem('applications') || '[]');
                applications.push(data);
                localStorage.setItem('applications', JSON.stringify(applications));
                return { success: true, message: 'Application saved to localStorage' };
            } else {
                const applications = JSON.parse(localStorage.getItem('applications') || '[]');
                return { success: true, data: applications };
            }
        }
        
        if (endpoint.includes('/analytics')) {
            if (options.method === 'POST') {
                const data = JSON.parse(options.body);
                if (data.type === 'page_view') {
                    let pageViews = JSON.parse(localStorage.getItem('pageViews') || '{}');
                    const today = new Date().toDateString();
                    pageViews[today] = (pageViews[today] || 0) + 1;
                    localStorage.setItem('pageViews', JSON.stringify(pageViews));
                } else if (data.type === 'social_click') {
                    let socialAnalytics = JSON.parse(localStorage.getItem('socialAnalytics') || '{}');
                    const today = new Date().toDateString();
                    if (!socialAnalytics[today]) socialAnalytics[today] = {};
                    socialAnalytics[today][data.platform] = (socialAnalytics[today][data.platform] || 0) + 1;
                    localStorage.setItem('socialAnalytics', JSON.stringify(socialAnalytics));
                }
                return { success: true, message: 'Analytics saved to localStorage' };
            } else {
                return {
                    success: true,
                    data: {
                        pageViews: JSON.parse(localStorage.getItem('pageViews') || '{}'),
                        socialAnalytics: JSON.parse(localStorage.getItem('socialAnalytics') || '{}'),
                        applicationStats: []
                    }
                };
            }
        }
        
        return { success: false, error: 'Endpoint not supported in fallback mode' };
    }

    // Applications API
    static async getApplications() {
        return await this.request('/applications.php');
    }

    static async createApplication(applicationData) {
        return await this.request('/applications.php', {
            method: 'POST',
            body: JSON.stringify(applicationData)
        });
    }

    static async updateApplicationStatus(applicationId, status) {
        return await this.request('/applications.php?action=update_status', {
            method: 'POST',
            body: JSON.stringify({ id: applicationId, status: status })
        });
    }

    static async archiveApplication(applicationId) {
        return await this.request('/applications.php?action=archive', {
            method: 'POST',
            body: JSON.stringify({ id: applicationId })
        });
    }

    static async deleteApplication(applicationId) {
        return await this.request(`/applications.php?id=${applicationId}`, {
            method: 'DELETE'
        });
    }

    // Analytics API
    static async getAnalytics() {
        return await this.request('/analytics.php');
    }

    static async trackPageView() {
        return await this.request('/analytics.php', {
            method: 'POST',
            body: JSON.stringify({ type: 'page_view' })
        });
    }

    static async trackSocialClick(platform) {
        return await this.request('/analytics.php', {
            method: 'POST',
            body: JSON.stringify({ type: 'social_click', platform: platform })
        });
    }
}

// Update existing functions to use API
function storeApplication(data) {
    API.createApplication(data)
        .then(response => {
            if (response.success) {
                console.log('Application saved successfully');
                updateAnalytics();
            } else {
                console.error('Failed to save application:', response.error);
            }
        })
        .catch(error => {
            console.error('Error saving application:', error);
        });
}

function updateAnalytics() {
    // This will be handled by the createApplication API call
    // but we can also track it separately if needed
    API.trackPageView().catch(console.error);
}

function trackSocialClick(platform) {
    API.trackSocialClick(platform).catch(console.error);
}

function trackPageView() {
    API.trackPageView().catch(console.error);
}

// Admin panel functions
window.getApplications = async function() {
    try {
        const response = await API.getApplications();
        return response.success ? response.data : [];
    } catch (error) {
        console.error('Error getting applications:', error);
        return JSON.parse(localStorage.getItem('applications') || '[]');
    }
};

window.getAnalytics = async function() {
    try {
        const response = await API.getAnalytics();
        if (response.success) {
            // Transform the data to match the expected format
            const analytics = {
                dailyApplications: {},
                totalApplications: 0
            };
            
            response.data.applicationStats.forEach(stat => {
                analytics.dailyApplications[stat.date] = stat.count;
                analytics.totalApplications += stat.count;
            });
            
            return analytics;
        }
        return {};
    } catch (error) {
        console.error('Error getting analytics:', error);
        return JSON.parse(localStorage.getItem('analytics') || '{}');
    }
};

window.getSocialAnalytics = async function() {
    try {
        const response = await API.getAnalytics();
        if (response.success) {
            const socialData = {};
            response.data.socialAnalytics.forEach(item => {
                if (!socialData[item.date]) socialData[item.date] = {};
                socialData[item.date][item.platform] = item.clicks;
            });
            return socialData;
        }
        return {};
    } catch (error) {
        console.error('Error getting social analytics:', error);
        return JSON.parse(localStorage.getItem('socialAnalytics') || '{}');
    }
};

window.getPageViews = async function() {
    try {
        const response = await API.getAnalytics();
        if (response.success) {
            const pageViews = {};
            response.data.pageViews.forEach(item => {
                pageViews[item.date] = item.views;
            });
            return pageViews;
        }
        return {};
    } catch (error) {
        console.error('Error getting page views:', error);
        return JSON.parse(localStorage.getItem('pageViews') || '{}');
    }
};

