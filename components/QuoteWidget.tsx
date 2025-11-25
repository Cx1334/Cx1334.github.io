import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import { QUOTES } from '../constants';
import { Quote as QuoteIcon, RefreshCw } from 'lucide-react';

const QuoteWidget: React.FC = () => {
  const [quote, setQuote] = useState<Quote>(QUOTES[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomQuote = () => {
    setIsAnimating(true);
    // Add a small delay for animation effect
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * QUOTES.length);
      setQuote(QUOTES[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    getRandomQuote();
  }, []);

  return (
    <div className="mt-auto mx-4 mb-6 p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl relative group">
      <div className="absolute top-3 left-3 text-indigo-500/30">
        <QuoteIcon size={20} className="fill-current" />
      </div>
      
      <div className={`relative z-10 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <p className="text-xs font-medium text-slate-300 italic leading-relaxed pt-2 text-center">
          "{quote.content}"
        </p>
        <div className="mt-3 flex justify-center items-center gap-2">
          <span className="w-4 h-px bg-slate-700"></span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            {quote.author}
          </span>
          <span className="w-4 h-px bg-slate-700"></span>
        </div>
      </div>

      <button 
        onClick={getRandomQuote}
        className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-slate-800"
        title="刷新名言"
      >
        <RefreshCw size={12} className={isAnimating ? 'animate-spin' : ''} />
      </button>
    </div>
  );
};

export default QuoteWidget;