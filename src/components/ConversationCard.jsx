import React, { useEffect } from 'react';
import { logger } from '../services/logger';
import { Utils } from '../utils/helpers';

const ConversationCard = ({ conversation, index }) => {
    useEffect(() => {
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
        <div style={{
            background: '#fef3c7',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '15px',
            borderLeft: '4px solid #f59e0b'
        }}>
            <h4 style={{ color: '#92400e', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>
                AI Feedback & Suggestions
            </h4>
            {feedback.map((item, idx) => (
                <div key={idx} style={{
                    marginBottom: '15px',
                    padding: '12px',
                    background: 'white',
                    borderRadius: '6px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ color: '#dc2626', marginBottom: '8px', fontWeight: '500' }}>
                        <strong>Original:</strong> "{item.original}"
                    </div>
                    <div style={{ color: '#059669', fontWeight: '500' }}>
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
            <div style={{
                background: '#f0f9ff',
                borderRadius: '8px',
                padding: '20px',
                marginTop: '15px',
                borderLeft: '4px solid #0ea5e9'
            }}>
                <h4 style={{ color: '#0369a1', marginBottom: '15px', fontSize: '1.1rem', fontWeight: '600' }}>
                    Additional Analysis
                </h4>
                
                {/* CEFR Levels */}
                {additionalScores.cefr && (
                    <div style={{ marginBottom: '15px' }}>
                        <h5 style={{ fontSize: '0.875rem', marginBottom: '10px', color: '#374151' }}>
                            CEFR Levels
                        </h5>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '10px'
                        }}>
                            {Object.entries(additionalScores.cefr).map(([key, value]) => (
                                <div key={key} style={{
                                    textAlign: 'center',
                                    background: 'white',
                                    borderRadius: '6px',
                                    padding: '10px'
                                }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#6b7280',
                                        textTransform: 'uppercase',
                                        marginBottom: '5px',
                                        fontWeight: '600'
                                    }}>
                                        {key}
                                    </div>
                                    <div style={{
                                        fontSize: '1rem',
                                        fontWeight: 'bold',
                                        color: '#0369a1'
                                    }}>
                                        {value}
                                    </div>
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
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                            gap: '10px'
                        }}>
                            <div style={{
                                textAlign: 'center',
                                background: 'white',
                                borderRadius: '6px',
                                padding: '10px'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    marginBottom: '5px',
                                    fontWeight: '600'
                                }}>
                                    Speech Rate
                                </div>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: '#0369a1'
                                }}>
                                    {analysis.fluency_metrics.speech_rate?.toFixed(2)}
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                background: 'white',
                                borderRadius: '6px',
                                padding: '10px'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    marginBottom: '5px',
                                    fontWeight: '600'
                                }}>
                                    Pauses
                                </div>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: '#0369a1'
                                }}>
                                    {analysis.fluency_metrics.pause_count}
                                </div>
                            </div>
                            <div style={{
                                textAlign: 'center',
                                background: 'white',
                                borderRadius: '6px',
                                padding: '10px'
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: '#6b7280',
                                    textTransform: 'uppercase',
                                    marginBottom: '5px',
                                    fontWeight: '600'
                                }}>
                                    Mean Length
                                </div>
                                <div style={{
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    color: '#0369a1'
                                }}>
                                    {analysis.fluency_metrics.mean_length_run?.toFixed(2)}
                                </div>
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

export default ConversationCard;