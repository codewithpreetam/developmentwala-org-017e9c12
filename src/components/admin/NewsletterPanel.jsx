import React, { useEffect, useState } from 'react';
import { Mail, Users, TrendingUp, MailOpen, MousePointerClick, RefreshCw, AlertCircle, CheckCircle2, Send, ExternalLink } from 'lucide-react';
import { fetchNewsletterStats } from '@/lib/mailchimp.functions';

const SITE = 'https://developmentwala.org';

export default function NewsletterPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchNewsletterStats();
      setStats(res);
      setLastSync(new Date());
    } catch (e) {
      setError(e?.message || 'Failed to load Mailchimp stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const pct = (n) => `${(Number(n || 0) * 100).toFixed(1)}%`;
  const fmt = (d) => d ? new Date(d).toLocaleString() : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2"><Mail className="w-5 h-5 text-indigo-600" /> Newsletter Management</h2>
          <p className="text-sm text-gray-500 mt-1">Mailchimp audience &amp; weekly campaign performance.</p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {stats && stats.configured === false && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800">
          Mailchimp is not configured yet. Set <code>MAILCHIMP_API_KEY</code>, <code>MAILCHIMP_SERVER_PREFIX</code>, and <code>MAILCHIMP_LIST_ID</code> in your project secrets.
        </div>
      )}

      {stats && stats.configured && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Subscribers" value={stats.memberCount} icon={Users} color="#4F46E5" />
            <StatCard label="New This Week" value={`+${stats.weeklyGrowth}`} icon={TrendingUp} color="#10b981" />
            <StatCard label="Avg Open Rate" value={pct(stats.avgOpenRate)} icon={MailOpen} color="#0ea5e9" />
            <StatCard label="Avg Click Rate" value={pct(stats.avgClickRate)} icon={MousePointerClick} color="#f59e0b" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Send className="w-4 h-4 text-indigo-600" /> Sync Status</h3>
              <ul className="text-sm space-y-3">
                <li className="flex items-center justify-between"><span className="text-gray-500">Audience</span><span className="font-medium text-gray-900">{stats.listName}</span></li>
                <li className="flex items-center justify-between"><span className="text-gray-500">Status</span><span className="inline-flex items-center gap-1 text-green-600 font-medium"><CheckCircle2 className="w-4 h-4" /> Connected</span></li>
                <li className="flex items-center justify-between"><span className="text-gray-500">Last synced</span><span className="font-medium text-gray-900">{fmt(lastSync)}</span></li>
                <li className="flex items-center justify-between"><span className="text-gray-500">Last subscribe</span><span className="font-medium text-gray-900">{fmt(stats.lastSubscribeAt)}</span></li>
                <li className="flex items-center justify-between"><span className="text-gray-500">Unsubscribed</span><span className="font-medium text-gray-900">{stats.unsubscribeCount}</span></li>
                <li className="flex items-center justify-between"><span className="text-gray-500">Cleaned</span><span className="font-medium text-gray-900">{stats.cleanedCount}</span></li>
                <li className="flex items-center justify-between"><span className="text-gray-500">Weekly campaigns sent</span><span className="font-medium text-gray-900">{stats.totalCampaignsSent}</span></li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Last Newsletter</h3>
              {stats.lastCampaign ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-gray-500">Title</div>
                    <div className="font-medium text-gray-900">{stats.lastCampaign.name}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Mini label="Sent" value={stats.lastCampaign.emailsSent} />
                    <Mini label="Opens" value={pct(stats.lastCampaign.openRate)} />
                    <Mini label="Clicks" value={pct(stats.lastCampaign.clickRate)} />
                  </div>
                  <div className="text-xs text-gray-400">Sent {fmt(stats.lastCampaign.sentAt)}</div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No campaigns have been sent yet. Set up an RSS-driven campaign in Mailchimp pointing to the feed below to start sending the weekly newsletter automatically.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">Weekly RSS Feed</h3>
            <p className="text-sm text-gray-500 mb-4">Configure your Mailchimp <strong>RSS Campaign</strong> to use this URL. New jobs, internships, fellowships, scholarships, grants, events and articles published in the last 30 days are automatically included.</p>
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <code className="flex-1 text-sm text-gray-800 break-all">{SITE}/api/public/rss.xml</code>
              <a href={`${SITE}/api/public/rss.xml`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-semibold">
                Open <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <ol className="mt-4 text-sm text-gray-600 space-y-1 list-decimal pl-5">
              <li>In Mailchimp, create a Campaign → <em>Email</em> → <em>Automated</em> → <em>Share blog updates</em>.</li>
              <li>Paste the RSS URL above. Set send schedule to <strong>Weekly, Monday 10:00 AM</strong>.</li>
              <li>Choose audience: <strong>{stats.listName}</strong> with tag <code>Newsletter</code>.</li>
              <li>Pick the DevelopmentWala.org branded template and start sending.</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function Mini({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}
