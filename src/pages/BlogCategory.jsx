import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/router-adapter';
import { api } from '@/api/apiClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { Calendar, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function BlogCategory() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    const slug = window.location.pathname.split('/blog/category/')[1];
    Promise.all([
      api.entities.BlogPost.filter({ status: 'published' }, '-created_date', 200),
      api.entities.BlogCategory.list('-created_date', 100),
    ]).then(([allPosts, cats]) => {
      const cat = cats.find(c => c.slug === slug);
      setCategory(cat || { name: slug, slug });
      setPosts(allPosts.filter(p => (p.categories || []).includes(slug)));
      setLoading(false);
    });
  }, []);

  const totalPages = Math.ceil(posts.length / PAGE_SIZE);
  const paginated = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <SEOHead title={`${category?.name || 'Category'} — Blog | DevelopmentWala.org`} description={category?.description || ''} />
      <Navbar />

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="flex items-center gap-2 text-blue-200 hover:text-white text-sm mb-4"><ArrowLeft className="w-4 h-4" /> All Posts</Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{category?.name || 'Category'}</h1>
          {category?.description && <p className="text-blue-100">{category.description}</p>}
          <p className="text-blue-200 text-sm mt-2">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/blog" className="hover:text-blue-600">Blog</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">{category?.name}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No posts in this category yet.</p>
            <Link to="/blog" className="text-blue-600 hover:underline mt-4 inline-block">← Back to Blog</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {paginated.map(post => (
                <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                  {post.featured_image ? (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img src={post.featured_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <span className="text-4xl font-bold text-blue-200">{post.title?.[0]}</span>
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 line-clamp-2">{post.title}</h2>
                    {post.excerpt && <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{post.excerpt}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.created_date ? format(new Date(post.created_date), 'dd MMM yyyy') : ''}</span>
                      {post.read_time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.read_time} min read</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === n ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{n}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}