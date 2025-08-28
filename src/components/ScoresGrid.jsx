import React, { useEffect } from 'react';
import { logger } from '../services/logger';
import { Utils } from '../utils/helpers';

const ScoresGrid = ({ data }) => {
    useEffect(() => {
        logger.logComponentEvent('ScoresGrid', 'mounted', {
            hasConversations: !!data?.conversations?.length,
            conversationCount: data?.conversations?.length || 0
        });
        
        return () => {
            logger.logComponentEvent('ScoresGrid', 'unmounted');
        };
    }, [data]);

    if (!data || !data.conversations || data.conversations.length === 0) {
        logger.warn('COMPONENT', 'ScoresGrid received no conversation data');
        return null;
    }

    // Get the first conversation's scores or calculate overall
    const getOverallScores = () => {
        if (data.conversations.length === 1) {
            return data.conversations[0].ielts_scores || {};
        }
        
        // If multiple conversations, calculate averages
        const scoreCategories = ['overall', 'pronunciation', 'fluency', 'vocabulary', 'grammar', 'coherence'];
        const overallScores = {};
        
        scoreCategories.forEach(category => {
            const scores = data.conversations
                .map(conv => conv.ielts_scores?.[category])
                .filter(score => typeof score === 'number' && score > 0);
            
            if (scores.length > 0) {
                const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
                overallScores[category] = Math.round(average * 10) / 10;
            }
        });
        
        return overallScores;
    };

    const scores = getOverallScores();
    
    const scoreCards = [
        {
            title: 'Overall Score',
            key: 'overall',
            value: scores.overall,
            description: Utils.getScoreDescription(scores.overall)
        },
        {
            title: 'Pronunciation',
            key: 'pronunciation', 
            value: scores.pronunciation,
            description: 'Clarity and accuracy of speech sounds'
        },
        {
            title: 'Fluency',
            key: 'fluency',
            value: scores.fluency,
            description: 'Smoothness and naturalness of speech'
        },
        {
            title: 'Vocabulary',
            key: 'vocabulary',
            value: scores.vocabulary,
            description: 'Range and appropriateness of word choice'
        },
        {
            title: 'Grammar',
            key: 'grammar',
            value: scores.grammar,
            description: 'Accuracy and range of grammatical structures'
        },
        {
            title: 'Coherence',
            key: 'coherence',
            value: scores.coherence,
            description: 'Logical organization and connection of ideas'
        }
    ];

    const ScoreCard = ({ title, value, description, isMain = false }) => {
        const scoreColor = Utils.getScoreColor(value);
        
        return (
            <div 
                className={`score-card ${isMain ? 'main-score' : ''}`}
                style={{
                    borderLeft: `4px solid ${scoreColor}`
                }}
            >
                <h3>{title}</h3>
                <div 
                    className="score-value" 
                    style={{ color: scoreColor }}
                    title={`Score: ${value || 'N/A'}`}
                >
                    {value ? value.toFixed(1) : 'N/A'}
                </div>
                <div className="score-description" title={description}>
                    {Utils.truncateText(description, 50)}
                </div>
            </div>
        );
    };

    return (
        <div className="scores-grid fade-in">
            {scoreCards.map((card, index) => (
                <ScoreCard
                    key={card.key}
                    title={card.title}
                    value={card.value}
                    description={card.description}
                    isMain={card.key === 'overall'}
                />
            ))}
        </div>
    );
};

export default ScoresGrid;