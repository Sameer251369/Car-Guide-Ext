import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowUpRight } from 'lucide-react';
import { toAppMediaUrl } from '../api/client';

/*
  Same tokens as Home / Blog / ArticleDetail
  - Flat-black card that pops off the white page; image fades into the card body
  - Red is only the slanted marker, the arrow on hover and the focus ring
  - Whole card is one link: the title's <Link> is stretched over the card (after:inset-0),
    so clicking anywhere opens /blog/:slug while screen readers still hear a single link named by the title.
*/

export default function BlogCard({ article }) {
  const formattedDate = new Date(article.published_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-black text-white shadow-[0_24px_50px_-28px_rgba(0,0,0,0.8)] transition-all duration-300 hover:-translate-y-1 hover:border-[#ff3b2f]/50 hover:shadow-[0_30px_60px_-24px_rgba(255,59,47,0.45)] focus-within:ring-2 focus-within:ring-[#ff3b2f] focus-within:ring-offset-2 focus-within:ring-offset-white motion-reduce:hover:translate-y-0">
      <div className="relative aspect-[16/9] overflow-hidden bg-black">
        <img
          src={toAppMediaUrl(article.featured_image_url) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'}
          alt=""
          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105"
          loading="lazy"
        />
        {/* fade into the card body */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#ff3b2f]/25 blur-3xl" />

        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white backdrop-blur-xl">
          <span className="h-3.5 w-1 -skew-x-12 rounded-sm bg-[#ff3b2f]" aria-hidden="true" />
          {article.category_name || 'Editorial'}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col justify-between gap-6 px-6 pb-6 pt-2">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-white/60">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={article.published_at}>{formattedDate}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{article.author_name}</span>
            </span>
          </div>

          <h3 className="line-clamp-2 text-2xl font-black leading-[1.1] tracking-[-0.03em]">
            <Link
              to={`/blog/${article.slug}`}
              className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
            >
              {article.title}
            </Link>
          </h3>

          <p className="line-clamp-3 text-base leading-snug text-white/65">{article.excerpt}</p>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4" aria-hidden="true">
          <span className="text-base font-semibold text-white/90">Read article</span>
          <span className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 -skew-x-12 rounded-lg bg-white/10 transition-colors duration-300 group-hover:bg-[#ff3b2f] group-hover:shadow-[0_0_24px_rgba(255,59,47,0.7)]" />
            <ArrowUpRight className="relative h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </article>
  );
}