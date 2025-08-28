// Logger utility for comprehensive logging
class Logger {
    constructor() {
        this.logLevel = 'INFO';
        this.enableConsoleLog = true;
        this.logHistory = [];
        this.maxHistorySize = 1000;
    }

    setLogLevel(level) {
        this.logLevel = level;
        this.log('INFO', 'Logger', `Log level set to: ${level}`);
    }

    log(level, category, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            category,
            message,
            data,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // Add to history
        this.logHistory.push(logEntry);
        if (this.logHistory.length > this.maxHistorySize) {
            this.logHistory = this.logHistory.slice(-this.maxHistorySize);
        }

        // Console logging
        if (this.enableConsoleLog) {
            const logMessage = `[${timestamp}] [${level}] [${category}] ${message}`;
            
            switch (level) {
                case 'ERROR':
                    console.error(logMessage, data || '');
                    break;
                case 'WARN':
                    console.warn(logMessage, data || '');
                    break;
                case 'INFO':
                    console.info(logMessage, data || '');
                    break;
                case 'DEBUG':
                    console.debug(logMessage, data || '');
                    break;
                default:
                    console.log(logMessage, data || '');
            }
        }

        // Send critical errors to external service (if configured)
        if (level === 'ERROR') {
            this.sendErrorToExternalService(logEntry);
        }
    }

    info(category, message, data = null) {
        this.log('INFO', category, message, data);
    }

    warn(category, message, data = null) {
        this.log('WARN', category, message, data);
    }

    error(category, message, data = null) {
        this.log('ERROR', category, message, data);
    }

    debug(category, message, data = null) {
        this.log('DEBUG', category, message, data);
    }

    // Performance logging
    startTimer(timerName) {
        const startTime = performance.now();
        this.info('PERFORMANCE', `Timer started: ${timerName}`, { startTime });
        return {
            stop: () => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                this.info('PERFORMANCE', `Timer stopped: ${timerName}`, {
                    startTime,
                    endTime,
                    duration: `${duration.toFixed(2)}ms`
                });
                return duration;
            }
        };
    }

    // User interaction logging
    logUserAction(action, details = {}) {
        this.info('USER_ACTION', action, {
            ...details,
            timestamp: Date.now(),
            sessionId: this.getSessionId()
        });
    }

    // API call logging
    logApiCall(method, url, status, duration, requestData = null, responseData = null) {
        const level = status >= 400 ? 'ERROR' : 'INFO';
        this.log(level, 'API_CALL', `${method} ${url} - ${status}`, {
            method,
            url,
            status,
            duration: `${duration}ms`,
            requestData: requestData ? JSON.stringify(requestData).substring(0, 500) : null,
            responseData: responseData ? JSON.stringify(responseData).substring(0, 500) : null
        });
    }

    // Component lifecycle logging
    logComponentEvent(componentName, event, data = {}) {
        this.debug('COMPONENT', `${componentName}: ${event}`, data);
    }

    // Error boundary logging
    logComponentError(componentName, error, errorInfo) {
        this.error('COMPONENT_ERROR', `Error in ${componentName}`, {
            error: error.message,
            stack: error.stack,
            errorInfo: errorInfo?.componentStack
        });
    }

    // Session management
    getSessionId() {
        let sessionId = sessionStorage.getItem('ielts_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('ielts_session_id', sessionId);
        }
        return sessionId;
    }

    // Export logs
    exportLogs() {
        const logsJson = JSON.stringify(this.logHistory, null, 2);
        const blob = new Blob([logsJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ielts-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.info('LOGGER', 'Logs exported successfully');
    }

    // Get recent logs
    getRecentLogs(count = 50) {
        return this.logHistory.slice(-count);
    }

    // Clear logs
    clearLogs() {
        this.logHistory = [];
        this.info('LOGGER', 'Logs cleared');
    }

    // Send error to external service (placeholder)
    sendErrorToExternalService(logEntry) {
        // In a real application, you might send errors to services like Sentry, LogRocket, etc.
        // For now, we'll just log it
        console.warn('Error logged for external service:', logEntry);
    }

    // Browser and environment info
    logEnvironmentInfo() {
        const envInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            screenResolution: `${screen.width}x${screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`,
            colorDepth: screen.colorDepth,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            url: window.location.href,
            referrer: document.referrer || 'Direct'
        };
        
        this.info('ENVIRONMENT', 'Environment information captured', envInfo);
        return envInfo;
    }
}

// Create global logger instance
window.logger = new Logger();

// Log initial environment info
window.logger.logEnvironmentInfo();
window.logger.info('LOGGER', 'Logger initialized successfully');

// Global error handler
window.addEventListener('error', (event) => {
    window.logger.error('GLOBAL_ERROR', 'Uncaught error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
    });
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    window.logger.error('PROMISE_REJECTION', 'Unhandled promise rejection', {
        reason: event.reason,
        stack: event.reason?.stack
    });
});

// Page visibility logging
document.addEventListener('visibilitychange', () => {
    window.logger.logUserAction('page_visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState
    });
});

// Page load logging
window.addEventListener('load', () => {
    window.logger.info('PAGE', 'Page fully loaded', {
        loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart + 'ms'
    });
});

// Before unload logging
window.addEventListener('beforeunload', () => {
    window.logger.info('PAGE', 'Page unloading');
});