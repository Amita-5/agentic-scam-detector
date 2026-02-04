import React from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isScammer = message.sender === 'scammer';
  const messageClasses = isScammer
    ? 'bg-blue-100 text-gray-800 self-start rounded-br-lg'
    : 'bg-green-100 text-gray-800 self-end rounded-bl-lg';

  return (
    <div className={`flex ${isScammer ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[70%] p-3 rounded-lg shadow-md ${messageClasses}`}>
        <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        <span className="text-xs text-gray-500 block text-right mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;