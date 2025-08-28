import React, { useEffect } from 'react';
import { logger } from '../services/logger';
import { Utils } from '../utils/helpers';

const SessionInfo = ({ data }) => {
    useEffect(() => {
        logger.logComponentEvent('SessionInfo', 'mounted', {
            sessionId: data?.session_info?.id,
            sessionType: data?.session_info?.session_type
        });
        
        return () => {
            logger.logComponentEvent('SessionInfo', 'unmounted');
        };
    }, [data]);

    if (!data) {
        logger.warn('COMPONENT', 'SessionInfo received no data');
        return null;
    }

    const { session_info, user_info, topic_info, session_scores } = data;

    const StatusBadge = ({ status }) => {
        const statusColors = {
            'completed': '#10b981',
            'in_progress': '#f59e0b',
            'pending': '#6b7280',
            'failed': '#ef4444'
        };

        return (
            <span 
                style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    backgroundColor: statusColors[status] || '#6b7280',
                    color: 'white'
                }}
            >
                {status}
            </span>
        );
    };

    const infoCards = [
        {
            title: 'Student',
            value: user_info?.full_name || user_info?.first_name || 'N/A'
        },
        {
            title: 'Topic',
            value: topic_info?.title || 'N/A'
        },
        {
            title: 'Session Type',
            value: session_info?.session_type || 'N/A'
        },
        {
            title: 'Part Number',
            value: session_info?.part_number || 'N/A'
        },
        {
            title: 'Status',
            value: session_info?.status,
            isStatus: true
        },
        {
            title: 'Duration',
            value: session_info?.total_duration_seconds ? 
                Utils.formatDuration(session_info.total_duration_seconds) : 'N/A'
        },
        {
            title: 'Started',
            value: session_info?.started_at ? 
                Utils.formatDate(session_info.started_at, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : 'N/A'
        },
        {
            title: 'Completed',
            value: session_info?.completed_at ? 
                Utils.formatDate(session_info.completed_at, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : 'N/A'
        },
        {
            title: 'Questions Asked',
            value: session_info?.questions_asked || 'N/A'
        },
        {
            title: 'Words Spoken',
            value: session_scores?.total_words_spoken || 'N/A'
        },
        {
            title: 'Average Accuracy',
            value: session_scores?.average_accuracy ? 
                Utils.formatPercentage(session_scores.average_accuracy, 1) : 'N/A'
        },
        {
            title: 'Overall Grade',
            value: session_info?.overall_grade || session_scores?.overall_score || 'N/A'
        }
    ].filter(card => card.value !== 'N/A' || card.title === 'Student'); // Always show student name

    return (
        <div className="session-info fade-in">
            <div className="session-header">
                {infoCards.map((card, index) => (
                    <div key={index} className="info-card">
                        <h3>{card.title}</h3>
                        <p>
                            {card.isStatus && card.value ? (
                                <StatusBadge status={card.value} />
                            ) : (
                                card.value
                            )}
                        </p>
                    </div>
                ))}
            </div>
            
            {topic_info?.description && (
                <div className="info-description">
                    <h4>Topic Description</h4>
                    <p>{topic_info.description}</p>
                </div>
            )}
        </div>
    );
};

export default SessionInfo;