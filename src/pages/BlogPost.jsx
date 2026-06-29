import React, { useState, useEffect } from 'react';
import { Link, useParams } from '@/lib/router-adapter';
import { base44 } from '@/api/base44Client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { Calendar, Clock, ArrowLeft, Tag, ChevronRight } from 'lucide-react';
import AuthorBox from '../components/blog/AuthorBox';
import ShareButtons from '../components/blog/ShareButtons';
import { format } from 'date-fns';


export default function BlogPost() {
  const [post, setPost] = useState(null);
  const [categories, setCategories] = useState([]);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slug = window.location.pathname.split('/blog/')[1];
    if (!slug) { setLoading(false); return; }

    Promise.all([
      base44.entities.BlogPost.list('-created_date', 200),
      base44.entities.BlogCategory.list('-created_date', 100),
    ]).then(([posts, cats]) => {
      const found = posts.find(p => p.slug === slug || p.id === slug);
      setPost(found || null);
      setCategories(cats);
      if (found?.categories?.length) {
        const rel = posts.filter(p => p.id !== found.id && p.status === 'published' &&
          p.categories?.some(c => found.categories.includes(c))).slice(0, 3);
        setRelated(rel);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div><Navbar />
      <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
    </div>
  );

  if (!post) return (
    <div><Navbar />
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <Link to="/blog" className="text-blue-600 hover:underline flex items-center gap-2 justify-center"><ArrowLeft className="w-4 h-4" /> Back to Blog</Link>
      </div>
    </div>
  );

  const postCats = (post.categories || []).map(slug => categories.find(c => c.slug === slug)).filter(Boolean);
  const canonicalUrl = `https://developmentwala.org/blog/${post.slug || post.id}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.meta_description || post.excerpt || post.title,
    image: post.featured_image ? [post.featured_image] : undefined,
    datePublished: post.created_date,
    dateModified: post.updated_date || post.created_date,
    author: { '@type': 'Person', name: post.author_name || 'DevelopmentWala Editorial' },
    publisher: {
      '@type': 'Organization',
      name: 'DevelopmentWala.org',
      logo: { '@type': 'ImageObject', url: 'https://developmentwala.org/icon-512.png' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    keywords: post.tags || undefined,
  };

  return (
    <div>
      <SEOHead
        title={post.meta_title || `${post.title} — DevelopmentWala.org Blog`}
        description={post.meta_description || post.excerpt || post.title}
        canonical={canonicalUrl}
        image={post.featured_image || undefined}
        structuredData={articleSchema}
      />
      <Navbar />

      {/* Featured Image — 1200×630 (responsive) */}
      {post.featured_image && (
        <div className="w-full bg-gray-900">
          <img
            src={post.featured_image}
            alt={post.title}
            width={1200}
            height={630}
            loading="eager"
            fetchpriority="high"
            decoding="async"
            className="w-full h-auto max-h-[460px] object-cover aspect-[1200/630]"
          />
        </div>
      )}


      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/blog" className="hover:text-blue-600">Blog</Link>
          {postCats[0] && (
            <>
              <ChevronRight className="w-4 h-4" />
              <Link to={`/blog/category/${postCats[0].slug}`} className="hover:text-blue-600">{postCats[0].name}</Link>
            </>
          )}
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate max-w-xs">{post.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <article className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {postCats.map(cat => (
                  <Link key={cat.slug} to={`/blog/category/${cat.slug}`}
                    className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium hover:bg-blue-100 transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
              {post.excerpt && <p className="text-lg text-gray-500 leading-relaxed mb-5">{post.excerpt}</p>}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-400 border-t border-b border-gray-100 py-4">
                {post.author_name && <span className="font-medium text-gray-600">By {post.author_name}</span>}
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{post.created_date ? format(new Date(post.created_date), 'dd MMM yyyy') : ''}</span>
                {post.read_time && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.read_time} min read</span>}
              </div>
            </div>

            {/* Content */}
            <div
              className="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-a:text-blue-600 prose-img:rounded-xl"
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
            />

            {/* Tags */}
            {post.tags && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {post.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <AuthorBox />

            <div className="mt-8">
              <Link to="/blog" className="flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </Link>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            {related.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Related Posts</h3>
                <div className="space-y-4">
                  {related.map(r => (
                    <Link key={r.id} to={`/blog/${r.slug || r.id}`} className="block group">
                      {r.featured_image && (
                        <img src={r.featured_image} alt={r.title} className="w-full h-28 object-cover rounded-xl mb-2" />
                      )}
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 leading-snug line-clamp-2">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{r.created_date ? format(new Date(r.created_date), 'dd MMM yyyy') : ''}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {categories.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <Link key={cat.slug} to={`/blog/category/${cat.slug}`}
                      className="flex items-center justify-between text-sm text-gray-600 hover:text-blue-600 py-1 border-b border-gray-50 last:border-0">
                      <span>{cat.name}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}