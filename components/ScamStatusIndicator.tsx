import React from 'react';

interface ScamStatusIndicatorProps {
  scamDetected: boolean;
}

const ScamStatusIndicator: React.FC<ScamStatusIndicatorProps> = ({ scamDetected }) => {
  return (
    <div
      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold shadow-md ${
        scamDetected
          ? 'bg-red-500 text-white animate-pulse'
          : 'bg-green-500 text-white'
      }`}
    >
      {scamDetected ? 'Scam Detected!' : 'Monitoring...'}
    </div>
  );
};

export default ScamStatusIndicator;