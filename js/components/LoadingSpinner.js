// LoadingSpinner.js - Loading component with spinner
const LoadingSpinner = ({ message = "Loading your results..." }) => {
    React.useEffect(() => {
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

// Export component
window.LoadingSpinner = LoadingSpinner;