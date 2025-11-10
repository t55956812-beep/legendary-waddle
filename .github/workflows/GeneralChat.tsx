import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { createChat } from '../services/geminiService';
import type { ChatMessage } from '../types';
import ChatInput from './ChatInput';
import { LoadingSpinner, UserIcon, AiIcon, ReloadIcon } from './Icons';

const GeneralChat: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startNewChat = () => {
    setChat(createChat());
    setMessages([{ sender: 'ai', text: "Hello! How can I help you today? Feel free to ask me anything." }]);
    setIsLoading(false);
  };

  useEffect(() => {
    startNewChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (inputText: string) => {
    if (!inputText.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = { sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await chat.sendMessage({ message: inputText });
      const aiMessage: ChatMessage = { sender: 'ai', text: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { sender: 'ai', text: "I'm sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <header className="flex-shrink-0 p-4 bg-white border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-700 font-serif">General Chat</h2>
        <button
          onClick={startNewChat}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500"
          aria-label="Start new chat"
        >
          <ReloadIcon />
        </button>
      </header>
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
          {isLoading && (
            <div className="flex justify-center items-center gap-2 text-slate-500">
              <LoadingSpinner />
              <span>Thinking...</span>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200">
        <ChatInput onSubmit={handleSubmit} disabled={isLoading || !chat} placeholder="Ask anything..." />
      </div>
    </div>
  );
};

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
          <AiIcon />
        </div>
      )}
      <div className={`max-w-lg px-4 py-3 rounded-xl ${isUser ? 'bg-amber-600 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
         <p className="text-sm md:text-base whitespace-pre-wrap">{message.text}</p>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <UserIcon />
        </div>
      )}
    </div>
  );
};


export default GeneralChat;