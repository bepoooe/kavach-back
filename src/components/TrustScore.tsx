import React from 'react';

interface TrustScoreProps {
  score: number;
  url: string;
}

const TrustScore: React.FC<TrustScoreProps> = ({ score, url }) => {
  const getScoreClass = (score: number) => {
    if (score >= 80) return 'score-high';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Privacy';
    if (score >= 50) return 'Fair Privacy';
    return 'Poor Privacy';
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="trust-score">
      <div className={`score-circle ${getScoreClass(score)}`}>
        {score}
      </div>
      <div className="score-label">
        {getScoreLabel(score)}
      </div>
      <div className="site-url">
        {getDomain(url)}
      </div>
    </div>
  );
};

export default TrustScore;
