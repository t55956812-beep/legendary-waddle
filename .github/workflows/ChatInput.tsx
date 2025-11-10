import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSubmit: (text: string) => void;
  disabled: boolean;
  placeholder: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, disabled, placeholder }) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSubmit(inputText);
      setInputText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 transition disabled:bg-slate-100 text-slate-900 placeholder:text-slate-400"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !inputText.trim()}
        className="bg-amber-600 text-white rounded-full p-2.5 hover:bg-amber-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 flex-shrink-0"
      >
        <SendIcon />
      </button>
    </form>
  );
};

export default ChatInput;
