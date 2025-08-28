// ScoresGrid.js - Optimized scores display grid component
const ScoresGrid = ({ data }) => {
    const [activeTab, setActiveTab] = React.useState('ielts');
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
        logger.logComponentEvent('ScoresGrid', 'mounted', {
            hasConversations: !!data?.conversations?.length,
            conversationCount: data?.conversations?.length || 0
        });
        
        return () => {
            logger.logComponentEvent('ScoresGrid', 'unmounted');
        };
    }, [data]);

    // Memoize scores calculation for performance
    const scores = React.useMemo(() => {
        if (!data || !data.conversations || data.conversations.length === 0) {
            return {};
        }

        if (data.conversations.length === 1) {
            return data.conversations[0].ielts_scores || {};
        }
        
        // Calculate averages for multiple conversations
        const scoreCategories = ['overall', 'pronunciation', 'fluency', 'vocabulary', 'grammar', 'coherence'];
        const overallScores = {};
        
        scoreCategories.forEach(category => {
            const validScores = data.conversations
                .map(conv => conv.ielts_scores?.[category])
                .filter(score => typeof score === 'number' && score > 0);
            
            if (validScores.length > 0) {
                const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
                overallScores[category] = Math.round(average * 10) / 10;
            }
        });
        
        return overallScores;
    }, [data]);

    if (!data || !data.conversations || data.conversations.length === 0) {
        logger.warn('COMPONENT', 'ScoresGrid received no conversation data');
        return null;
    }

    const overallScore = scores.overall || 0;

    // Test type tabs data
    const testTypes = [
        { id: 'speechace', name: 'Speechace' },
        { id: 'cefr', name: 'CEFR' },
        { id: 'ielts', name: 'IELTS' },
        { id: 'pte', name: 'PTE' },
        { id: 'toefl', name: 'TOEFL' },
        { id: 'toeic', name: 'TOEIC' }
    ];

    // Individual scores for bars - memoized for performance
    const individualScores = React.useMemo(() => [
        { 
            label: 'Pronunciation', 
            value: scores.pronunciation || 0,
            maxValue: 9
        },
        { 
            label: 'Fluency', 
            value: scores.fluency || 0,
            maxValue: 9
        },
        { 
            label: 'Vocabulary', 
            value: scores.vocabulary || 0,
            maxValue: 9
        },
        { 
            label: 'Grammar', 
            value: scores.grammar || 0,
            maxValue: 9
        }
    ], [scores]);

    // Get color for score bars
    const getBarColor = React.useCallback((value) => {
        if (value >= 8.5) return '#10b981'; // Green
        if (value >= 7.0) return '#059669'; // Dark green
        if (value >= 6.0) return '#fbbf24'; // Orange/Yellow
        if (value >= 4.0) return '#f59e0b'; // Orange
        return '#ef4444'; // Red
    }, []);

    // Handle tab change with debouncing
    const handleTabChange = React.useCallback((tabId) => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        setActiveTab(tabId);
        
        logger.logUserAction('test_type_selected', { type: tabId });
        
        // Reset animation flag after transition
        setTimeout(() => setIsAnimating(false), 200);
    }, [isAnimating]);

    // Test type tabs component with working selection
    const TestTypeTabs = React.memo(() => (
        <div className="test-type-tabs">
            {testTypes.map((type, index) => (
                <button
                    key={type.id}
                    className={`test-tab ${activeTab === type.id ? 'active' : ''}`}
                    onClick={() => handleTabChange(type.id)}
                    disabled={isAnimating}
                    style={{ 
                        transition: 'all 0.2s ease',
                        opacity: isAnimating ? 0.7 : 1 
                    }}
                >
                    {type.name}
                </button>
            ))}
            {/* Active tab indicator */}
            <div 
                className="tab-indicator"
                style={{
                    position: 'absolute',
                    height: '33px',
                    backgroundColor: '#0ea5e9',
                    borderRadius: '10px',
                    zIndex: 0,
                    transition: '0.2s linear',
                    top: '8px',
                    left: `${testTypes.findIndex(t => t.id === activeTab) * 85 + 8}px`,
                    width: '70px'
                }}
            />
        </div>
    ));

    // Optimized circular score display component
    const CircularScore = React.memo(({ score }) => {
        const [animatedScore, setAnimatedScore] = React.useState(0);
        
        React.useEffect(() => {
            const timer = setTimeout(() => {
                setAnimatedScore(score);
            }, 300);
            return () => clearTimeout(timer);
        }, [score]);

        const percentage = Math.min((animatedScore / 9) * 100, 100);
        const radius = 85;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;

        return (
            <div className="circular-score-container">
                <svg className="circular-score-svg" width="200" height="200" viewBox="0 0 200 200">
                    {/* Background circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={score >= 6 ? '#10b981' : score >= 4 ? '#fbbf24' : '#ef4444'}
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform="rotate(-90 100 100)"
                        style={{ 
                            transition: 'stroke-dashoffset 1.5s ease-out, stroke 0.3s ease',
                            willChange: 'stroke-dashoffset'
                        }}
                    />
                </svg>
                <div className="circular-score-content">
                    <div className="score-text">
                        <span className="score-number">
                            {animatedScore > 0 ? animatedScore.toFixed(1).split('.')[0] : '0'}
                        </span>
                        <span className="score-denominator">/9</span>
                    </div>
                </div>
            </div>
        );
    });

    // Optimized score bar component
    const ScoreBar = React.memo(({ label, value, maxValue, index }) => {
        const [animatedWidth, setAnimatedWidth] = React.useState(0);
        
        React.useEffect(() => {
            const timer = setTimeout(() => {
                const percentage = Math.min((value / maxValue) * 100, 100);
                setAnimatedWidth(percentage);
            }, 200 + (index * 100)); // Stagger animations
            
            return () => clearTimeout(timer);
        }, [value, maxValue, index]);

        const barColor = getBarColor(value);

        return (
            <div className="score-bar-item">
                <div className="score-bar-header">
                    <span className="score-bar-label">{label}</span>
                    <span className="score-bar-value">
                        <span style={{ color: barColor, fontWeight: '600' }}>
                            {value > 0 ? value.toFixed(1) : '0.0'}
                        </span>
                        /{maxValue}
                    </span>
                </div>
                <div className="score-bar-track">
                    <div 
                        className="score-bar-fill"
                        style={{
                            width: `${animatedWidth}%`,
                            backgroundColor: barColor,
                            transition: 'width 1s ease-out',
                            willChange: 'width'
                        }}
                    />
                </div>
            </div>
        );
    });

    // Handle scoring guide click
    const handleScoringGuide = React.useCallback(() => {
        logger.logUserAction('scoring_guide_clicked', { testType: activeTab });
        // You can implement modal or redirect logic here
        console.log('Scoring guide clicked for:', activeTab);
    }, [activeTab]);

    return (
        <div className="scores-container fade-in">
            {/* Header */}
            <h2 className="scores-title">Summary of scores</h2>
            
            {/* Test Type Tabs */}
            <div style={{ position: 'relative', marginBottom: '30px' }}>
                <TestTypeTabs />
            </div>

            {/* Main Content */}
            <div className="scores-content">
                {/* Circular Score Display */}
                <div className="circular-score-section">
                    <div className="ielts-badge">{activeTab.toUpperCase()}</div>
                    <CircularScore score={overallScore} />
                    <button 
                        className="scoring-guide-btn"
                        onClick={handleScoringGuide}
                        type="button"
                    >
                        <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3.21094 20.25H17.7891C19.3399 20.25 20.6016 18.9883 20.6016 17.4375V2.8125C20.6016 1.26169 19.3399 0 17.7891 0H3.21094C1.66013 0 0.398438 1.26169 0.398438 2.8125V21.1875C0.398438 22.7383 1.66013 24 3.21094 24H16.8516H17.7891C19.3399 24 20.6016 22.7383 20.6016 21.1875V21.1852C19.8176 21.775 18.8435 22.125 17.7891 22.125H16.8516H3.21094C2.694 22.125 2.27344 21.7044 2.27344 21.1875C2.27344 20.6706 2.694 20.25 3.21094 20.25ZM2.27344 2.8125C2.27344 2.29556 2.694 1.875 3.21094 1.875H17.7891C18.306 1.875 18.7266 2.29556 18.7266 2.8125V17.4375C18.7266 17.9544 18.306 18.375 17.7891 18.375H3.21094C2.88239 18.375 2.56678 18.4316 2.27344 18.5356V2.8125ZM8.92969 7.90219H7.05469C7.05469 6.94041 7.46691 6.01983 8.18569 5.37638C8.91389 4.72444 9.89348 4.41281 10.8735 4.52166C12.4435 4.69589 13.7077 5.95683 13.8795 7.51997C14.0362 8.94562 13.2002 9.96863 12.5577 10.6141C12.3923 10.7802 12.2397 10.9258 12.105 11.0543C11.4924 11.6385 11.4143 11.7367 11.4143 12.1404V12.1875H9.53934V12.1404C9.53934 10.9101 10.1287 10.3481 10.811 9.69731C10.9436 9.57089 11.0807 9.44016 11.2288 9.29133C11.8343 8.68303 12.0697 8.21456 12.0158 7.72481C11.9391 7.02684 11.3717 6.46345 10.6667 6.38522C10.2099 6.33469 9.77264 6.47231 9.43631 6.77344C9.10959 7.06584 8.92969 7.46672 8.92969 7.90219ZM9.53906 13.5938H11.4141V15.4688H9.53906V13.5938Z" fill="#00ABE1" />
                        </svg>
                        <span>Scoring guide</span>
                    </button>
                </div>

                {/* Individual Scores */}
                <div className="individual-scores-section">
                    {individualScores.map((scoreItem, index) => (
                        <ScoreBar
                            key={`${scoreItem.label}-${activeTab}`} // Include activeTab in key for re-rendering
                            label={scoreItem.label}
                            value={scoreItem.value}
                            maxValue={scoreItem.maxValue}
                            index={index}
                        />
                    ))}
                </div>
            </div>

            {/* Debug info in development */}
            {window.location.hostname === 'localhost' && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '10px', 
                    background: '#f3f4f6', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    Debug: Active Tab: {activeTab}, Overall Score: {overallScore}, 
                    Conversations: {data?.conversations?.length || 0}
                </div>
            )}
        </div>
    );
};

// Export component
window.ScoresGrid = ScoresGrid;