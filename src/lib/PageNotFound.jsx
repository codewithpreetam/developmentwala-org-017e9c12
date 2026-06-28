import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SEOHead from '@/components/shared/SEOHead';
import { SITE_NAME } from '@/lib/brand';

export default function PageNotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <SEOHead title={`Page Not Found — ${SITE_NAME}`} description="The page you are looking for could not be found." />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <p className="text-7xl font-light text-gray-300 mb-2">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 text-sm mb-8">
            We couldn&apos;t find <span className="font-medium text-gray-700">{location.pathname}</span> on {SITE_NAME}.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="inline-flex h-11 items-center justify-center gap-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm">
              <Home className="w-4 h-4" /> Go home
            </Link>
            <Link to={createPageUrl('Jobs')} className="inline-flex h-11 items-center justify-center gap-2 px-6 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm">
              <Search className="w-4 h-4" /> Browse jobs
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
