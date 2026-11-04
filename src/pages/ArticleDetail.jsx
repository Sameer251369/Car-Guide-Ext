import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api, { toAppMediaUrl } from '../api/client';
import SEOHead from '../components/SEOHead';
import { Calendar, User, ArrowLeft, ArrowUpRight, Calculator, Tag } from 'lucide-react';

/*
  Same tokens as Home.jsx / Blog.jsx
  - Ink #000000 header + CTA band, Paper #ffffff reading surface, Signal #ff3b2f accent
  - Header glows red on a faint masked grid and ends in a slanted white edge
  - Glass used once: the category chip over the black header
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

export default function ArticleDetail() {
  const { slug } = useParams();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => api.getArticleBySlug(slug),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black/70" role="status">
        <div className="mb-4 h-10 w-10 rounded-full border-[3px] border-[#ff3b2f] border-t-transparent shadow-[0_0_24px_rgba(255,59,47,0.35)] motion-safe:animate-spin" />
        <p className="text-base">Loading article…</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-5 text-center">
        <span className="mb-6 h-10 w-2 -skew-x-12 rounded-full bg-[#ff3b2f] shadow-[0_0_24px_rgba(255,59,47,0.5)]" aria-hidden="true" />
        <h1 className="text-5xl font-extrabold tracking-[-0.04em] sm:text-6xl">Article not found</h1>
        <p className="mt-3 max-w-[40ch] text-black/65">
          It may have been moved or removed. Head back to the journal to see everything we’ve published.
        </p>
        <Link
          to="/blog"
          className={`mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white shadow-[0_14px_34px_-12px_rgba(0,0,0,0.6)] transition-all hover:-translate-y-0.5 hover:bg-[#ff3b2f] ${focusRingLight}`}
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
        <header className="relative overflow-hidden bg-black text-white">
          {/* backdrop */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#ff3b2f]/25 blur-[140px]" />
            <div className="absolute -bottom-40 left-1/4 h-[24rem] w-[24rem] rounded-full bg-[#ff3b2f]/10 blur-[150px]" />
            <div className="absolute inset-0 opacity-[0.07]" style={gridMask} />
            <div className="absolute -right-24 top-0 hidden h-full w-48 -skew-x-12 bg-gradient-to-l from-[#ff3b2f]/15 to-transparent lg:block" />
          </div>

          <div className="relative mx-auto w-full max-w-[1100px] px-5 pb-20 pt-28 sm:px-8 lg:px-12 lg:pb-28 lg:pt-36">
            <Link
              to="/blog"
              className={`group inline-flex items-center gap-2 rounded-sm text-base text-white/70 transition-colors hover:text-white ${focusRing}`}
            >
              <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true" />
              <span>Back to journal</span>
            </Link>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-2xl">
              <span className="h-3.5 w-1 -skew-x-12 rounded-sm bg-[#ff3b2f]" aria-hidden="true" />
              {article.category?.name || 'Editorial'}
            </div>

            <div className="mt-6 flex items-stretch gap-4 sm:gap-6">
              <span
                className="w-1.5 shrink-0 -skew-x-12 rounded-full bg-gradient-to-b from-[#ff3b2f] to-[#ff3b2f]/0 shadow-[0_0_24px_rgba(255,59,47,0.7)] sm:w-2"
                aria-hidden="true"
              />
              <h1 className="max-w-[20ch] text-[clamp(2.5rem,7vw,6rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
                {article.title}
              </h1>
            </div>

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

          {/* slanted white edge into the article */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-10 bg-white sm:h-14 lg:h-16 [clip-path:polygon(0_100%,100%_0,100%_100%)]"
          />
        </header>

        {/* FEATURED IMAGE */}
        {article.featured_image_url && (
          <div className="mx-auto w-full max-w-[1100px] px-5 pt-6 sm:px-8 lg:px-12">
            <div className="relative">
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-black shadow-[0_40px_80px_-40px_rgba(0,0,0,0.7)]">
                <img
                  src={toAppMediaUrl(article.featured_image_url)}
                  alt={article.title}
                  className="h-full w-full object-cover"
                />
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-black/10" />
              </div>
              {/* corner brackets */}
              <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-2 h-14 w-14 rounded-tr-3xl border-r-2 border-t-2 border-[#ff3b2f]/80" />
              <span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -left-2 h-14 w-14 rounded-bl-3xl border-b-2 border-l-2 border-black/30" />
            </div>
          </div>
        )}

        {/* READING COLUMN */}
        <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="mx-auto max-w-[68ch]">
            {article.excerpt && (
              <p className="relative pl-6 text-xl font-semibold leading-snug tracking-tight sm:text-2xl">
                <span
                  className="absolute inset-y-0 left-0 w-1.5 -skew-x-12 rounded-full bg-[#ff3b2f] shadow-[0_0_18px_rgba(255,59,47,0.45)]"
                  aria-hidden="true"
                />
                {article.excerpt}
              </p>
            )}

            <div
              className="prose prose-lg mt-10 max-w-none text-black/85 prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-black prose-a:text-[#ff3b2f] prose-a:underline-offset-4 prose-strong:text-black prose-img:rounded-2xl prose-blockquote:border-l-[#ff3b2f] prose-blockquote:font-semibold prose-blockquote:text-black"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            {article.tags?.length > 0 && (
              <div className="mt-14 flex items-start gap-3 border-t border-black/10 pt-6">
                <Tag className="mt-1.5 h-4 w-4 shrink-0 text-black/50" aria-hidden="true" />
                <ul className="flex flex-wrap gap-2" aria-label="Tags">
                  {article.tags.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-full border border-black/10 bg-[#eeeeee] px-3.5 py-1.5 text-sm font-medium text-black/75"
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
        <section className="relative overflow-hidden bg-black text-white" aria-labelledby="article-cta-title">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#ff3b2f]/25 blur-[130px]" />
            <div className="absolute inset-0 opacity-[0.07]" style={gridMask} />
            <div className="absolute -left-20 top-0 hidden h-full w-40 -skew-x-12 bg-gradient-to-r from-[#ff3b2f]/10 to-transparent lg:block" />
          </div>

          <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-start justify-between gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:flex-row lg:items-center lg:px-12">
            <div className="flex items-stretch gap-4 sm:gap-5">
              <span
                className="w-1.5 shrink-0 -skew-x-12 rounded-full bg-gradient-to-b from-[#ff3b2f] to-[#ff3b2f]/0"
                aria-hidden="true"
              />
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
            </div>
            <Link
              to="/calculator"
              className={`group inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[#ff3b2f] px-8 py-4 text-lg font-bold text-black shadow-[0_18px_44px_-12px_rgba(255,59,47,0.8)] transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_18px_44px_-12px_rgba(255,255,255,0.4)] ${focusRing}`}
            >
              <Calculator className="h-5 w-5" aria-hidden="true" />
              <span>Calculate on-road price</span>
              <ArrowUpRight className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}