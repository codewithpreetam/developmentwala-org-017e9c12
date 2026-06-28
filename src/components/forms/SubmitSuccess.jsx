import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';

export default function SubmitSuccess({ type = 'Listing', published = false }) {
  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{published ? `${type} Published!` : `${type} Submitted!`}</h1>
        <p className="text-gray-500 leading-relaxed">
          {published
            ? 'Your listing is live on DevelopmentWala.org.'
            : 'Your listing has been submitted for review. Our team will publish it within 24–48 hours. Thank you!'}
        </p>
      </div>
      <Footer />
    </div>
  );
}