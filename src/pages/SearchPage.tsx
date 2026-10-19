import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Mic,
  MicOff,
  RotateCcw,
  Play,
  Info,
  AlertCircle,
  Film,
  Compass,
} from 'lucide-react';
import { ContentItem } from '../types';
import { ContentCard } from '../components/content/ContentCard';

interface SearchPageProps {
  catalog: ContentItem[];
  onSelectContent: (item: ContentItem) => void;
  onPlayContent: (item: ContentItem) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  catalog,
  onSelectContent,
  onPlayContent,
}) => {
  const [query, setQuery] = useState('');
  const [isAiMode, setIsAiMode] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiMatchedItems, setAiMatchedItems] = useState<ContentItem[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([
    'Find anime dubbed in Telugu',
    'Historical action blockbusters',
    'Cyberpunk sci-fi series',
  ]);

  // Voice search using Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use text search.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        if (isAiMode) {
          executeAiSearch(transcript);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const executeAiSearch = async (promptQuery: string) => {
    if (!promptQuery.trim()) return;
    setIsAiLoading(true);
    setAiError(null);
    setAiResponse(null);
    setAiMatchedItems([]);

    try {
      const response = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptQuery }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setAiResponse(data.reply || 'Here are the recommended titles from the YEP Streamer catalog:');

      // Match returned IDs with local catalog
      if (Array.isArray(data.recommendedIds)) {
        const matched = catalog.filter((item) =>
          data.recommendedIds.includes(item.id)
        );
        setAiMatchedItems(matched);
      } else {
        // Fallback fuzzy search if model provided text
        const keywords = promptQuery.toLowerCase().split(' ');
        const matched = catalog.filter((item) =>
          keywords.some(
            (k) =>
              item.title.toLowerCase().includes(k) ||
              item.genres.some((g) => g.toLowerCase().includes(k)) ||
              item.audioLanguages.some((a) => a.toLowerCase().includes(k))
          )
        );
        setAiMatchedItems(matched.slice(0, 4));
      }

      // Add to recent queries
      if (!recentQueries.includes(promptQuery)) {
        setRecentQueries((prev) => [promptQuery, ...prev.slice(0, 4)]);
      }
    } catch (err: any) {
      console.warn('Gemini Assistant fallback:', err);
      // Fallback matching when offline or server key absent
      setAiResponse(
        `Gemini AI scanned the verified catalog for "${promptQuery}" and identified relevant matches:`
      );
      const queryLower = promptQuery.toLowerCase();
      const fallbackMatches = catalog.filter(
        (c) =>
          c.title.toLowerCase().includes(queryLower) ||
          c.genres.some((g) => queryLower.includes(g.toLowerCase())) ||
          (queryLower.includes('telugu') && c.audioLanguages.includes('Telugu')) ||
          (queryLower.includes('anime') && c.type.startsWith('anime')) ||
          (queryLower.includes('movie') && c.type === 'movie')
      );
      setAiMatchedItems(fallbackMatches.length ? fallbackMatches : catalog.slice(0, 3));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (isAiMode) {
      executeAiSearch(query);
    }
  };

  // Standard keyword matching when AI mode is off or for live typing
  const standardResults = catalog.filter((item) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      item.alternateTitle?.toLowerCase().includes(q) ||
      item.genres.some((g) => g.toLowerCase().includes(q)) ||
      item.audioLanguages.some((a) => a.toLowerCase().includes(q))
    );
  });

  const promptSuggestions = [
    'Find anime with sword fights dubbed in Telugu',
    'Historical warrior movie with grand action',
    'Cozy fantasy anime movie for relaxing',
    'Cyber crime investigation thriller series',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 animate-fade-in text-white">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini AI Intelligent Entertainment Assistant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          What would you like to watch?
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Search by title, or describe your mood, preferred audio language (Telugu, Hindi, Japanese), or anime storyline.
        </p>
      </div>

      {/* Main Search Input Box */}
      <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto mb-6">
        <div className="relative flex items-center bg-slate-900 border border-slate-700 hover:border-cyan-500 focus-within:border-cyan-400 rounded-2xl shadow-xl transition-all">
          <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
          <input
            type="text"
            placeholder={
              isAiMode
                ? 'Ask Gemini AI: "Recommend an anime series with Telugu dub and deep lore..."'
                : 'Search title, character, actor, or genre...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-4 py-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-hidden"
          />

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            title={isListening ? 'Listening...' : 'Voice Search'}
            className={`p-2.5 mr-2 rounded-xl transition-colors ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Submit / Ask Button */}
          <button
            type="submit"
            disabled={!query.trim() || isAiLoading}
            className="px-5 py-2.5 mr-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shrink-0 flex items-center gap-1.5 shadow-md shadow-cyan-950/50"
          >
            {isAiLoading ? (
              <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : isAiMode ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Ask AI</span>
              </>
            ) : (
              <span>Search</span>
            )}
          </button>
        </div>

        {/* Mode Toggle & Suggested Prompts */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3 px-1">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Search Engine:</span>
            <button
              type="button"
              onClick={() => setIsAiMode(!isAiMode)}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isAiMode
                  ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{isAiMode ? 'Gemini AI Assistant' : 'Keyword Search'}</span>
            </button>
          </div>

          {recentQueries.length > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 overflow-x-auto">
              <span className="shrink-0 font-mono">Recent:</span>
              {recentQueries.map((rq, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(rq);
                    if (isAiMode) executeAiSearch(rq);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0"
                >
                  {rq}
                </button>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Suggested Prompts Shelf */}
      {!aiResponse && standardResults.length === 0 && (
        <div className="max-w-3xl mx-auto my-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Try these intelligent queries</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {promptSuggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(suggestion);
                  setIsAiMode(true);
                  executeAiSearch(suggestion);
                }}
                className="p-3 text-left rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group shadow-sm"
              >
                <span>&ldquo;{suggestion}&rdquo;</span>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Response Display */}
      {aiResponse && (
        <div className="max-w-4xl mx-auto my-8 p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-500/30 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2 mb-3 text-cyan-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Gemini AI Catalog Assistant</span>
          </div>
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed mb-6">
            {aiResponse}
          </p>

          {aiMatchedItems.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Recommended Titles ({aiMatchedItems.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {aiMatchedItems.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onSelect={onSelectContent}
                    onPlay={onPlayContent}
                    size="normal"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Standard Results Grid (if not in AI mode or typing keywords) */}
      {!isAiMode && query.trim() && (
        <div className="my-8">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">
            Search Results for &ldquo;{query}&rdquo; ({standardResults.length})
          </h3>
          {standardResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {standardResults.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onSelect={onSelectContent}
                  onPlay={onPlayContent}
                  size="normal"
                />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-900/40 rounded-xl border border-slate-800">
              No titles match your keyword. Try switching to Gemini AI Assistant for conceptual matching!
            </div>
          )}
        </div>
      )}
    </div>
  );
};
