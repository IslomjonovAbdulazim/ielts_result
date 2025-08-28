// API service for IELTS Results app
class ApiService {
    constructor() {
        this.baseURL = '/api';
        this.defaultTimeout = 15000; // 15 seconds
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1 second
        
        logger.info('API', 'ApiService initialized', { baseURL: this.baseURL });
    }

    // Main method to fetch session data
    async fetchSessionData(sessionCode) {
        logger.info('API', 'Fetching session data', { sessionCode });
        
        if (!sessionCode) {
            const error = new Error('Session code is required');
            logger.error('API', 'No session code provided');
            throw error;
        }

        if (!Utils.isValidSessionCode(sessionCode)) {
            const error = new Error('Invalid session code format');
            logger.error('API', 'Invalid session code format', { sessionCode });
            throw error;
        }

        const timer = logger.startTimer('fetchSessionData');
        
        try {
            const url = `${this.baseURL}/session/${sessionCode}`;
            logger.info('API', 'Making API request', { url });

            const response = await Utils.retry(
                () => this.makeRequest(url),
                this.retryAttempts,
                this.retryDelay
            );

            timer.stop();
            
            // Validate response structure
            this.validateSessionData(response);
            
            logger.info('API', 'Session data fetched successfully', {
                sessionCode,
                hasConversations: response.conversations?.length > 0,
                totalConversations: response.conversations?.length || 0
            });

            return response;
            
        } catch (error) {
            timer.stop();
            
            // Enhanced error handling
            const enhancedError = this.handleApiError(error, sessionCode);
            logger.error('API', 'Failed to fetch session data', {
                sessionCode,
                error: enhancedError.message,
                status: enhancedError.status,
                originalError: error.message
            });
            
            throw enhancedError;
        }
    }

    // Low-level request method
    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

