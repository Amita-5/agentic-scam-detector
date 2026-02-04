import React from 'react';

interface EngagementControlsProps {
  onEndEngagement: () => void;
  onResetSession: () => void;
  engagementCompleted: boolean;
  isLoading: boolean;
}

const EngagementControls: React.FC<EngagementControlsProps> = ({
  onEndEngagement,
  onResetSession,
  engagementCompleted,
  isLoading,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border-t border-gray-200 bg-gray-50">
      <button
        onClick={onEndEngagement}
        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-400"
        disabled={engagementCompleted || isLoading}
      >
        {engagementCompleted ? 'Engagement Completed!' : 'End Engagement & Submit Results'}
      </button>
      <button
        onClick={onResetSession}
        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        disabled={isLoading}
      >
        Reset Session
      </button>
    </div>
  );
};

export default EngagementControls;