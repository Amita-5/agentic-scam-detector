import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import ChatMessage from './ChatMessage';

interface ConversationDisplayProps {
  messages: Message[];
  isLoading: boolean;
}

const ConversationDisplay: React.FC<ConversationDisplayProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-grow p-4 overflow-y-auto bg-white rounded-lg shadow-inner max-h-[60vh] md:max-h-[70vh] lg:max-h-[80vh]">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-500">
          Start by sending a message to the honeypot.
        </div>
      ) : (
        messages.map((msg, index) => (
          <ChatMessage key={index} message={msg} />
        ))
      )}
      {isLoading && (
        <div className="flex justify-start mb-4">
          <div className="bg-gray-200 text-gray-700 p-3 rounded-lg shadow-md self-start animate-pulse">
            <div className="h-4 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ConversationDisplay;