import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowUpRight } from 'lucide-react';
import { toAppMediaUrl } from '../api/client';

/*
  Same tokens as Home / Blog / ArticleDetail
  - Card sits on the white page as a #eeeeee surface; red is only the arrow on hover + focus ring
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
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-[#eeeeee] text-black transition-colors hover:bg-[#e4e4e4] focus-within:ring-2 focus-within:ring-[#ff3b2f] focus-within:ring-offset-2 focus-within:ring-offset-white">
      <div className="relative aspect-[16/9] overflow-hidden bg-black">
        <img
          src={toAppMediaUrl(article.featured_image_url) || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800'}
          alt=""
          className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/40 px-3 py-1 text-sm font-semibold text-white backdrop-blur-xl">
          {article.category_name || 'Editorial'}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6 p-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-black/60">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={article.published_at}>{formattedDate}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{article.author_name}</span>
            </span>
          </div>

          <h3 className="line-clamp-2 text-xl font-extrabold leading-tight tracking-tight">
            <Link
              to={`/blog/${article.slug}`}
              className="focus-visible:outline-none after:absolute after:inset-0 after:content-['']"
            >
              {article.title}
            </Link>
          </h3>

          <p className="line-clamp-3 text-base leading-snug text-black/70">{article.excerpt}</p>
        </div>

        <div className="flex items-center justify-between border-t border-black/10 pt-4" aria-hidden="true">
          <span className="text-base font-semibold">Read article</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white transition-colors group-hover:bg-[#ff3b2f]">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}