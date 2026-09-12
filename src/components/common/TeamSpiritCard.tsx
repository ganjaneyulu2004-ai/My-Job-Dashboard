import React, { useState } from 'react';
import { Quote, Sparkles } from 'lucide-react';

export const TEAM_QUOTES = [
  {
    quote: "Alone we can do so little; together we can do so much.",
    author: "Helen Keller"
  },
  {
    quote: "Coming together is a beginning, staying together is progress, and working together is success.",
    author: "Henry Ford"
  },
  {
    quote: "Great things in business are never done by one person; they're done by a team of people.",
    author: "Steve Jobs"
  },
  {
    quote: "Talent wins games, but teamwork wins championships.",
    author: "Michael Jordan"
  }
];

interface TeamSpiritCardProps {
  className?: string;
  compact?: boolean;
}

export const TeamSpiritCard: React.FC<TeamSpiritCardProps> = ({
  className = '',
  compact = false
}) => {
  // Select quote randomly per load or rotation
  const [currentQuote] = useState(() => {
    const index = Math.floor(Math.random() * TEAM_QUOTES.length);
    return TEAM_QUOTES[index];
  });

  return (
    <div
      className={`rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-purple-950/90 border border-purple-400/30 shadow-2xl backdrop-blur-xl text-white relative overflow-hidden animate-in fade-in duration-500 ${className}`}
    >
      {/* Subtle ambient lighting effects */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Card Header: Large Quote Icon & Team Spirit Badge */}
      <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500/30 to-purple-600/30 border border-pink-400/40 flex items-center justify-center text-pink-300 shadow-md">
            <Quote className="w-5 h-5 fill-pink-300/40" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Team Spirit
            </h4>
            <p className="text-[10px] text-purple-200/70 font-semibold">Daily Team Inspiration</p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          iBrain Labs
        </span>
      </div>

      {/* Quote Body */}
      <div className="space-y-2 py-1 relative z-10 text-center sm:text-left">
        <blockquote className="font-serif italic text-white/95 text-sm sm:text-base leading-relaxed tracking-wide drop-shadow-xs">
          "{currentQuote.quote}"
        </blockquote>

        <p className="text-xs font-bold text-purple-200/80 tracking-wide text-right pr-1">
          — {currentQuote.author}
        </p>
      </div>

      {/* Fixed Tagline (Stays below every quote) */}
      <div className="mt-4 pt-3 border-t border-white/15 text-center relative z-10">
        <p className="text-[11px] sm:text-xs font-extrabold text-amber-300 tracking-wide flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>iBrain Labs Team — Growing Together, Winning Together</span>
        </p>
      </div>
    </div>
  );
};

export default TeamSpiritCard;
