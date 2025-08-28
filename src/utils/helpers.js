import { logger } from '../services/logger';

// Utility functions for the IELTS Results app
export class Utils {
    // Extract session code from URL
    static getSessionCode() {
        logger.debug('UTILS', 'Extracting session code from URL', { 
            url: window.location.href,
            pathname: window.location.pathname,
            hash: window.location.hash,
            search: window.location.search
        });
        
        const path = window.location.pathname;
        const hash = window.location.hash;
        
        // Check for session code in path (/s{code}) - accepts alphanumeric, numbers, and some special chars
        let match = path.match(/\/s([a-zA-Z0-9_-]+)/);
        if (match) {
            const code = match[1];
            logger.info('UTILS', 'Session code found in path', { 
                code, 
                fullMatch: match[0],
                length: code.length,
                chars: code.split('').join(',')
            });
            return code;
        }
        
        // Check for session code in hash (#s{code})
        match = hash.match(/#s([a-zA-Z0-9_-]+)/);
        if (match) {
            const code = match[1];
            logger.info('UTILS', 'Session code found in hash', { 
                code,
                fullMatch: match[0],
                length: code.length 
            });
            return code;
        }
        
        // Check for session code as query parameter (?session={code})
        const urlParams = new URLSearchParams(window.location.search);
        const sessionParam = urlParams.get('session');
        if (sessionParam) {
            logger.info('UTILS', 'Session code found in query parameter', { 
                code: sessionParam,
                length: sessionParam.length 
            });
            return sessionParam;
        }
        
        logger.warn('UTILS', 'No session code found in URL', {
            triedPath: path,
            triedHash: hash,
            triedQuery: window.location.search
        });
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
        if (!code || typeof code !== 'string') {
            logger.debug('UTILS', 'Session code validation failed - not a string', { code, type: typeof code });
            return false;
        }
        
        // Flexible pattern: alphanumeric, underscores, hyphens, 1-20 characters
        // Accepts: "27", "s23Tq9", "session_123", "test-code", etc.
        const isValid = /^[a-zA-Z0-9_-]{1,20}$/.test(code);
        
        logger.debug('UTILS', 'Session code validation', { code, isValid, length: code.length });
        return isValid;
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

    // Check if value exists and is not empty
    static hasValue(value) {
        return value !== null && value !== undefined && value !== '';
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

    // Check if device is mobile
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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

    // Retry utility
    static async retry(fn, maxAttempts = 3, initialDelay = 1000) {
        let currentDelay = initialDelay;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                logger.debug('UTILS', `Retry attempt ${attempt}/${maxAttempts}`);
                return await fn();
            } catch (error) {
                if (attempt === maxAttempts) {
                    logger.error('UTILS', 'Max retry attempts reached', { error: error.message });
                    throw error;
                }
                
                logger.warn('UTILS', `Attempt ${attempt} failed, retrying in ${currentDelay}ms`, { error: error.message });
                // eslint-disable-next-line no-loop-func
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= 2; // Exponential backoff
            }
        }
    }
}

logger.info('UTILS', 'Utils service initialized');