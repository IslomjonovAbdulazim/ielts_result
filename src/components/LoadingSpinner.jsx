import React, { useEffect } from 'react';
import { logger } from '../services/logger';

const LoadingSpinner = ({ message = "Loading your results..." }) => {
    useEffect(() => {
        logger.logComponentEvent('LoadingSpinner', 'mounted');
        return () => {
            logger.logComponentEvent('LoadingSpinner', 'unmounted');
        };
    }, []);

    return (
        <div className="loading">
            <div className="loading-spinner" aria-label="Loading"></div>
            <p className="loading-text">{message}</p>
        </div>
    );
};

export default LoadingSpinner;