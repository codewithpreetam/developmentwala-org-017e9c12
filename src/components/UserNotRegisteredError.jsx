import React from 'react';
import { Link } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { AlertTriangle } from 'lucide-react';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import { SITE_NAME } from '@/lib/brand';

export default function UserNotRegisteredError() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 shadow-xl shadow-gray-200/50 text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Account access restricted</h1>
          <p className="text-gray-500 text-sm mb-6">
            Your account does not have permission to use this area of {SITE_NAME}. Please sign in with the correct account or contact our team.
          </p>
          <div className="flex flex-col gap-2">
            <Link to={createPageUrl('SignIn')} className="h-11 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm">
              Sign in
            </Link>
            <Link to={createPageUrl('Contact')} className="text-sm text-gray-500 hover:text-indigo-600">
              Contact support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
