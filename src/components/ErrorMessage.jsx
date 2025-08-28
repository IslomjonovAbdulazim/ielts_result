import React, { useEffect } from 'react';
import { logger } from '../services/logger';

const ErrorMessage = ({ error, onRetry = null, sessionCode = null }) => {
    useEffect(() => {
        logger.logComponentEvent('ErrorMessage', 'mounted', {
            errorCode: error?.code,
            hasRetry: !!onRetry
        });
        
        return () => {
            logger.logComponentEvent('ErrorMessage', 'unmounted');
        };
    }, [error, onRetry]);

    const handleRetry = () => {
        if (onRetry) {
            logger.logUserAction('error_retry_clicked', { sessionCode, errorCode: error?.code });
            onRetry();
        }
    };

    const getErrorTitle = () => {
        switch (error?.code) {
            case 'NOT_FOUND':
                return 'Results Not Found';
            case 'TIMEOUT':
                return 'Request Timeout';
            case 'NETWORK_ERROR':
                return 'Connection Error';
            case 'SERVER_ERROR':
                return 'Server Error';
            case 'NO_CONNECTION':
                return 'No Internet Connection';
            default:
                return 'Error Loading Results';
        }
    };

    const getErrorMessage = () => {
        if (error?.message) {
            return error.message;
        }
        
        return 'Sorry, we encountered an error while loading your results. Please try again.';
    };

    const showRetryButton = onRetry && ['TIMEOUT', 'NETWORK_ERROR', 'SERVER_ERROR', 'NO_CONNECTION'].includes(error?.code);

    return (
        <div className="error" role="alert">
            <h2>{getErrorTitle()}</h2>
            <p>{getErrorMessage()}</p>
            
            {showRetryButton && (
                <button 
                    onClick={handleRetry}
                    className="retry-button"
                >
                    Try Again
                </button>
            )}
            
            {error?.code === 'NOT_FOUND' && sessionCode && (
                <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#6b7280' }}>
                    Session code: <strong>{sessionCode}</strong>
                </div>
            )}
        </div>
    );
};

export default ErrorMessage;