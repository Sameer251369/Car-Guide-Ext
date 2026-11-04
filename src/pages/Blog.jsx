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
  - Header glows red in the corner, sits on a faint masked grid and ends in a slanted white edge
  - Results are black BlogCards on the white surface, so the loading placeholders are dark too
*/

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f] focus-visible:ring-offset-2 focus-visible:ring-offset-black';
const focusRingLight =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

const gridMask = {
  backgroundImage:
    'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
  backgroundSize: '56px 56px',
  maskImage: 'radial-gradient(ellipse at 85% 0%, black 10%, transparent 65%)',
  WebkitMaskImage: 'radial-gradient(ellipse at 85% 0%, black 10%, transparent 65%)',
};

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
    `shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${focusRing}`;
  const pillOn = 'bg-white text-black shadow-[0_10px_30px_-10px_rgba(255,255,255,0.5)]';
  const pillOff = 'border border-white/10 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white';

  return (
    <>
      <SEOHead
        title="Editorial Blog & Automotive Guides | Car Guide Media"
        description="Expert insights on RTO road tax rules, Pre-GST calculations, EV incentives, and new car buying advice in India."
      />

      <div className="min-h-screen bg-white text-black">
        {/* HEADER: flat black, big type, glass filter panel */}
        <header className="relative overflow-hidden bg-black text-white">
          {/* backdrop */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#ff3b2f]/25 blur-[140px]" />
            <div className="absolute -bottom-40 left-1/4 h-[24rem] w-[24rem] rounded-full bg-[#ff3b2f]/10 blur-[150px]" />
            <div className="absolute inset-0 opacity-[0.07]" style={gridMask} />
            <div className="absolute -right-24 top-0 hidden h-full w-48 -skew-x-12 bg-gradient-to-l from-[#ff3b2f]/15 to-transparent lg:block" />
          </div>

          <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-20 pt-28 sm:px-8 lg:px-12 lg:pb-28 lg:pt-36">
            <div className="flex items-stretch gap-4 sm:gap-6">
              <span
                className="w-1.5 shrink-0 -skew-x-12 rounded-full bg-gradient-to-b from-[#ff3b2f] to-[#ff3b2f]/0 shadow-[0_0_24px_rgba(255,59,47,0.7)] sm:w-2"
                aria-hidden="true"
              />
              <h1 className="max-w-[14ch] text-[clamp(3rem,9.5vw,8.5rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
                Car Guide <span className="text-[#ff3b2f] [text-shadow:0_0_60px_rgba(255,59,47,0.55)]">Journal</span>
              </h1>
            </div>
            <p className="mt-8 max-w-[52ch] text-lg leading-snug text-white/70 sm:text-xl">
              Plain-language guides to Indian road tax, EV policy, long-term reviews and buying advice.
            </p>

            <div className="relative mt-12 flex flex-col gap-4 rounded-[28px] border border-white/20 bg-gradient-to-b from-white/[0.14] to-white/[0.05] p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-4 lg:flex-row lg:items-center lg:justify-between">
              {/* corner accents */}
              <span aria-hidden="true" className="pointer-events-none absolute -right-px -top-px h-12 w-12 rounded-tr-[28px] border-r-2 border-t-2 border-[#ff3b2f]/70" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-px -left-px h-12 w-12 rounded-bl-[28px] border-b-2 border-l-2 border-[#ff3b2f]/30" />

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
                  className={`w-full rounded-full border border-white/20 bg-black/50 py-3 pl-11 pr-4 text-base text-white placeholder-white/50 transition-all focus:border-[#ff3b2f] focus:bg-black/70 ${focusRing}`}
                />
              </div>
            </div>
          </div>

          {/* slanted white edge into the results */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-10 bg-white sm:h-14 lg:h-16 [clip-path:polygon(0_100%,100%_0,100%_100%)]"
          />
        </header>

        {/* RESULTS: white surface */}
        <main className="mx-auto w-full max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12" aria-live="polite" aria-busy={isLoading}>
          {isLoading ? (
            <>
              <span className="sr-only">Loading articles…</span>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="relative h-96 overflow-hidden rounded-3xl bg-gradient-to-b from-black/[0.12] to-black/[0.05] motion-safe:animate-pulse"
                  >
                    <span className="absolute left-4 top-4 h-8 w-24 rounded-full bg-black/10" />
                    <span className="absolute inset-x-6 bottom-20 h-5 rounded-full bg-black/10" />
                    <span className="absolute inset-x-6 bottom-12 h-3 w-2/3 rounded-full bg-black/10" />
                  </div>
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
            <div className="relative overflow-hidden rounded-3xl bg-black p-10 text-white sm:p-16">
              <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#ff3b2f]/25 blur-[100px]" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07]" style={gridMask} />
              <span aria-hidden="true" className="pointer-events-none absolute -right-px -top-px h-14 w-14 rounded-tr-3xl border-r-2 border-t-2 border-[#ff3b2f]/70" />

              <div className="relative">
                <span className="relative inline-flex h-14 w-14 items-center justify-center" aria-hidden="true">
                  <span className="absolute inset-0 -skew-x-12 rounded-xl bg-[#ff3b2f]/20 shadow-[0_0_30px_rgba(255,59,47,0.45)]" />
                  <BookOpen className="relative h-7 w-7 text-[#ff6b5f]" />
                </span>
                <h2 className="mt-6 text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">No articles found</h2>
                <p className="mt-3 max-w-[44ch] text-white/65">
                  Try a different search, or clear the filters to see every article.
                </p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={`mt-8 inline-flex items-center gap-2 rounded-full bg-[#ff3b2f] px-6 py-3 font-semibold text-white shadow-[0_14px_34px_-10px_rgba(255,59,47,0.75)] transition-all hover:-translate-y-0.5 hover:bg-[#ff5247] ${focusRing}`}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}