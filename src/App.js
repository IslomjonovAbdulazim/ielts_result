import React, { useState, useEffect, useCallback } from 'react';
import { logger } from './services/logger';
import { apiService } from './services/apiService';
import { Utils } from './utils/helpers';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import SessionInfo from './components/SessionInfo';
import ScoresGrid from './components/ScoresGrid';
import ConversationCard from './components/ConversationCard';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        logger.logComponentError('ErrorBoundary', error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="container">
                    <div className="error">
                        <h2>Something went wrong</h2>
                        <p>The application encountered an unexpected error. Please refresh the page and try again.</p>
                        
                        <button 
                            onClick={() => window.location.reload()}
                            className="retry-button"
                        >
                            Refresh Page
                        </button>
                        
                        {this.state.error && (
                            <details style={{ marginTop: '15px', fontSize: '0.875rem' }}>
                                <summary style={{ cursor: 'pointer', color: '#6b7280' }}>
                                    Technical Details
                                </summary>
                                <pre style={{ 
                                    marginTop: '10px', 
                                    padding: '10px', 
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '4px',
                                    overflow: 'auto',
                                    fontSize: '0.75rem'
                                }}>
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Debug Panel Component (for development)
const DebugPanel = ({ sessionCode, sessionData, error, loading }) => {
    const [showDebug, setShowDebug] = useState(false);

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    if (!showDebug) {
        return (
            <button 
                onClick={() => setShowDebug(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '10px',
                    backgroundColor: '#374151',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    zIndex: 1000
                }}
            >
                Debug
            </button>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '300px',
            maxHeight: '400px',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            overflow: 'auto',
            zIndex: 1000,
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong>Debug Panel</strong>
                <button 
                    onClick={() => setShowDebug(false)}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Session Code:</strong> {sessionCode || 'None'}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Error:</strong> {error ? error.message : 'None'}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>Has Data:</strong> {sessionData ? 'Yes' : 'No'}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <strong>URL:</strong> {window.location.href}
            </div>
            
            <div style={{ marginBottom: '10px' }}>
                <button 
                    onClick={() => logger.exportLogs()}
                    style={{
                        padding: '5px 10px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '5px'
                    }}
                >
                    Export Logs
                </button>
                
                <button 
                    onClick={() => apiService.clearCache()}
                    style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Cache
                </button>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionCode, setSessionCode] = useState(null);

    // Load session data function
    const loadSessionData = useCallback(async (code) => {
        if (!code) return;

        logger.info('APP', 'Loading session data', { sessionCode: code });
        setLoading(true);
        setError(null);

        try {
            // Check for cached data first
            const cachedData = apiService.getCachedSessionData(code);
            if (cachedData) {
                logger.info('APP', 'Using cached data', { sessionCode: code });
                setSessionData(cachedData);
                setLoading(false);
                return;
            }

            // Fetch from API
            const timer = logger.startTimer('loadSessionData');
            const data = await apiService.fetchSessionData(code);
            timer.stop();

            // Cache the data for future use
            apiService.cacheSessionData(code, data);

            logger.info('APP', 'Session data loaded successfully', {
                sessionCode: code,
                conversations: data.conversations?.length || 0,
                hasUserInfo: !!data.user_info,
                hasScores: !!data.session_scores
            });

            setSessionData(data);
            
        } catch (err) {
            logger.error('APP', 'Failed to load session data', {
                sessionCode: code,
                error: err.message,
                errorCode: err.code
            });
            
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize app and extract session code
    useEffect(() => {
        logger.info('APP', 'Application starting');
        
        const code = Utils.getSessionCode();
        setSessionCode(code);
        
        if (!code) {
            const noCodeError = new Error('No session code found in URL. Please check your URL format (e.g., /s23Tq9).');
            noCodeError.code = 'NO_SESSION_CODE';
            setError(noCodeError);
            setLoading(false);
            logger.warn('APP', 'No session code found in URL');
            return;
        }

        logger.info('APP', 'Session code extracted', { sessionCode: code });
        
        // Update URL if needed
        Utils.updateURL(code);
        
        // Start loading data
        loadSessionData(code);
    }, [loadSessionData]);

    // Retry function for error handling
    const handleRetry = useCallback(() => {
        logger.logUserAction('retry_button_clicked', { sessionCode });
        
        if (sessionCode) {
            loadSessionData(sessionCode);
        } else {
            // Try to extract session code again
            const code = Utils.getSessionCode();
            if (code) {
                setSessionCode(code);
                loadSessionData(code);
            } else {
                logger.warn('APP', 'Still no session code found on retry');
            }
        }
    }, [sessionCode, loadSessionData]);

    // Render loading state
    const renderLoading = () => (
        <LoadingSpinner message="Loading your results..." />
    );

    // Render error state
    const renderError = () => (
        <ErrorMessage 
            error={error} 
            onRetry={error?.code !== 'NO_SESSION_CODE' ? handleRetry : null}
            sessionCode={sessionCode}
        />
    );

    // Render success state
    const renderResults = () => {
        if (!sessionData) return null;

        logger.debug('APP', 'Rendering results', {
            hasSessionInfo: !!sessionData.session_info,
            conversationCount: sessionData.conversations?.length || 0
        });

        return (
            <div className="fade-in">
                {/* Session Information */}
                <SessionInfo data={sessionData} />
                
                {/* Overall Scores */}
                <ScoresGrid data={sessionData} />
                
                {/* Conversations */}
                {sessionData.conversations && sessionData.conversations.length > 0 && (
                    <div>
                        <h2 className="section-title">
                            Detailed Analysis
                        </h2>
                        {sessionData.conversations.map((conversation, index) => (
                            <ConversationCard
                                key={conversation.question_order || index}
                                conversation={conversation}
                                index={index}
                            />
                        ))}
                    </div>
                )}
                
                {/* Metadata */}
                {sessionData.metadata && (
                    <div className="metadata">
                        <p>
                            Generated on {Utils.formatDate(sessionData.metadata.generated_at)} • 
                            API Version {sessionData.metadata.api_version} • 
                            {sessionData.metadata.served_from_cache ? 'Served from cache' : 'Fresh data'}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    // Main render
    return (
        <ErrorBoundary>
            <div className="container">
                <header className="header">
                    <h1>IELTS Speaking Results</h1>
                    <p>Detailed analysis and scores for your speaking assessment</p>
                    {sessionCode && (
                        <div className="session-code">
                            Session: <strong>{sessionCode}</strong>
                        </div>
                    )}
                </header>

                <main>
                    {loading && renderLoading()}
                    {error && !loading && renderError()}
                    {sessionData && !loading && !error && renderResults()}
                </main>

                {/* Debug Panel (only in development) */}
                <DebugPanel 
                    sessionCode={sessionCode}
                    sessionData={sessionData}
                    error={error}
                    loading={loading}
                />
            </div>
        </ErrorBoundary>
    );
};

export default App;