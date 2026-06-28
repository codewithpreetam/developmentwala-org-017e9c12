import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Briefcase, Eye, CheckCircle2, Clock, XCircle, Star } from 'lucide-react';

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#dc2626', '#db2777'];

export default function EmployerAnalytics({ myJobs, applicants }) {
  const stats = useMemo(() => {
    const totalJobs = myJobs.length;
    const published = myJobs.filter(j => j.status === 'published').length;
    const pending = myJobs.filter(j => j.status === 'pending').length;
    const totalApplicants = applicants.length;
    const shortlisted = applicants.filter(a => a.status === 'shortlisted').length;
    const selected = applicants.filter(a => a.status === 'selected').length;
    const rejected = applicants.filter(a => a.status === 'rejected').length;
    const conversionRate = totalApplicants > 0 ? Math.round((selected / totalApplicants) * 100) : 0;

    return { totalJobs, published, pending, totalApplicants, shortlisted, selected, rejected, conversionRate };
  }, [myJobs, applicants]);

  // Applicants per opportunity (top 6)
  const appPerJob = useMemo(() => {
    const counts = {};
    applicants.forEach(a => {
      const job = myJobs.find(j => j.id === a.opportunity_id);
      const title = job?.title || a.opportunity_title || 'Unknown';
      counts[title] = (counts[title] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name: name.length > 22 ? name.substring(0, 22) + '…' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [myJobs, applicants]);

  // Status breakdown pie
  const statusData = useMemo(() => {
    const map = {};
    applicants.forEach(a => { map[a.status] = (map[a.status] || 0) + 1; });
    const labels = { applied: 'Applied', reviewing: 'Reviewing', shortlisted: 'Shortlisted', interview: 'Interview', selected: 'Selected', rejected: 'Rejected' };
    return Object.entries(map).map(([status, value]) => ({ name: labels[status] || status, value }));
  }, [applicants]);

  // Postings by type
  const typeData = useMemo(() => {
    const map = {};
    myJobs.forEach(j => { map[j._type] = (map[j._type] || 0) + 1; });
    const labels = { job: 'Jobs', internship: 'Internships', fellowship: 'Fellowships', scholarship: 'Scholarships', grant: 'Grants', event: 'Events' };
    return Object.entries(map).map(([type, count]) => ({ name: labels[type] || type, count }));
  }, [myJobs]);

  // Monthly postings trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: d.toLocaleString('en-IN', { month: 'short' }), year: d.getFullYear(), month: d.getMonth(), posts: 0, apps: 0 });
    }
    myJobs.forEach(j => {
      const d = new Date(j.created_date);
      const m = months.find(mo => mo.year === d.getFullYear() && mo.month === d.getMonth());
      if (m) m.posts++;
    });
    applicants.forEach(a => {
      const d = new Date(a.created_date);
      const m = months.find(mo => mo.year === d.getFullYear() && mo.month === d.getMonth());
      if (m) m.apps++;
    });
    return months.map(m => ({ name: m.label, Posts: m.posts, Applications: m.apps }));
  }, [myJobs, applicants]);

  const metricCards = [
    { label: 'Total Postings', value: stats.totalJobs, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Pending Review', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Applicants', value: stats.totalApplicants, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Shortlisted', value: stats.shortlisted, icon: Star, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Selected / Hired', value: stats.selected, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Hire Rate', value: `${stats.conversionRate}%`, icon: Eye, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Analytics Overview</h2>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500 font-medium">{m.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.bg}`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Monthly Activity (Last 6 Months)</h3>
          {monthlyTrend.some(m => m.Posts > 0 || m.Applications > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={monthlyTrend}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="Posts" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Applications" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No activity data yet</div>
          )}
          <div className="flex gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-blue-600 inline-block" /> Posts</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-0.5 bg-purple-600 inline-block" /> Applications</span>
          </div>
        </div>

        {/* Applicants by Status Pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Applicant Status Breakdown</h3>
          {statusData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {statusData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {s.name}
                    </span>
                    <span className="font-semibold text-gray-700">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No applicants yet</div>
          )}
        </div>
      </div>

      {/* Applicants per Job + Type breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Job */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Applicants per Opportunity (Top 6)</h3>
          {appPerJob.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={appPerJob} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No applicant data yet</div>
          )}
        </div>

        {/* By Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-4">Postings by Type</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">No postings yet</div>
          )}
        </div>
      </div>
    </div>
  );
}