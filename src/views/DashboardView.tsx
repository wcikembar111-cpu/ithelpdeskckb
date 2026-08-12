import React from 'react';
import { Ticket, PageView, User, TicketStatus } from '../types';
import { Layers, MailOpen, Loader2, ArrowRight, History, PieChart as PieIcon, Monitor, Wifi, Phone, Settings, PlusCircle, CheckCircle2, BarChart3, TrendingUp, Calendar } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

interface DashboardViewProps {
  tickets: Ticket[];
  currentUser?: User | null;
  itPhone?: string;
  onNavigate: (page: PageView) => void;
  onOpenTicket: (ticketId: string) => void;
  onViewDetailTicket?: (ticket: Ticket) => void;
  onOpenNewTicket?: () => void;
  onQuickStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tickets,
  currentUser,
  itPhone,
  onNavigate,
  onOpenTicket,
  onViewDetailTicket,
  onOpenNewTicket,
  onQuickStatusChange
}) => {
  const isAdmin = currentUser?.Role === 'Administrator';
  const isIT = currentUser?.Role === 'Petugas IT';
  const canManage = isAdmin || isIT;

  let total = 0, open = 0, prog = 0, pend = 0, closed = 0;
  const categoryCounts: Record<string, number> = {};
  const categoryProgressMap: Record<string, { total: number; closed: number }> = {};

  tickets.forEach((t) => {
    total++;
    if (t.Status === 'Open') open++;
    else if (t.Status === 'On Progress') prog++;
    else if (t.Status === 'Pending Part') pend++;
    else if (t.Status === 'Closed') closed++;

    const cat = t.Kategori || 'Lainnya';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    if (!categoryProgressMap[cat]) {
      categoryProgressMap[cat] = { total: 0, closed: 0 };
    }
    categoryProgressMap[cat].total++;
    if (t.Status === 'Closed') {
      categoryProgressMap[cat].closed++;
    }
  });

  const categoryProgressList = Object.entries(categoryProgressMap).map(
    ([category, { total: catTotal, closed: catClosed }]) => ({
      category,
      total: catTotal,
      closed: catClosed,
      percentage: catTotal > 0 ? Math.round((catClosed / catTotal) * 100) : 0,
    })
  ).sort((a, b) => b.total - a.total);

  const recentTickets = [...tickets].slice(0, 5);

  // SVG Donut Chart Calculation
  const categoriesList = Object.keys(categoryCounts);
  const categoriesData = Object.values(categoryCounts);
  const totalCategoryTickets = categoriesData.reduce((a, b) => a + b, 0) || 1;

  const palette = [
    '#4F46E5', '#F59E0B', '#10B981', '#F43F5E',
    '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'
  ];

  let cumulativePercent = 0;

  function getCoordinatesForPercent(percent: number) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  }

  const slices = categoriesList.map((cat, idx) => {
    const val = categoryCounts[cat];
    const percent = val / totalCategoryTickets;

    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `L 0 0`
    ].join(' ');

    return {
      cat,
      val,
      percent: Math.round(percent * 100),
      color: palette[idx % palette.length],
      pathData
    };
  });

  const resolvedPercent = total > 0 ? Math.round((closed / total) * 100) : 100;

  // Monthly Performance Chart Data Calculation
  const monthNamesIndo = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyMap: Record<string, { monthKey: string; label: string; 'Selesai (Closed)': number; 'Dalam Proses': number; 'Tiket Baru (Open)': number; Total: number }> = {};

  tickets.forEach((t) => {
    const rawDate = t.Tanggal || t.CreatedAt;
    if (!rawDate) return;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return;

    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
    const label = `${monthNamesIndo[monthIdx]} ${year}`;

    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        monthKey: key,
        label,
        'Tiket Baru (Open)': 0,
        'Dalam Proses': 0,
        'Selesai (Closed)': 0,
        Total: 0
      };
    }

    monthlyMap[key].Total++;
    if (t.Status === 'Closed') {
      monthlyMap[key]['Selesai (Closed)']++;
    } else if (t.Status === 'Open') {
      monthlyMap[key]['Tiket Baru (Open)']++;
    } else {
      monthlyMap[key]['Dalam Proses']++;
    }
  });

  // Ensure last 6 months exist in timeline
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
    const label = `${monthNamesIndo[monthIdx]} ${year}`;

    if (!monthlyMap[key]) {
      monthlyMap[key] = {
        monthKey: key,
        label,
        'Tiket Baru (Open)': 0,
        'Dalam Proses': 0,
        'Selesai (Closed)': 0,
        Total: 0
      };
    }
  }

  const monthlyChartData = Object.values(monthlyMap)
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    .slice(-7);

  const busiestMonth = [...monthlyChartData].sort((a, b) => b.Total - a.Total)[0];
  const avgTicketsPerMonth = monthlyChartData.length > 0
    ? Math.round(monthlyChartData.reduce((acc, curr) => acc + curr.Total, 0) / monthlyChartData.length)
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const totalVal = payload.reduce((sum: number, p: any) => sum + Number(p.value || 0), 0);
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-2 min-w-[170px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-extrabold">
            <span className="text-indigo-300">{label}</span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full font-bold">
              {totalVal} Tiket
            </span>
          </div>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={`tooltip-item-${index}`} className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span>{entry.name}</span>
                </span>
                <span className="font-extrabold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fast-in">
      
      {/* Bento Grid Top Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Stat Bento: Total Tickets (Large Hero Indigo Card) */}
        <div className="md:col-span-6 lg:col-span-4 bg-indigo-600 rounded-3xl p-6 text-white flex flex-col justify-between shadow-lg shadow-indigo-200/50 dark:shadow-none min-h-[160px]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 font-medium text-xs tracking-wider uppercase">Total Tiket Request</p>
              <h2 className="text-4xl font-black mt-2">{total}</h2>
            </div>
            <div className="p-3.5 bg-indigo-500/30 rounded-2xl backdrop-blur-xs">
              <Layers className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="mt-4 bg-indigo-500/30 rounded-2xl p-3 flex justify-between items-center text-xs">
            <span className="text-indigo-100 font-medium">Resolusi Tiket Selesai</span>
            <span className="font-extrabold bg-white text-indigo-700 px-2.5 py-0.5 rounded-full">{resolvedPercent}% Selesai</span>
          </div>
        </div>

        {/* Stat Bento: Pending */}
        <div className="md:col-span-6 lg:col-span-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest">Pending</p>
            <MailOpen className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-900 dark:text-rose-200">{open}</span>
            <span className="text-xs text-rose-600 font-semibold">butuh process</span>
          </div>
        </div>

        {/* Stat Bento: In Progress */}
        <div className="md:col-span-6 lg:col-span-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/30 rounded-3xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-widest">In Progress</p>
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-900 dark:text-amber-200">{prog + pend}</span>
            <span className="text-xs text-amber-600 font-semibold">pengerjaan</span>
          </div>
        </div>

        {/* Action Bento: Quick Request / Buat Tiket */}
        <div className="md:col-span-6 lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">Aksi Cepat Request</h3>
            <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase">Fast Ticket</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                if (onOpenNewTicket) onOpenNewTicket();
                else onNavigate('tickets');
              }}
              className="p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-2.5 group cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition text-left"
            >
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-600 group-hover:text-white text-slate-600 dark:text-slate-300 transition shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200 truncate">Hardware</p>
            </button>

            <button
              onClick={() => {
                if (onOpenNewTicket) onOpenNewTicket();
                else onNavigate('tickets');
              }}
              className="p-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center gap-2.5 group cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition text-left"
            >
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-600 group-hover:text-white text-slate-600 dark:text-slate-300 transition shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200 truncate">Network/VPN</p>
            </button>
          </div>

          <button
            onClick={() => {
              if (onOpenNewTicket) onOpenNewTicket();
              else onNavigate('tickets');
            }}
            className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-2.5 rounded-2xl text-xs font-extrabold hover:bg-slate-800 dark:hover:bg-indigo-500 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Tiket Baru</span>
          </button>
        </div>

      </div>

      {/* Monthly IT Performance Bar Chart (Recharts) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Ringkasan Performa IT Bulanan
                <span className="text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200/60">
                  Grafik Batang Recharts
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statistik volume tiket masuk dan status pengerjaan per bulan
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Rata-rata: <strong className="text-slate-900 dark:text-white">{avgTicketsPerMonth}</strong> tiket/bulan</span>
            </div>
            {busiestMonth && (
              <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>Puncak: <strong className="text-amber-950 dark:text-amber-100">{busiestMonth.label} ({busiestMonth.Total})</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Recharts BarChart Container */}
        <div className="w-full h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyChartData}
              margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
              barGap={4}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fontWeight: 700, fill: '#64748B' }}
                axisLine={{ stroke: '#CBD5E1' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: '#64748B' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
              <Legend
                wrapperStyle={{ paddingTop: '12px', fontSize: '11px', fontWeight: 700 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="Selesai (Closed)" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Dalam Proses" fill="#F59E0B" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Tiket Baru (Open)" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Completion Progress Section */}
      <div className="p-6 rounded-3xl bg-white border border-orange-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Progres Penyelesaian per Kategori Request
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik progress bar status tiket yang sudah selesai dikerjakan per kategori
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-extrabold px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200">
            Total Selesai: {closed} dari {total} request ({resolvedPercent}%)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {categoryProgressList.map((cp) => (
            <div key={cp.category} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/80 space-y-2 hover:border-orange-200 transition">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-2 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
                  <span className="truncate">{cp.category}</span>
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                    {cp.closed}/{cp.total}
                  </span>
                  <span className={`font-extrabold text-[11px] px-2.5 py-0.5 rounded-full ${
                    cp.percentage === 100 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : cp.percentage > 0 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {cp.percentage}% Selesai
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden p-0.5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    cp.percentage === 100 
                      ? 'bg-emerald-500' 
                      : cp.percentage > 0 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500' 
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${cp.percentage}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-600 font-medium flex justify-between items-center pt-0.5">
                <span className="text-slate-600 font-semibold">
                  {cp.closed === cp.total && cp.total > 0
                    ? `100% selesai (${cp.closed} dari ${cp.total} request)`
                    : cp.closed === 0
                    ? `0% selesai (${cp.closed} dari ${cp.total} request)`
                    : `baru selesai ${cp.closed} dari ${cp.total} request`}
                </span>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                  {cp.total - cp.closed} belum selesai
                </span>
              </div>
            </div>
          ))}

          {categoryProgressList.length === 0 && (
            <div className="col-span-2 text-center py-6 text-slate-400 text-xs font-medium">
              Belum ada data request per kategori.
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Donut Bento Card */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Distribusi Kategori
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{categoriesList.length} Kategori</span>
            </div>

            {/* SVG Donut Chart */}
            <div className="flex items-center justify-center my-4 relative">
              <svg viewBox="-1.2 -1.2 2.4 2.4" className="w-44 h-44 -rotate-90">
                {slices.map((s, idx) => (
                  <path
                    key={idx}
                    d={s.pathData}
                    fill={s.color}
                    className="hover:opacity-85 transition cursor-pointer"
                  >
                    <title>{`${s.cat}: ${s.val} tiket (${s.percent}%)`}</title>
                  </path>
                ))}
                <circle cx="0" cy="0" r="0.65" className="fill-white dark:fill-slate-900" />
              </svg>
              <div className="absolute text-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 block leading-tight">
                  {total}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Tiket
                </span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            {slices.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-slate-600 dark:text-slate-300 font-medium truncate">
                  {s.cat} ({s.val})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Active Requests Bento Card */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Permintaan Terbaru
              </h3>
              <button
                onClick={() => onNavigate('tickets')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-extrabold text-slate-700 dark:text-slate-300 transition cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-2">E-Job</th>
                    <th className="py-3 px-2">Subjek</th>
                    <th className="py-3 px-2">Prioritas</th>
                    <th className="py-3 px-2">Pemohon</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {recentTickets.map((t) => (
                    <tr
                      key={t.Id}
                      onClick={() => onViewDetailTicket ? onViewDetailTicket(t) : onOpenTicket(t.Id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                    >
                      <td className="py-3.5 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {t.Ejob}
                      </td>
                      <td className="py-3.5 px-2 font-semibold text-slate-800 dark:text-slate-200 max-w-[180px] truncate">
                        {t.Subject}
                      </td>
                      <td className="py-3.5 px-2">
                        <PriorityBadge type={t.TypeTicket} size="sm" />
                      </td>
                      <td className="py-3.5 px-2">
                        <span className="font-bold block text-slate-900 dark:text-slate-100">
                          {t.Nama}
                        </span>
                        <span className="text-slate-400 text-[10px] block">{t.Departement}</span>
                      </td>
                      <td className="py-3.5 px-2">
                        <StatusBadge
                          status={t.Status}
                          canEdit={canManage}
                          onStatusChange={(newStatus) => onQuickStatusChange?.(t.Id, newStatus)}
                          size="sm"
                        />
                      </td>
                    </tr>
                  ))}

                  {recentTickets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Belum ada data request tiket.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bento Row: Hotline & Config */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className={`${isAdmin ? 'md:col-span-5' : 'md:col-span-12'} bg-orange-50/80 border border-orange-200/80 rounded-3xl p-5 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">IT Support Hotline</p>
              <a
                href={`https://wa.me/${String(itPhone || '6281234567890').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-black text-blue-950 hover:text-orange-600 transition flex items-center gap-2"
                title="Hubungi via WhatsApp Hotline IT"
              >
                <span>{itPhone ? `+${itPhone}` : '6281234567890'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">WA Active</span>
              </a>
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {isAdmin && (
          <div className="md:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">Konfigurasi & Master Data</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Kelola Departemen, Kategori, & Hak Akses User Admin</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-extrabold transition cursor-pointer"
            >
              Sistem Config →
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
