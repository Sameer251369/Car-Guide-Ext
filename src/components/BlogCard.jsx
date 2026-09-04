import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, ArrowUpRight } from 'lucide-react';
import { toAppMediaUrl } from '../api/client';

export default function BlogCard({ article }) {
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <article className="group rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
        <img
          src={toAppMediaUrl(article.featured_image_url) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-950/90 backdrop-blur-md text-amber-400 border border-amber-500/30">
            {article.category_name || 'Editorial'}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{article.author_name}</span>
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors font-serif leading-snug line-clamp-2">
            <Link to={`/blog/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-amber-400/90 font-medium group-hover:underline flex items-center space-x-1">
            <span>Read Article</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
