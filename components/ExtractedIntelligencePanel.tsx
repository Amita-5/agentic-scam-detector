import React from 'react';
import { ExtractedIntelligence } from '../types';

interface ExtractedIntelligencePanelProps {
  intelligence: ExtractedIntelligence;
  scamType: string | null;
  agentNotes: string;
}

const IntelligenceCategory: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="mb-4">
    <h3 className="text-lg font-semibold text-gray-800 mb-2 border-b pb-1 border-gray-200">{title}</h3>
    {items && items.length > 0 ? (
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-sm break-words">{item}</li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-gray-500 italic">None found yet.</p>
    )}
  </div>
);

const ExtractedIntelligencePanel: React.FC<ExtractedIntelligencePanelProps> = ({
  intelligence,
  scamType,
  agentNotes,
}) => {
  return (
    <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-lg flex flex-col max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Honeypot Insights</h2>

      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Scam Type Detected:</h3>
        <p className={`text-md font-medium ${scamType ? 'text-red-600' : 'text-gray-500 italic'}`}>
          {scamType || 'No specific type identified'}
        </p>
      </div>

      <div className="mb-6 pb-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Agent Notes:</h3>
        <p className="text-sm text-gray-700 italic break-words whitespace-pre-wrap">
          {agentNotes || 'No notes generated yet.'}
        </p>
      </div>

      <h2 className="text-xl font-bold text-gray-800 mb-4">Extracted Intelligence</h2>
      <IntelligenceCategory title="Bank Accounts" items={intelligence.bankAccounts} />
      <IntelligenceCategory title="UPI IDs" items={intelligence.upiIds} />
      <IntelligenceCategory title="Phishing Links" items={intelligence.phishingLinks} />
      <IntelligenceCategory title="Phone Numbers" items={intelligence.phoneNumbers} />
      <IntelligenceCategory title="Suspicious Keywords" items={intelligence.suspiciousKeywords} />
    </div>
  );
};

export default ExtractedIntelligencePanel;