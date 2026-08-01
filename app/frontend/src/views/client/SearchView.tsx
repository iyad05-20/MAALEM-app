import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ArrowUpRight } from 'lucide-react';
import { SearchProductCard } from '../../components/Shared/SearchProductCard';
import { MAALEM_DATA } from '../../data/mockData';
import type { View } from '../../types';

import { recSession } from '../../services/recommendationSession';

interface SearchViewProps {
  onNavigate: (view: View) => void;
  onSelectProduct?: (product: any) => void;
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

// ── Static data (will be dynamic later) ──────────────────────────────────────
const RECENT_SEARCHES = ['Siniya cuivre', 'Tajine fassi', 'Tapis boucherouite'];

const AI_SUGGESTIONS = [
  { title: 'Fibule berbère traditionnelle', subtitle: 'Bijouterie · Atlas Mountains', type: 'bijou' },
  { title: 'Lanterne laiton ajouré', subtitle: 'Dinanderie · Fès', type: 'deco' },
  { title: 'Pochette velours Sirma', subtitle: 'Broderie · Édition limitée', type: 'mode' },
];

const CATEGORIES = [
  { key: 'bijouterie',  label: 'Bijouterie',  icon: '◆', color: 'rgba(212,175,55,0.08)',  border: 'rgba(212,175,55,0.2)' },
  { key: 'ceramique',  label: 'Céramique',   icon: '○', color: 'rgba(204,119,85,0.07)', border: 'rgba(204,119,85,0.2)' },
  { key: 'dinanderie', label: 'Dinanderie',  icon: '✦', color: 'rgba(156,175,136,0.08)', border: 'rgba(156,175,136,0.25)' },
  { key: 'tissage',    label: 'Tissage',     icon: '▦', color: 'rgba(26,42,58,0.06)',    border: 'rgba(26,42,58,0.15)' },
];

const COLLECTIONS = [
  { label: 'Héritage Fassi', q: 'fassi' },
  { label: 'Trésors Berbères', q: 'berbere' },
  { label: 'Noces Marocaines', q: 'mariage' },
];


let cachedSearchKey: string | null = null;
async function getSearchKey(): Promise<string> {
  if (cachedSearchKey) return cachedSearchKey;
  const res = await fetch(`${API_BASE}/search/key`);
  if (!res.ok) throw new Error('Search key retrieval failed');
  const data = await res.json();
  cachedSearchKey = data.searchKey;
  return cachedSearchKey!;
}

export const SearchView: React.FC<SearchViewProps> = ({ onNavigate, onSelectProduct }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [results, setResults] = useState<any[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setSuggestions([]); return; }
    try {
      const key = await getSearchKey();
      const meiliHost = import.meta.env.VITE_MEILISEARCH_HOST || 'http://localhost:7700';
      const res = await fetch(`${meiliHost}/indexes/products/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          q: q,
          limit: 8,
          attributesToHighlight: ['title'],
          attributesToRetrieve: ['title', 'category_group']
        })
      });
      const data = await res.json();
      if (data.hits) {
        const seen = new Set();
        const suggs = [];
        for (const hit of data.hits) {
          const text = hit.title.toLowerCase();
          if (!seen.has(text)) {
            seen.add(text);
            suggs.push({ text: hit.title, type: 'product', category: hit.category_group });
          }
        }
        setSuggestions(suggs);
      }
    } catch { /* silent */ }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (results !== null) setResults(null);
    fetchSuggestions(q);
  };

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setIsSearching(true);
    setSuggestions([]);

    const queryTag = q.toLowerCase().trim();
    recSession.trackAction('SEARCH', [queryTag]);

    try {
      const key = await getSearchKey();
      const meiliHost = import.meta.env.VITE_MEILISEARCH_HOST || 'http://localhost:7700';
      const searchOptions: any = {
        limit: 20,
        facets: ['category_group', 'rec_tags.style', 'rec_tags.material', 'rec_tags.color_vibe', 'price']
      };

      // 1. Direct Search
      let res = await fetch(`${meiliHost}/indexes/products/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({ q, ...searchOptions })
      });
      let data = await res.json();
      let foundItems = data.hits || [];

      // 2. Intent fallback if direct hits are empty
      if (foundItems.length === 0) {
        const intentRes = await fetch(`${meiliHost}/indexes/search_intents/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({ q, limit: 1 })
        });
        const intentData = await intentRes.json();
        
        if (intentData.hits && intentData.hits.length > 0) {
          const intent = intentData.hits[0];
          const filterParts = [];
          
          if (intent.category_groups) {
            filterParts.push(`category_group = "${intent.category_groups}"`);
          } else if (intent.tags && intent.tags.length > 0) {
            const validStyleTags = ['traditionnel', 'berbere', 'luxe', 'artisanal', 'marocain', 'moderne', 'rustique'];
            const matchingTags = intent.tags.filter((t: string) => validStyleTags.includes(t));
            if (matchingTags.length > 0) {
              const tagList = matchingTags.map((t: string) => `"${t}"`).join(', ');
              filterParts.push(`rec_tags.style IN [${tagList}]`);
            }
          }

          if (filterParts.length > 0) {
            searchOptions.filter = filterParts.join(' AND ');
          }

          const refinedRes = await fetch(`${meiliHost}/indexes/products/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({ q: '', ...searchOptions })
          });
          const refinedData = await refinedRes.json();
          foundItems = refinedData.hits || [];
        }
      }

      setResults(foundItems);

      // Track search interaction tags in profile
      if (foundItems.length > 0) {
        const searchTags: string[] = [queryTag];
        foundItems.forEach((item: any) => {
          if (item.rec_tags) {
            if (Array.isArray(item.rec_tags.style)) searchTags.push(...item.rec_tags.style);
            if (Array.isArray(item.rec_tags.material)) searchTags.push(...item.rec_tags.material);
            if (Array.isArray(item.rec_tags.color_vibe)) searchTags.push(...item.rec_tags.color_vibe);
          }
          if (item.category_group) searchTags.push(item.category_group);
        });

        const uniqueSearchTags = Array.from(new Set(searchTags));
        recSession.trackAction('SEARCH', uniqueSearchTags);
        console.log(`[SEARCH] 🔍 SEARCH action queued on tags [${uniqueSearchTags.join(', ')}]`);
      }
    } catch (e) {
      console.error('Search error:', e);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { setQuery(query); performSearch(query); }
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    performSearch(text);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setResults(null);
  };

  const searchState = results !== null ? 'results' : query.length > 0 ? 'typing' : 'empty';

  return (
    <motion.div
      className="search-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* ── Background: zellige pattern + blur on home ── */}
      <div className="search-bg-pattern" />
      <div className="search-bg-blur" />

      {/* ── Main panel ── */}
      <motion.div
        className="search-panel"
        initial={{ y: 24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── Header ── */}
        <div className="search-header">
          <button
            className="search-back-btn"
            onClick={() => onNavigate('home')}
            aria-label="Retour"
          >
            <X size={18} strokeWidth={2} />
          </button>

          {/* ── Search Bar ── */}
          <div className="search-bar-wrap">
            <Search className="search-bar-icon" size={18} strokeWidth={1.8} />
            <input
              ref={inputRef}
              type="text"
              className="search-bar-input"
              placeholder="Rechercher une création..."
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  className="search-bar-clear"
                  onClick={handleClear}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  aria-label="Effacer"
                >
                  <X size={13} strokeWidth={2.5} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="search-body">
          <AnimatePresence mode="wait">

            {/* ════════════════════ EMPTY STATE ════════════════════ */}
            {searchState === 'empty' && (
              <motion.div
                key="empty"
                className="search-content"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Recent */}
                <section className="search-section">
                  <p className="search-label">
                    <span className="search-label-icon">🕘</span>
                    Recherches récentes
                  </p>
                  <div className="recent-pills">
                    {RECENT_SEARCHES.map(tag => (
                      <button key={tag} className="recent-pill" onClick={() => handleSuggestionClick(tag)}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </section>

                {/* AI Suggestions */}
                <section className="search-section">
                  <p className="search-label ai-label">
                    <span className="search-label-icon">✨</span>
                    Inspirations du moment
                  </p>
                  <div className="ai-cards">
                    {AI_SUGGESTIONS.map((s, i) => (
                      <motion.button
                        key={i}
                        className="ai-card"
                        onClick={() => handleSuggestionClick(s.title)}
                        whileTap={{ scale: 0.97 }}
                      >
                        <div className="ai-card-dot" />
                        <div className="ai-card-body">
                          <span className="ai-card-title">{s.title}</span>
                          <span className="ai-card-sub">{s.subtitle}</span>
                        </div>
                        <ArrowUpRight size={14} className="ai-card-arrow" strokeWidth={2} />
                      </motion.button>
                    ))}
                  </div>
                </section>

                {/* Explorer grid */}
                <section className="search-section">
                  <p className="search-label">
                    <span className="search-label-icon">⬚</span>
                    Explorer
                  </p>
                  <div className="explore-grid">
                    {/* Categories */}
                    <div className="explore-col">
                      {CATEGORIES.map(c => (
                        <motion.button
                          key={c.key}
                          className="category-card"
                          style={{ '--cat-bg': c.color, '--cat-border': c.border } as any}
                          onClick={() => handleSuggestionClick(c.label)}
                          whileTap={{ scale: 0.96 }}
                        >
                          <span className="category-icon">{c.icon}</span>
                          <span className="category-name">{c.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Collections */}
                    <div className="explore-col">
                      <p className="explore-col-header">Collections</p>
                      {COLLECTIONS.map(col => (
                        <motion.button
                          key={col.label}
                          className="collection-card"
                          onClick={() => handleSuggestionClick(col.q)}
                          whileTap={{ scale: 0.96 }}
                        >
                          <span className="collection-dot">✦</span>
                          <span className="collection-name">{col.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {/* ════════════════════ TYPING — Suggestions ════════════════════ */}
            {searchState === 'typing' && (
              <motion.div
                key="typing"
                className="suggest-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                {suggestions.length > 0 ? (
                  suggestions.map((s, i) => (
                    <motion.button
                      key={i}
                      className="suggest-row"
                      onClick={() => handleSuggestionClick(s.text)}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="suggest-icon-wrap">
                        <Search size={14} strokeWidth={2} className="suggest-icon" />
                      </div>
                      <div className="suggest-text-wrap">
                        <span className="suggest-title">{s.text}</span>
                        {s.category && (
                          <span className="suggest-sub">{s.category}</span>
                        )}
                      </div>
                      <ArrowUpRight size={13} className="suggest-arrow" strokeWidth={2} />
                    </motion.button>
                  ))
                ) : (
                  <div className="suggest-loading">
                    <div className="suggest-dot-row">
                      {[0, 1, 2].map(i => (
                        <motion.span
                          key={i}
                          className="suggest-dot"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                    <span className="suggest-loading-text">Recherche en cours…</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════════════════════ RESULTS ════════════════════ */}
            {searchState === 'results' && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {isSearching ? (
                  <div className="results-loading">
                    <div className="results-spinner" />
                    <span>Recherche en cours…</span>
                  </div>
                ) : results && results.length > 0 ? (
                  <>
                    <div className="results-meta">
                      <span className="results-count">{results.length} résultats</span>
                      <span className="results-query">pour « {query} »</span>
                    </div>
                    <div className="results-grid">
                      {results.map(p => (
                        <SearchProductCard
                          key={p.id}
                          product={p}
                          onSelect={(searchProd) => {
                            const fullProd = MAALEM_DATA.products.find(item => item.id === searchProd.id) || {
                              id: searchProd.id,
                              title: searchProd.title,
                              category: searchProd.category_group,
                              price: searchProd.price ? `${searchProd.price} MAD` : 'Sur demande',
                              rating: 4.8,
                              badge: null,
                              image: ''
                            };
                            onSelectProduct?.(fullProd);
                          }}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="zero-results">
                    <span className="zero-results-icon">◇</span>
                    <p className="zero-results-title">Aucun résultat</p>
                    <p className="zero-results-sub">pour « {query} »</p>
                    <button className="zero-results-btn" onClick={handleClear}>
                      Réinitialiser
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