        const defaultOptions = {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': navigator.userAgent
            },
            signal: controller.signal
        };

        const requestOptions = { ...defaultOptions, ...options };
        const startTime = performance.now();

        try {
            logger.debug('API', 'Making HTTP request', { url, method: requestOptions.method });

            const response = await fetch(url, requestOptions);
            const endTime = performance.now();
            const duration = endTime - startTime;

            clearTimeout(timeoutId);

            logger.logApiCall(
                requestOptions.method,
                url,
                response.status,
                duration,
                requestOptions.body,
                null // Response data will be logged separately
            );

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unable to read error response');
                const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
                error.status = response.status;
                error.response = response;
                error.responseText = errorText;
                
                throw error;
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                logger.warn('API', 'Response is not JSON', { contentType, url });
            }

            // Try to parse as JSON regardless of content-type
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                const text = await response.text();
                logger.error('API', 'Failed to parse response as JSON', { 
                    contentType, 
                    responseText: text.substring(0, 200),
                    error: jsonError.message 
                });
                throw new Error('Invalid JSON response from server');
            }
            
            logger.debug('API', 'Request successful', {
                url,
                status: response.status,
                duration: `${duration.toFixed(2)}ms`,
                dataSize: JSON.stringify(data).length + ' bytes'
            });

            return data;

        } catch (error) {
            clearTimeout(timeoutId);
            const endTime = performance.now();
            const duration = endTime - startTime;

            if (error.name === 'AbortError') {
                logger.error('API', 'Request timeout', { url, timeout: this.defaultTimeout });
                const timeoutError = new Error('Request timeout');
                timeoutError.code = 'TIMEOUT';
                throw timeoutError;
            }

            logger.logApiCall(
                requestOptions.method,
                url,
                error.status || 0,
                duration,
                requestOptions.body,
                error.message
            );

            throw error;
        }
    }

    // Validate session data structure
    validateSessionData(data) {
        logger.debug('API', 'Validating session data structure');

        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response: data is not an object');
        }

        // Required fields validation
        const requiredFields = ['session_info', 'user_info', 'conversations'];
        for (const field of requiredFields) {
            if (!data[field]) {
                logger.warn('API', `Missing required field: ${field}`);
            }
        }

        // Validate session_info
        if (data.session_info) {
            const sessionRequiredFields = ['id', 'status'];
            for (const field of sessionRequiredFields) {
                if (!data.session_info[field]) {
                    logger.warn('API', `Missing session_info field: ${field}`);
                }
            }
        }

        // Validate conversations array
        if (data.conversations && Array.isArray(data.conversations)) {
            logger.info('API', 'Validating conversations', { count: data.conversations.length });
            
            data.conversations.forEach((conv, index) => {
                if (!conv.question_text) {
                    logger.warn('API', `Missing question_text in conversation ${index}`);
                }
                if (!conv.transcript) {
                    logger.warn('API', `Missing transcript in conversation ${index}`);
                }
                if (!conv.ielts_scores) {
                    logger.warn('API', `Missing ielts_scores in conversation ${index}`);
                }
            });
        }

        logger.info('API', 'Session data validation completed');
    }

    // Enhanced error handling
    handleApiError(error, sessionCode) {
        let message = 'An error occurred while fetching the results';
        let code = 'UNKNOWN_ERROR';
        let status = error.status || 0;

        if (error.name === 'AbortError' || error.code === 'TIMEOUT') {
            message = 'Request timeout. Please check your internet connection and try again.';
            code = 'TIMEOUT';
        } else if (error.status === 404) {
            message = 'Results not found for this session. Please check the session code.';
            code = 'NOT_FOUND';
        } else if (error.status === 400) {
            message = 'Invalid session code format.';
            code = 'BAD_REQUEST';
        } else if (error.status === 403) {
            message = 'Access denied. You may not have permission to view these results.';
            code = 'FORBIDDEN';
        } else if (error.status === 429) {
            message = 'Too many requests. Please wait a moment and try again.';
            code = 'RATE_LIMITED';
        } else if (error.status >= 500) {
            message = 'Server error. Please try again later.';
            code = 'SERVER_ERROR';
        } else if (!navigator.onLine) {
            message = 'No internet connection. Please check your connection and try again.';
            code = 'NO_CONNECTION';
        } else if (error.message.includes('Failed to fetch')) {
            message = 'Unable to connect to the server. Please try again later.';
            code = 'NETWORK_ERROR';
        }

        const enhancedError = new Error(message);
        enhancedError.code = code;
        enhancedError.status = status;
        enhancedError.sessionCode = sessionCode;
        enhancedError.originalError = error;

        return enhancedError;
    }

    // Method to check API health
    async checkApiHealth() {
        logger.info('API', 'Checking API health');
        
        try {
            const url = `${this.baseURL}/health`;
            const response = await this.makeRequest(url);
            
            logger.info('API', 'API health check successful', response);
            return true;
        } catch (error) {
            logger.error('API', 'API health check failed', { error: error.message });
            return false;
        }
    }

    // Method to prefetch data (for performance optimization)
    async prefetchSessionData(sessionCode) {
        if (!sessionCode) return;

        logger.info('API', 'Prefetching session data', { sessionCode });

        try {
            const data = await this.fetchSessionData(sessionCode);
            
            // Cache the data
            Utils.setStorage(`session_${sessionCode}`, {
                data,
                timestamp: Date.now()
            }, 'sessionStorage');
            
            logger.info('API', 'Session data prefetched and cached', { sessionCode });
            return data;
        } catch (error) {
            logger.warn('API', 'Prefetch failed', { sessionCode, error: error.message });
            return null;
        }
    }

    // Method to get cached session data
    getCachedSessionData(sessionCode, maxAge = 5 * 60 * 1000) { // 5 minutes default
        const cached = Utils.getStorage(`session_${sessionCode}`, 'sessionStorage');
        
        if (!cached) {
            logger.debug('API', 'No cached data found', { sessionCode });
            return null;
        }

        const isExpired = Date.now() - cached.timestamp > maxAge;
        if (isExpired) {
            logger.debug('API', 'Cached data expired', { sessionCode });
            Utils.removeStorage(`session_${sessionCode}`, 'sessionStorage');
            return null;
        }

        logger.info('API', 'Using cached session data', { sessionCode });
        return cached.data;
    }

    // Method to clear all cached data
    clearCache() {
        logger.info('API', 'Clearing API cache');
        
        // Clear all session storage items that start with 'session_'
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('session_')) {
                sessionStorage.removeItem(key);
            }
        }
        
        logger.info('API', 'API cache cleared');
    }

    // Method to get API statistics
    getApiStats() {
        const stats = {
            baseURL: this.baseURL,
            defaultTimeout: this.defaultTimeout,
            retryAttempts: this.retryAttempts,
            retryDelay: this.retryDelay,
            isOnline: navigator.onLine,
            userAgent: navigator.userAgent
        };

        logger.debug('API', 'API statistics', stats);
        return stats;
    }
}

// Create global API service instance
window.apiService = new ApiService();

logger.info('API', 'API service initialized successfully');