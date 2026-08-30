import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import SEOHead from '../components/SEOHead';
import { Calendar, User, ArrowLeft, Calculator, ShieldCheck, Tag } from 'lucide-react';

export default function ArticleDetail() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.getArticleBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-4">
        <h2 className="text-xl font-bold text-white">Article Not Found</h2>
        <Link to="/blog" className="inline-flex items-center space-x-2 text-amber-400 text-xs font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Editorial Journal</span>
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <SEOHead
        title={article.meta_title || `${article.title} | Car Guide Media`}
        description={article.meta_description || article.excerpt}
      />

      <article className="py-12 bg-slate-950 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <Link to="/blog" className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Journal</span>
          </Link>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                {article.category?.name || 'Editorial'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-serif leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center space-x-4 text-xs text-slate-400 border-y border-slate-900 py-3">
              <span className="flex items-center space-x-1.5">
                <User className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-slate-200">{article.author_name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{formattedDate}</span>
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 aspect-[16/9] shadow-2xl">
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-300 italic font-serif leading-relaxed border-l-2 border-amber-500 pl-4 py-1">
              "{article.excerpt}"
            </p>
          )}

          {/* Article Body */}
          <div
            className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="pt-6 border-t border-slate-900 flex items-center space-x-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <div className="flex flex-wrap gap-2">
                {article.tags.map((t) => (
                  <span key={t.id} className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 text-xs border border-slate-800">
                    #{t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Inline Calculator CTA Widget */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/30 space-y-4 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-serif">Planning to buy a new car?</h3>
              <p className="text-xs text-slate-400">Calculate accurate on-road tax, RTO fees, and insurance breakdown for your state.</p>
            </div>
            <Link
              to="/calculator"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 shrink-0 flex items-center space-x-2"
            >
              <Calculator className="w-4 h-4" />
              <span>Launch Calculator</span>
            </Link>
          </div>

        </div>
      </article>
    </>
  );
}
