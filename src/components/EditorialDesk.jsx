import React from 'react';
import { ArrowUpRight, Calendar, ChevronRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toAppMediaUrl } from '../api/client';

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getCategory = (article) => article.category_name || article.category?.name || 'Editorial';

function ArticleMeta({ article }) {
  const date = formatDate(article.published_at);
  return (
    <div className="cg-article-meta">
      {date && (
        <span>
          <Calendar aria-hidden="true" />
          {date}
        </span>
      )}
      {article.author_name && (
        <span>
          <User aria-hidden="true" />
          {article.author_name}
        </span>
      )}
    </div>
  );
}

function ArticleImage({ article, compact = false }) {
  const imageUrl = toAppMediaUrl(article.featured_image_url);
  if (!imageUrl) {
    return <div className={`cg-article-media cg-article-media--empty${compact ? ' is-compact' : ''}`} aria-hidden="true" />;
  }

  return (
    <div className={`cg-article-media${compact ? ' is-compact' : ''}`}>
      <img src={imageUrl} alt={article.title} loading="lazy" />
    </div>
  );
}

export default function EditorialDesk({ articles }) {
  const [lead, ...supporting] = articles;
  if (!lead) return null;

  return (
    <section className="cg-editorial" aria-labelledby="editorial-title">
      <div className="cg-container">
        <header className="cg-editorial__header">
          <h2 id="editorial-title">Latest reviews &amp; news</h2>
          <Link to="/blog" className="cg-text-link">
            <span>View all articles</span>
            <ArrowUpRight aria-hidden="true" />
          </Link>
        </header>

        <div className="cg-editorial__layout">
          <article className="cg-article-lead">
            <Link to={`/blog/${lead.slug}`} className="cg-article-lead__image-link">
              <ArticleImage article={lead} />
            </Link>
            <div className="cg-article-lead__body">
              <span className="cg-article-category">{getCategory(lead)}</span>
              <h3><Link to={`/blog/${lead.slug}`}>{lead.title}</Link></h3>
              {lead.excerpt && <p>{lead.excerpt}</p>}
              <ArticleMeta article={lead} />
            </div>
          </article>

          {supporting.length > 0 && (
            <div className="cg-editorial__rail">
              {supporting.slice(0, 2).map((article) => (
                <article className="cg-article-row" key={article.id || article.slug}>
                  <ArticleImage article={article} compact />
                  <div className="cg-article-row__body">
                    <span className="cg-article-category">{getCategory(article)}</span>
                    <h3><Link to={`/blog/${article.slug}`}>{article.title}</Link></h3>
                    <ArticleMeta article={article} />
                    <Link to={`/blog/${article.slug}`} className="cg-article-row__link" aria-label={`Read ${article.title}`}>
                      <ChevronRight aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
