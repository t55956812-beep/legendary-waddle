import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getInitialQuestion, getNextQuestion, getRecommendations } from '../services/geminiService';
import { ChatMessage, BookRecommendation } from '../types';
import BookCard from './BookCard';
import ChatInput from './ChatInput';
import { LoadingSpinner, UserIcon, AiIcon, ReloadIcon } from './Icons';

const MAX_QUESTIONS = 6;

const RecommendationAgent: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const questionCount = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, recommendations, isLoading]);

  const startConversation = useCallback(async () => {
    setIsLoading(true);
    const initialQuestion = await getInitialQuestion();
    setMessages([{ sender: 'ai', text: initialQuestion }]);
    questionCount.current = 1;
    setIsLoading(false);
  }, []);

  useEffect(() => {
    startConversation();
  }, [startConversation]);

  const handleSubmit = async (inputText: string) => {
    if (!inputText.trim() || isLoading || isComplete) return;

    const userMessage: ChatMessage = { sender: 'user', text: inputText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    if (questionCount.current < MAX_QUESTIONS) {
      const nextQuestion = await getNextQuestion(newMessages);
      setMessages(prev => [...prev, { sender: 'ai', text: nextQuestion }]);
      questionCount.current += 1;
    } else {
      const finalRecommendations = await getRecommendations(newMessages);
      setRecommendations(finalRecommendations);
      setMessages(prev => [...prev, { sender: 'ai', text: "Based on our conversation, here are a few books you might love!" }]);
      setIsComplete(true);
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setMessages([]);
    setRecommendations([]);
    setIsComplete(false);
    startConversation();
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
       <header className="flex-shrink-0 p-4 bg-white border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-700 font-serif">Book Recommender</h2>
        <button
          onClick={handleReset}
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-500"
          aria-label="Start new recommendation"
        >
          <ReloadIcon />
        </button>
      </header>
      <div className="flex-grow p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((msg, index) => (
            <Message key={index} message={msg} />
          ))}
          {isLoading && !isComplete && (
            <div className="flex justify-center items-center gap-2 text-slate-500">
              <LoadingSpinner />
              <span>Novel Navigator is thinking...</span>
            </div>
          )}
          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {recommendations.map((book, index) => (
                <BookCard key={index} book={book} />
              ))}
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-slate-200">
        {isComplete ? (
          <div className="text-center text-slate-500 py-2.5">
            <p>Enjoy your new books! ✨</p>
          </div>
        ) : (
          <ChatInput onSubmit={handleSubmit} disabled={isLoading} placeholder="Type your answer..." />
        )}
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
        <p className="text-sm md:text-base">{message.text}</p>
      </div>
       {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <UserIcon />
        </div>
      )}
    </div>
  );
};


export default RecommendationAgent;