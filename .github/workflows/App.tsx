
import React, { useState } from 'react';
import RecommendationAgent from './components/RecommendationAgent';
import GeneralChat from './components/GeneralChat';
import { BookIcon, ChatBubbleIcon } from './components/Icons';

type Mode = 'recommender' | 'chat';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('recommender');

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col items-center p-4 selection:bg-amber-200">
      <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-2rem)]">
        <header className="text-center p-4 border-b border-slate-200">
          <h1 className="text-4xl font-bold font-serif text-amber-800">Novel Navigator AI</h1>
          <p className="text-slate-500 mt-2">Your personal guide to the world of books.</p>
        </header>

        <div className="my-4 flex justify-center gap-2">
          <ModeButton
            label="Book Recommender"
            icon={<BookIcon />}
            isActive={mode === 'recommender'}
            onClick={() => setMode('recommender')}
          />
          <ModeButton
            label="General Chat"
            icon={<ChatBubbleIcon />}
            isActive={mode === 'chat'}
            onClick={() => setMode('chat')}
          />
        </div>

        <main className="flex-grow bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-0">
          {mode === 'recommender' ? <RecommendationAgent /> : <GeneralChat />}
        </main>
      </div>
    </div>
  );
};

interface ModeButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'bg-amber-600 text-white shadow-md';
  const inactiveClasses = 'bg-white text-slate-600 hover:bg-slate-100';

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );
};

export default App;
