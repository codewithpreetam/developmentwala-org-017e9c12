import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { Calendar, Clock, Search, Tag, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 9;

  useEffect(() => {
    Promise.all([
      base44.entities.BlogPost.filter({ status: 'published' }, '-created_date', 200),
      base44.entities.BlogCategory.list('-created_date', 100),
    ]).then(([p, c]) => {
      setPosts(p);
      setCategories(c);
      setLoading(false);
    });
  }, []);

  const filtered = posts.filter(p => {
    const matchCat = !activeCategory || (p.categories || []).includes(activeCategory);
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.tags || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleCat = (slug) => { setActiveCategory(slug === activeCategory ? '' : slug); setPage(1); };

  const getCatName = (slug) => categories.find(c => c.slug === slug)?.name || slug;

  return (
    <div>
      <SEOHead title="Blog — DevelopmentWala.org" description="Insights, tips, and resources for social sector professionals." />
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">DevelopmentWala.org Blog</h1>
          <p className="text-blue-100 text-lg mb-8">Insights, guides & resources for social sector professionals</p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text" value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Blog</span>
          {activeCategory && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium capitalize">{getCatName(activeCategory)}</span>
            </>
          )}
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => handleCat('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${!activeCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
              All Posts
            </button>
            {categories.map(cat => (
              <button key={cat.slug} onClick={() => handleCat(cat.slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${activeCategory === cat.slug ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No posts found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {paginated.map(post => (
                <BlogCard key={post.id} post={post} categories={categories} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === n ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-40 hover:bg-gray-50">
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

function BlogCard({ post, categories }) {
  const postCats = (post.categories || []).map(slug => categories.find(c => c.slug === slug)).filter(Boolean);
  return (
    <Link to={`/blog/${post.slug || post.id}`} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col">
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
        <div className="flex flex-wrap gap-1.5 mb-3">
          {postCats.slice(0, 2).map(cat => (
            <span key={cat.slug} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">{cat.name}</span>
          ))}
        </div>
        <h2 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h2>
        {post.excerpt && <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{post.excerpt}</p>}
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{post.created_date ? format(new Date(post.created_date), 'dd MMM yyyy') : ''}</span>
          {post.read_time && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.read_time} min read</span>}
        </div>
      </div>
    </Link>
  );
}