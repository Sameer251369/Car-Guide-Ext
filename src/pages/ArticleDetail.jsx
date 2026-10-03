import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { toAppMediaUrl } from '../api/client';
import SEOHead from '../components/SEOHead';
import { Calendar, User, ArrowLeft, ArrowUpRight, Calculator, Tag } from 'lucide-react';

/*
  Same tokens as Home.jsx / Blog.jsx
  - Ink #000000 header + CTA band, Paper #ffffff reading surface, Signal #ff3b2f accent
  - Glass used once: the category chip over the black header
*/

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f] focus-visible:ring-offset-2 focus-visible:ring-offset-black';
const focusRingLight =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b2f] focus-visible:ring-offset-2 focus-visible:ring-offset-white';

export default function ArticleDetail() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.getArticleBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black/70" role="status">
        <div className="mb-4 h-8 w-8 rounded-full border-2 border-[#ff3b2f] border-t-transparent motion-safe:animate-spin" />
        <p className="text-base">Loading article…</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Article not found</h1>
        <p className="mt-3 max-w-[40ch] text-black/65">
          It may have been moved or removed. Head back to the journal to see everything we’ve published.
        </p>
        <Link
          to="/blog"
          className={`mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white transition-colors hover:bg-[#ff3b2f] ${focusRingLight}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to journal
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

      <article className="min-h-screen bg-white text-black">
        {/* HEADER: flat black, oversized title */}
        <header className="bg-black text-white">
          <div className="mx-auto w-full max-w-[1100px] px-5 pb-12 pt-28 sm:px-8 lg:px-12 lg:pb-16 lg:pt-36">
            <Link
              to="/blog"
              className={`inline-flex items-center gap-2 rounded-sm text-base text-white/70 transition-colors hover:text-white ${focusRing}`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to journal</span>
            </Link>

            <div className="mt-10 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-2xl">
              {article.category?.name || 'Editorial'}
            </div>

            <h1 className="mt-6 max-w-[20ch] text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
              {article.title}
            </h1>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-base text-white/70">
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4 text-[#ff3b2f]" aria-hidden="true" />
                <span className="font-semibold text-white">{article.author_name}</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <time dateTime={article.published_at}>{formattedDate}</time>
              </span>
            </div>
          </div>
        </header>

        {/* FEATURED IMAGE */}
        {article.featured_image_url && (
          <div className="mx-auto w-full max-w-[1100px] px-5 pt-10 sm:px-8 lg:px-12">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-[#eeeeee]">
              <img
                src={toAppMediaUrl(article.featured_image_url)}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        )}

        {/* READING COLUMN */}
        <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-[68ch]">
            {article.excerpt && (
              <p className="border-l-4 border-[#ff3b2f] pl-5 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                {article.excerpt}
              </p>
            )}

            <div
              className="prose prose-lg mt-10 max-w-none text-black/85 prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-black prose-a:text-[#ff3b2f] prose-a:underline-offset-4 prose-strong:text-black prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            {article.tags?.length > 0 && (
              <div className="mt-14 flex items-start gap-3 border-t border-black/10 pt-6">
                <Tag className="mt-1.5 h-4 w-4 shrink-0 text-black/50" aria-hidden="true" />
                <ul className="flex flex-wrap gap-2" aria-label="Tags">
                  {article.tags.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-full bg-[#eeeeee] px-3.5 py-1.5 text-sm font-medium text-black/75"
                    >
                      #{t.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* CTA: flat-black band, red action */}
        <section className="bg-black text-white" aria-labelledby="article-cta-title">
          <div className="mx-auto flex w-full max-w-[1100px] flex-col items-start justify-between gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:flex-row lg:items-center lg:px-12">
            <div>
              <h2
                id="article-cta-title"
                className="max-w-[16ch] text-[clamp(2rem,5vw,3.75rem)] font-extrabold leading-[0.95] tracking-[-0.035em]"
              >
                Planning to buy a new car?
              </h2>
              <p className="mt-4 max-w-[46ch] text-lg leading-snug text-white/70">
                See the on-road price for your state, with road tax, RTO fees and insurance itemized.
              </p>
            </div>
            <Link
              to="/calculator"
              className={`inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[#ff3b2f] px-8 py-4 text-lg font-bold text-black transition-colors hover:bg-white ${focusRing}`}
            >
              <Calculator className="h-5 w-5" aria-hidden="true" />
              <span>Calculate on-road price</span>
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}