import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import BlogCard from '../components/BlogCard';
import { Search, BookOpen } from 'lucide-react';

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

  const articles = articlesData?.results || articlesData || [];

  return (
    <>
      <SEOHead
        title="Editorial Blog & Automotive Guides | Car Guide Media"
        description="Expert insights on RTO road tax rules, Pre-GST calculations, EV incentives, and new car buying advice in India."
      />

      <div className="py-12 bg-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="border-b border-slate-900 pb-6 space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Editorial Column</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-serif">Car Guide Media Journal</h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              In-depth articles demystifying Indian automobile taxation, EV policies, long-term vehicle reviews, and buyer advice.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
            
            {/* Category pills */}
            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  selectedCategory === ''
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === cat.slug
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 transition-all placeholder-slate-600"
              />
            </div>

          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-slate-900 rounded-2xl border border-slate-800" />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {articles.map((art) => (
                <BlogCard key={art.id} article={art} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No articles found</h3>
              <p className="text-xs text-slate-400">Try searching for another topic or resetting category filters.</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
