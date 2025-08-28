// Utility functions for the IELTS Results app
class Utils {
    // Extract session code from URL
    static getSessionCode() {
        logger.debug('UTILS', 'Extracting session code from URL', { url: window.location.href });
        
        const path = window.location.pathname;
        const hash = window.location.hash;
        
        // Check for session code in path (/s{code})
        let match = path.match(/\/s([a-zA-Z0-9]+)/);
        if (match) {
            const code = match[1];
            logger.info('UTILS', 'Session code found in path', { code });
            return code;
        }
        
        // Check for session code in hash (#s{code})
        match = hash.match(/#s([a-zA-Z0-9]+)/);
        if (match) {
            const code = match[1];
            logger.info('UTILS', 'Session code found in hash', { code });
            return code;
        }
        
        // Check for session code as query parameter (?session={code})
        const urlParams = new URLSearchParams(window.location.search);
        const sessionParam = urlParams.get('session');
        if (sessionParam) {
            logger.info('UTILS', 'Session code found in query parameter', { code: sessionParam });
            return sessionParam;
        }
        
        logger.warn('UTILS', 'No session code found in URL');
        return null;
    }

    // Format date with locale support
    static formatDate(dateString, options = {}) {
        if (!dateString) return 'N/A';
        
        try {
            const defaultOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            
            const formatOptions = { ...defaultOptions, ...options };
            const date = new Date(dateString);
            const formatted = date.toLocaleDateString('en-US', formatOptions);
            
            logger.debug('UTILS', 'Date formatted', { original: dateString, formatted });
            return formatted;
        } catch (error) {
            logger.error('UTILS', 'Error formatting date', { dateString, error: error.message });
            return dateString;
        }
    }

    // Format duration in a human-readable way
    static formatDuration(seconds) {
        if (!seconds || seconds < 0) return '0s';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        let formatted;
        if (minutes > 0) {
            formatted = `${minutes}m ${remainingSeconds}s`;
        } else {
            formatted = `${remainingSeconds}s`;
        }
        
        logger.debug('UTILS', 'Duration formatted', { original: seconds, formatted });
        return formatted;
    }

    // Get score color based on value
    static getScoreColor(score) {
        if (score >= 8.5) return '#10b981'; // Emerald
        if (score >= 7.5) return '#059669'; // Green
        if (score >= 6.5) return '#65a30d'; // Lime
        if (score >= 5.5) return '#d97706'; // Orange
        if (score >= 4.5) return '#dc2626'; // Red
        return '#6b7280'; // Gray
    }

    // Get score description based on IELTS bands
    static getScoreDescription(score) {
        if (score >= 9) return 'Expert User';
        if (score >= 8) return 'Very Good User';
        if (score >= 7) return 'Good User';
        if (score >= 6) return 'Competent User';
        if (score >= 5) return 'Modest User';
        if (score >= 4) return 'Limited User';
        if (score >= 3) return 'Extremely Limited User';
        return 'Did not attempt the test';
    }

    // Validate session code format
    static isValidSessionCode(code) {
        if (!code || typeof code !== 'string') return false;
        
        // Check if code matches expected pattern (alphanumeric, 5-10 characters)
        const isValid = /^[a-zA-Z0-9]{5,10}$/.test(code);
        
        logger.debug('UTILS', 'Session code validation', { code, isValid });
        return isValid;
    }

    // Calculate overall performance based on all scores
    static calculateOverallPerformance(scores) {
        if (!scores || typeof scores !== 'object') return 0;
        
        const scoreValues = Object.values(scores).filter(score => 
            typeof score === 'number' && score > 0
        );
        
        if (scoreValues.length === 0) return 0;
        
        const average = scoreValues.reduce((sum, score) => sum + score, 0) / scoreValues.length;
        const overall = Math.round(average * 10) / 10;
        
        logger.debug('UTILS', 'Overall performance calculated', { scores, overall });
        return overall;
    }

    // Format percentage
    static formatPercentage(value, decimals = 1) {
        if (!value && value !== 0) return 'N/A';
        return `${value.toFixed(decimals)}%`;
    }

    // Truncate text with ellipsis
    static truncateText(text, maxLength = 100) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Deep clone object
    static deepClone(obj) {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (error) {
            logger.error('UTILS', 'Error deep cloning object', { error: error.message });
            return obj;
        }
    }

    // Debounce function for performance optimization
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Check if device is mobile
    static isMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        return isMobile;
    }

    // Get device type
    static getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
            return 'tablet';
        }
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
            return 'mobile';
        }
        return 'desktop';
    }

    // Format number with locale support
    static formatNumber(number, options = {}) {
        if (number === null || number === undefined) return 'N/A';
        
        try {
            return new Intl.NumberFormat('en-US', options).format(number);
        } catch (error) {
            logger.error('UTILS', 'Error formatting number', { number, error: error.message });
            return number.toString();
        }
    }

    // Check if value exists and is not empty
    static hasValue(value) {
        return value !== null && value !== undefined && value !== '';
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Storage utilities
    static setStorage(key, value, type = 'localStorage') {
        try {
            const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
            storage.setItem(key, JSON.stringify(value));
            logger.debug('UTILS', 'Value stored', { key, type });
        } catch (error) {
            logger.error('UTILS', 'Error storing value', { key, error: error.message });
        }
    }

    static getStorage(key, type = 'localStorage') {
        try {
            const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
            const value = storage.getItem(key);
            const parsed = value ? JSON.parse(value) : null;
            logger.debug('UTILS', 'Value retrieved', { key, type, hasValue: !!parsed });
            return parsed;
        } catch (error) {
            logger.error('UTILS', 'Error retrieving value', { key, error: error.message });
            return null;
        }
    }

    static removeStorage(key, type = 'localStorage') {
        try {
            const storage = type === 'sessionStorage' ? sessionStorage : localStorage;
            storage.removeItem(key);
            logger.debug('UTILS', 'Value removed', { key, type });
        } catch (error) {
            logger.error('UTILS', 'Error removing value', { key, error: error.message });
        }
    }

    // URL utilities
    static updateURL(sessionCode) {
        if (!sessionCode) return;
        
        const newURL = `/s${sessionCode}`;
        if (window.location.pathname !== newURL) {
            window.history.pushState({ sessionCode }, '', newURL);
            logger.info('UTILS', 'URL updated', { newURL });
        }
    }

    // Error formatting
    static formatError(error) {
        if (!error) return 'Unknown error';
        
        if (typeof error === 'string') return error;
        if (error.message) return error.message;
        if (error.error) return error.error;
        
        return JSON.stringify(error);
    }

    // Performance monitoring
    static measurePerformance(name, fn) {
        const timer = logger.startTimer(name);
        
        try {
            const result = fn();
            
            if (result && typeof result.then === 'function') {
                // Handle promises
                return result.finally(() => timer.stop());
            } else {
                timer.stop();
                return result;
            }
        } catch (error) {
            timer.stop();
            throw error;
        }
    }

    // Retry logic
    static async retry(fn, maxAttempts = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                logger.debug('UTILS', `Retry attempt ${attempt}/${maxAttempts}`);
                return await fn();
            } catch (error) {
                if (attempt === maxAttempts) {
                    logger.error('UTILS', 'Max retry attempts reached', { error: error.message });
                    throw error;
                }
                
                logger.warn('UTILS', `Attempt ${attempt} failed, retrying in ${delay}ms`, { error: error.message });
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
            }
        }
    }
}

// Export Utils globally
window.Utils = Utils;

logger.info('UTILS', 'Utils initialized successfully');