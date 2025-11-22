/**
 * API Client for The Dozens REST API
 * Handles all communication with the backend Django API
 */

class DozensAPIClient {
    constructor(baseURL = 'http://localhost:8000') {
        this.baseURL = baseURL;
        this.apiURL = `${baseURL}/api`;
    }

    /**
     * Generic fetch wrapper with error handling
     */
    async _fetch(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    /**
     * Get a random insult with optional filters
     */
    async getRandomInsult() {
        const url = `${this.apiURL}/insults/random/`;
        return await this._fetch(url);
    }

    /**
     * Get all available categories
     */
    async getCategories() {
        const url = `${this.apiURL}/categories/`;
        return await this._fetch(url);
    }

    /**
     * Get insults by category
     */
    async getInsultsByCategory(category, filters = {}) {
        const params = new URLSearchParams(filters);
        const url = `${this.apiURL}/insults/${category}/?${params}`;
        return await this._fetch(url);
    }

    /**
     * Get all insults with pagination
     */
    async getAllInsults(filters = {}) {
        const params = new URLSearchParams(filters);
        const url = `${this.apiURL}/insults/?${params}`;
        return await this._fetch(url);
    }

    /**
     * Get specific insult by ID
     */
    async getInsult(referenceId) {
        const url = `${this.apiURL}/insult/${referenceId}/`;
        return await this._fetch(url);
    }

    /**
     * Report a joke (submit issue to GitHub)
     */
    async reportJoke(data) {
        const url = `${this.baseURL}/report-joke/`;
        return await this._fetch(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Create new insult (requires authentication)
     */
    async createInsult(data, token) {
        const url = `${this.apiURL}/insults/new/`;
        return await this._fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * Update insult (requires authentication and ownership)
     */
    async updateInsult(referenceId, data, token) {
        const url = `${this.apiURL}/insult/${referenceId}/`;
        return await this._fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * Delete insult (requires authentication and ownership)
     */
    async deleteInsult(referenceId, token) {
        const url = `${this.apiURL}/insult/${referenceId}/`;
        return await this._fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    /**
     * Authentication endpoints
     */
    async login(username, password) {
        const url = `${this.baseURL}/auth/token/login/`;
        return await this._fetch(url, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async logout(token) {
        const url = `${this.baseURL}/auth/token/logout/`;
        return await this._fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    /**
     * GraphQL endpoint wrapper
     */
    async graphqlQuery(query, variables = {}) {
        const url = `${this.baseURL}/graphql/`;
        return await this._fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                query,
                variables
            })
        });
    }
}

// Create global instance
window.dozensAPI = new DozensAPIClient();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DozensAPIClient;
}