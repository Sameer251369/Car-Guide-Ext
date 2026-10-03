import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import BlogCard from '../components/BlogCard';
import { Search, BookOpen, X } from 'lucide-react';

/*
  Same tokens as Home.jsx
  - Ink #000000 header band, Paper #ffffff results, Signal #ff3b2f accent
  - One glass panel (filters) over the black header
*/

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f] focus-visible:ring-offset-2 focus-visible:ring-offset-black';
const focusRingLight =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: () => api.getBlogCategories(),
  });

  const queryParams = {
    ...(searchQuery && { search: searchQuery }),
    ...(selectedCategory && { category__slug: selectedCategory }),
  };

  const { data: articlesData, isLoading } = useQuery({
    queryKey: ['articles', queryParams],
    queryFn: () => api.getArticles(queryParams),
  });

  const articles = Array.isArray(articlesData?.results)
    ? articlesData.results
    : Array.isArray(articlesData)
      ? articlesData
      : [];

  const hasFilters = Boolean(searchQuery || selectedCategory);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
  };

  const pillBase =
    `shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${focusRing}`;
  const pillOn = 'bg-white text-black';
  const pillOff = 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white';

  return (
    <>
      <SEOHead
        title="Editorial Blog & Automotive Guides | Car Guide Media"
        description="Expert insights on RTO road tax rules, Pre-GST calculations, EV incentives, and new car buying advice in India."
      />

      <div className="min-h-screen bg-white text-black">
        {/* HEADER: flat black, big type, glass filter panel */}
        <header className="bg-black text-white">
          <div className="mx-auto w-full max-w-[1320px] px-5 pb-10 pt-28 sm:px-8 lg:px-12 lg:pb-14 lg:pt-36">
            <h1 className="max-w-[14ch] text-[clamp(3rem,9.5vw,8.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
              Car Guide <span className="text-[#ff3b2f]">Journal</span>
            </h1>
            <p className="mt-8 max-w-[52ch] text-lg leading-snug text-white/70 sm:text-xl">
              Plain-language guides to Indian road tax, EV policy, long-term reviews and buying advice.
            </p>

            <div className="mt-12 flex flex-col gap-4 rounded-[28px] border border-white/20 bg-white/10 p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                className="flex w-full items-center gap-2 overflow-x-auto pb-1 lg:w-auto lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label="Filter by category"
              >
                <button
                  type="button"
                  onClick={() => setSelectedCategory('')}
                  aria-pressed={selectedCategory === ''}
                  className={`${pillBase} ${selectedCategory === '' ? pillOn : pillOff}`}
                >
                  All articles
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    aria-pressed={selectedCategory === cat.slug}
                    className={`${pillBase} ${selectedCategory === cat.slug ? pillOn : pillOff}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:w-80">
                <label htmlFor="blog-search" className="sr-only">Search articles</label>
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
                  aria-hidden="true"
                />
                <input
                  id="blog-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles"
                  className={`w-full rounded-full border border-white/20 bg-black/40 py-3 pl-11 pr-4 text-base text-white placeholder-white/50 transition-colors focus:border-[#ff3b2f] ${focusRing}`}
                />
              </div>
            </div>
          </div>
        </header>

        {/* RESULTS: white surface */}
        <main className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12" aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            <>
              <span className="sr-only">Loading articles…</span>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-96 rounded-2xl bg-[#eeeeee] motion-safe:animate-pulse" />
                ))}
              </div>
            </>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((art) => (
                <BlogCard key={art.id} article={art} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#eeeeee] p-10 sm:p-16">
              <BookOpen className="h-9 w-9 text-black/40" aria-hidden="true" />
              <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">No articles found</h2>
              <p className="mt-3 max-w-[44ch] text-black/65">
                Try a different search, or clear the filters to see every article.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className={`mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-[#ff3b2f] ${focusRingLight}`}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}