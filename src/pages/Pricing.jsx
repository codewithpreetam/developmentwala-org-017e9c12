import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Check, Star, Zap } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: 'Browse and apply to opportunities',
    features: ['Unlimited browsing', 'Apply to listings', 'Save opportunities', 'Email alerts'],
    cta: 'Get Started',
    href: 'SignUp',
    highlight: false,
  },
  {
    name: 'Featured Listing',
    price: '₹4,999',
    period: 'per 30 days',
    description: 'Boost visibility for employers',
    features: ['Homepage featured slot', 'Priority in search', 'Featured badge', 'Analytics dashboard'],
    cta: 'Contact Sales',
    href: 'Contact',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual',
    description: 'NGOs with high-volume hiring',
    features: ['Unlimited postings', 'Dedicated support', 'ATS integration', 'Custom branding'],
    cta: 'Talk to Us',
    href: 'Contact',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title="Pricing — DevelopmentWala" description="Plans for job seekers and employers on DevelopmentWala." />
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Free for candidates. Affordable featured listings for employers in the social sector.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border p-6 flex flex-col ${plan.highlight ? 'border-blue-500 shadow-lg shadow-blue-100 bg-white ring-2 ring-blue-500' : 'border-gray-200 bg-white'}`}>
              {plan.highlight && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit mb-3">
                  <Star className="w-3 h-3" /> Popular
                </span>
              )}
              <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
              <p className="text-3xl font-bold text-gray-900 mt-2">{plan.price}<span className="text-sm font-normal text-gray-400"> / {plan.period}</span></p>
              <p className="text-sm text-gray-500 mt-2 mb-6">{plan.description}</p>
              <ul className="space-y-2 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to={createPageUrl(plan.href)}
                className={`block text-center py-3 rounded-xl font-semibold text-sm ${plan.highlight ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
          <Zap className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">Featured listings for employers</h3>
            <p className="text-sm text-gray-600 mt-1">
              Want to boost visibility for your organisation?{' '}
              <Link to={createPageUrl('Contact')} className="text-indigo-600 font-medium hover:underline">Contact our team</Link>
              {' '}to learn about featured placement and enterprise plans.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
