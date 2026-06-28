import React from 'react';
import { Linkedin, Instagram, Youtube, Facebook, ExternalLink, Mail } from 'lucide-react';
import { DEFAULT_LOGO, SITE_NAME } from '@/lib/brand';

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/developmentwalajobboard', icon: Linkedin, color: 'text-blue-600 hover:text-blue-700' },
  { label: 'Instagram', href: 'https://www.instagram.com/developmentwala_official/', icon: Instagram, color: 'text-pink-500 hover:text-pink-600' },
  { label: 'YouTube', href: 'https://www.youtube.com/@DevelopmentWalaofficial', icon: Youtube, color: 'text-red-600 hover:text-red-700' },
  { label: 'Facebook', href: 'https://www.facebook.com/thedevelopmentwala', icon: Facebook, color: 'text-blue-700 hover:text-blue-800' },
];

export default function AuthorBox() {
  return (
    <div className="mt-10 pt-8 border-t border-gray-100">
      <div className="bg-gradient-to-br from-gray-50 to-indigo-50/40 rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-5">
        {/* Logo */}
        <div className="shrink-0 flex sm:block justify-center">
          <img
            src={DEFAULT_LOGO}
            alt={SITE_NAME}
            className="w-20 h-20 object-contain rounded-xl border border-gray-200 bg-white p-2"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">About the Author</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2">DevelopmentWala.org</h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            <strong>DevelopmentWala.org</strong> is a modern platform connecting job seekers and recruiters in the social sector.
            Built for the current generation of professionals, we aim to transform the outdated experience of traditional NGO and
            nonprofit job boards in India through clean design, accessibility, and innovation. Our mission is to make the nonprofit
            ecosystem more efficient by continuously creating better opportunities, improving visibility for organizations, and
            helping passionate professionals discover meaningful careers in the development sector.
          </p>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mb-4">
            <a
              href="https://developmentwala.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Visit Website
            </a>
            <a
              href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7423534923589775360"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <Mail className="w-3.5 h-3.5" /> Newsletter
            </a>
            <a
              href="https://topmate.io/development_wala"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Topmate
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            {socialLinks.map(({ label, href, icon: Icon, color }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                className={`transition-colors ${color}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}