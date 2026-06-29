import React, { useState } from 'react';
import { Linkedin, MessageCircle, Share2, Link as LinkIcon, Check } from 'lucide-react';

/**
 * Social share buttons for blog posts. Falls back gracefully when
 * navigator.share isn't available (desktop browsers).
 */
export default function ShareButtons({ url, title, summary = '' }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' && !url
    ? window.location.href
    : url;

  const enc = encodeURIComponent;
  const waText = `${title}\n\n${shareUrl}`;
  const links = {
    whatsapp: `https://wa.me/?text=${enc(waText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`,
  };

  const handleNativeShare = async () => {
    if (navigator?.share) {
      try {
        await navigator.share({ title, text: summary || title, url: shareUrl });
      } catch {
        /* user cancelled */
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-500 mr-1">Share:</span>
      <a
        href={links.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#25D366] hover:bg-[#1ebe5b] px-3 py-1.5 rounded-full transition-colors"
      >
        <MessageCircle className="w-4 h-4" /> WhatsApp
      </a>
      <a
        href={links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="flex items-center gap-1.5 text-sm font-medium text-white bg-[#0A66C2] hover:bg-[#0850a0] px-3 py-1.5 rounded-full transition-colors"
      >
        <Linkedin className="w-4 h-4" /> LinkedIn
      </a>
      <button
        type="button"
        onClick={handleNativeShare}
        aria-label="Share via device or copy link"
        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
      >
        {copied ? <><Check className="w-4 h-4 text-green-600" /> Copied!</> : <><Share2 className="w-4 h-4" /> Share</>}
      </button>
    </div>
  );
}
