import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentItem } from '../../types';
import { ContentCard } from './ContentCard';

interface ContentShelfProps {
  title: string;
  subtitle?: string;
  items: ContentItem[];
  onSelect: (item: ContentItem) => void;
  onPlay: (item: ContentItem) => void;
  onViewAll?: () => void;
  cardSize?: 'normal' | 'large' | 'compact';
}

export const ContentShelf: React.FC<ContentShelfProps> = ({
  title,
  subtitle,
  items,
  onSelect,
  onPlay,
  onViewAll,
  cardSize = 'normal',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -600 : 600;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative my-6 px-4 md:px-8 group/shelf">
      {/* Header Row */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-normal text-slate-400 font-mono">({items.length})</span>
          </h2>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
          >
            Explore All →
          </button>
        )}
      </div>

      {/* Horizontal Scroll Area */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          aria-label={`Scroll ${title} left`}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-all duration-200 shadow-xl backdrop-blur-xs disabled:opacity-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          className="flex items-center gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth no-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onSelect={onSelect}
              onPlay={onPlay}
              size={cardSize}
            />
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          aria-label={`Scroll ${title} right`}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white flex items-center justify-center opacity-0 group-hover/shelf:opacity-100 transition-all duration-200 shadow-xl backdrop-blur-xs"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
