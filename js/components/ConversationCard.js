// ConversationCard.js - Individual conversation display component
const ConversationCard = ({ conversation, index }) => {
    React.useEffect(() => {
        logger.logComponentEvent('ConversationCard', 'mounted', {
            conversationIndex: index,
            questionOrder: conversation?.question_order,
            hasTranscript: !!conversation?.transcript,
            hasScores: !!conversation?.ielts_scores
        });
        
        return () => {
            logger.logComponentEvent('ConversationCard', 'unmounted', { index });
        };
    }, [conversation, index]);

    if (!conversation) {
        logger.warn('COMPONENT', 'ConversationCard received no conversation data');
        return null;
    }

    const {
        question_order,
        question_text,
        transcript,
        audio_duration_seconds,
        ielts_scores,
        word_analysis,
        ai_feedback,
        detailed_analysis
    } = conversation;

    // Detailed score items
    const detailedScores = [
        { label: 'Overall', value: ielts_scores?.overall },
        { label: 'Pronunciation', value: ielts_scores?.pronunciation },
        { label: 'Fluency', value: ielts_scores?.fluency },
        { label: 'Vocabulary', value: ielts_scores?.vocabulary },
        { label: 'Grammar', value: ielts_scores?.grammar },
        { label: 'Coherence', value: ielts_scores?.coherence }
    ].filter(score => score.value !== undefined && score.value !== null);

    // Additional metrics
    const additionalMetrics = [
        { 
            label: 'Word Count', 
            value: word_analysis?.word_count 
        },
        { 
            label: 'Accuracy', 
            value: word_analysis?.word_accuracy_percentage ? 
                Utils.formatPercentage(word_analysis.word_accuracy_percentage, 1) : null 
        },
        { 
            label: 'Duration', 
            value: audio_duration_seconds ? 
                Utils.formatDuration(audio_duration_seconds) : null 
        },
        {
            label: 'Created',
            value: conversation.created_at ? 
                Utils.formatDate(conversation.created_at, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : null
        }
    ].filter(metric => metric.value !== null && metric.value !== undefined);

    const DetailedScore = ({ label, value }) => (
        <div className="detailed-score">
            <div className="label">{label}</div>
            <div 
                className="value" 
                style={{ color: Utils.getScoreColor(value) }}
                title={`${label}: ${value}`}
            >
                {typeof value === 'number' ? value.toFixed(1) : value}
            </div>
        </div>
    );

    const FeedbackSection = ({ feedback }) => (
        <div className="feedback">
            <h4>AI Feedback & Suggestions</h4>
            {feedback.map((item, idx) => (
                <div key={idx} className="feedback-item">
                    <div className="original">
                        <strong>Original:</strong> "{item.original}"
                    </div>
                    <div className="improved">
                        <strong>Improved:</strong> "{item.improved}"
                    </div>
                </div>
            ))}
        </div>
    );

    const AdditionalAnalysis = ({ analysis }) => {
        const additionalScores = analysis?.additional_scores;
        if (!additionalScores) return null;

        return (
            <div className="additional-analysis">
                <h4>Additional Analysis</h4>
                
                {/* CEFR Levels */}
                {additionalScores.cefr && (
                    <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ fontSize: '0.875rem', marginBottom: '10px', color: '#374151' }}>
                            CEFR Levels
                        </h5>
                        <div className="analysis-grid">
                            {Object.entries(additionalScores.cefr).map(([key, value]) => (
                                <div key={key} className="analysis-item">
                                    <div className="label">{key}</div>
                                    <div className="value">{value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Fluency Metrics */}
                {analysis?.fluency_metrics && (
                    <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ fontSize: '0.875rem', marginBottom: '10px', color: '#374151' }}>
                            Fluency Metrics
                        </h5>
                        <div className="analysis-grid">
                            <div className="analysis-item">
                                <div className="label">Speech Rate</div>
                                <div className="value">{analysis.fluency_metrics.speech_rate?.toFixed(2)}</div>
                            </div>
                            <div className="analysis-item">
                                <div className="label">Pauses</div>
                                <div className="value">{analysis.fluency_metrics.pause_count}</div>
                            </div>
                            <div className="analysis-item">
                                <div className="label">Mean Length</div>
                                <div className="value">{analysis.fluency_metrics.mean_length_run?.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="conversation fade-in">
            {/* Question */}
            <div className="question">
                <div className="question-label">
                    Question {question_order || index + 1}
                </div>
                <div className="question-text">
                    {question_text || 'No question text available'}
                </div>
            </div>

            {/* Transcript */}
            {transcript && (
                <div className="transcript">
                    <div className="transcript-label">Your Response</div>
                    <div className="transcript-text">
                        "{transcript}"
                    </div>
                </div>
            )}

            {/* IELTS Scores */}
            {detailedScores.length > 0 && (
                <div className="detailed-scores">
                    {detailedScores.map((score, idx) => (
                        <DetailedScore key={idx} label={score.label} value={score.value} />
                    ))}
                </div>
            )}

            {/* Additional Metrics */}
            {additionalMetrics.length > 0 && (
                <div className="detailed-scores">
                    {additionalMetrics.map((metric, idx) => (
                        <div key={idx} className="detailed-score">
                            <div className="label">{metric.label}</div>
                            <div className="value" style={{ color: '#374151' }}>
                                {metric.value}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* AI Feedback */}
            {ai_feedback && ai_feedback.length > 0 && (
                <FeedbackSection feedback={ai_feedback} />
            )}

            {/* Additional Analysis */}
            {detailed_analysis && (
                <AdditionalAnalysis analysis={detailed_analysis} />
            )}

            {/* Issues Display */}
            {conversation.has_issues && conversation.issue_description && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '15px',
                    marginTop: '15px',
                    borderLeft: '4px solid #ef4444'
                }}>
                    <h4 style={{ color: '#dc2626', marginBottom: '5px' }}>Issues Detected</h4>
                    <p style={{ color: '#991b1b' }}>{conversation.issue_description}</p>
                </div>
            )}
        </div>
    );
};

// Export component
window.ConversationCard = ConversationCard;