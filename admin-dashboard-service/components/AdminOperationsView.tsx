import React, { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileClock,
  Filter,
  Gift,
  Landmark,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  TicketCheck,
  TrendingUp,
  UsersRound,
  X,
} from 'lucide-react';
import { useLanguage } from '../i18n';

export type AdminOperationId = 'reports' | 'refunds' | 'promotions' | 'organizers' | 'checkin' | 'audit' | 'settings';

interface AdminOperationsViewProps {
  feature: AdminOperationId;
}

const featureMeta: Record<AdminOperationId, { km: string; en: string; icon: React.ElementType }> = {
  reports: { km: 'របាយការណ៍ និងវិភាគទិន្នន័យ', en: 'Reports & Analytics', icon: BarChart3 },
  refunds: { km: 'គ្រប់គ្រងការសងប្រាក់', en: 'Refund Management', icon: RefreshCw },
  promotions: { km: 'ប្រូម៉ូសិន និងកូដបញ្ចុះតម្លៃ', en: 'Promotions & Discount Codes', icon: Gift },
  organizers: { km: 'គ្រប់គ្រងអ្នករៀបចំកម្មវិធី', en: 'Organizer Management', icon: UsersRound },
  checkin: { km: 'Check-in និងផ្ទៀងផ្ទាត់សំបុត្រ', en: 'Check-in / Ticket Validation', icon: TicketCheck },
  audit: { km: 'កំណត់ត្រាសកម្មភាព', en: 'Audit Logs', icon: FileClock },
  settings: { km: 'ការកំណត់ប្រព័ន្ធ', en: 'System Settings', icon: Settings2 },
};

const refundsSeed = [
  { id: 'RF-1048', order: 'ORD-2026-1048', customer: 'Dara Sok', amount: 80, reason: 'Duplicate purchase', status: 'PENDING' },
  { id: 'RF-1042', order: 'ORD-2026-1042', customer: 'Sreymom Chan', amount: 45, reason: 'Event rescheduled', status: 'APPROVED' },
  { id: 'RF-1031', order: 'ORD-2026-1031', customer: 'Vannak Ly', amount: 25, reason: 'Customer request', status: 'PAID' },
];

const organizers = [
  { name: 'Phnom Penh Events Co.', contact: 'admin@pp-events.com', events: 12, sales: '$18,420', status: 'VERIFIED' },
  { name: 'Khmer Arts Collective', contact: 'hello@khmerarts.org', events: 8, sales: '$9,870', status: 'VERIFIED' },
  { name: 'Southeast Sports Group', contact: 'ops@sesports.com', events: 3, sales: '$4,250', status: 'PENDING' },
];

const auditRows = [
  { time: 'Today, 10:42', actor: 'admin', action: 'Approved refund RF-1042', scope: 'Refunds', tone: 'text-emerald-600' },
  { time: 'Today, 09:18', actor: 'organizer_sreymom', action: 'Published “Khmer Cultural Concert”', scope: 'Events', tone: 'text-indigo-600' },
  { time: 'Yesterday, 16:05', actor: 'admin', action: 'Updated payment settings', scope: 'Settings', tone: 'text-amber-600' },
  { time: 'Yesterday, 13:27', actor: 'buyer_channa', action: 'Checked in ticket TK-8831', scope: 'Check-in', tone: 'text-cyan-600' },
];

const toneClasses: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  amber: 'bg-amber-50 text-amber-600',
  cyan: 'bg-cyan-50 text-cyan-600',
};

const StatCard: React.FC<{ label: string; value: string; detail: string; icon: React.ElementType; tone?: string }> = ({ label, value, detail, icon: Icon, tone = 'indigo' }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-400">{detail}</p></div>
      <div className={`w-9 h-9 rounded-xl ${toneClasses[tone] || toneClasses.indigo} flex items-center justify-center`}><Icon className="w-4 h-4" /></div>
    </div>
  </div>
);

export const AdminOperationsView: React.FC<AdminOperationsViewProps> = ({ feature }) => {
  const { isKhmer } = useLanguage();
  const meta = featureMeta[feature];
  const [refunds, setRefunds] = useState(refundsSeed);
  const [refundFilter, setRefundFilter] = useState('ALL');
  const [promotionCode, setPromotionCode] = useState('WELCOME10');
  const [promotionDiscount, setPromotionDiscount] = useState('10');
  const [promotionSaved, setPromotionSaved] = useState(false);
  const [checkinCode, setCheckinCode] = useState('');
  const [checkinResult, setCheckinResult] = useState<'idle' | 'valid' | 'used' | 'invalid'>('idle');
  const [auditSearch, setAuditSearch] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  const filteredRefunds = useMemo(() => refunds.filter((refund) => refundFilter === 'ALL' || refund.status === refundFilter), [refunds, refundFilter]);
  const filteredAudit = useMemo(() => auditRows.filter((row) => `${row.actor} ${row.action} ${row.scope}`.toLowerCase().includes(auditSearch.toLowerCase())), [auditSearch]);
  const text = (km: string, en: string) => (isKhmer ? km : en);

  const approveRefund = (id: string) => setRefunds((rows) => rows.map((row) => row.id === id ? { ...row, status: 'APPROVED' } : row));
  const markRefundPaid = (id: string) => setRefunds((rows) => rows.map((row) => row.id === id ? { ...row, status: 'PAID' } : row));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600"><meta.icon className="w-4 h-4" /> Admin operations</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{isKhmer ? meta.km : meta.en}</h2>
          <p className="mt-1 text-sm text-slate-500">{text('គ្រប់គ្រងប្រតិបត្តិការអាជីវកម្មពីកន្លែងតែមួយ', 'Manage business operations from one clear workspace')}</p>
        </div>
        <div className="flex items-center gap-2"><span className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" />{text('ទិន្នន័យបានធ្វើបច្ចុប្បន្នភាព', 'Data up to date')}</span><button className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50" title={text('ធ្វើបច្ចុប្បន្នភាព', 'Refresh')}><RefreshCw className="w-4 h-4" /></button></div>
      </div>

      {feature === 'reports' && <>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"><StatCard label={text('ចំណូលសរុប', 'Total revenue')} value="$32,540" detail={text('កើន 18.4% ពីខែមុន', '18.4% from last month')} icon={TrendingUp} tone="emerald" /><StatCard label={text('ការបញ្ជាទិញ', 'Completed orders')} value="486" detail={text('ការបញ្ជាទិញជោគជ័យ', 'Successful orders')} icon={ClipboardCheck} tone="indigo" /><StatCard label={text('សំបុត្រលក់បាន', 'Tickets sold')} value="1,248" detail={text('ក្នុងកម្មវិធី 24', 'Across 24 events')} icon={TicketCheck} tone="violet" /><StatCard label={text('តម្លៃបញ្ជាទិញជាមធ្យម', 'Average order value')} value="$67.00" detail={text('ក្នុងមួយការបញ្ជាទិញ', 'Per completed order')} icon={BarChart3} tone="amber" /></div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5"><div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5"><div className="flex items-center justify-between mb-5"><div><h3 className="font-bold text-slate-900">{text('និន្នាការការលក់ និងចំណូល', 'Sales and revenue trend')}</h3><p className="text-xs text-slate-500 mt-1">{text('សង្ខេបប្រតិបត្តិការរយៈពេល 7 ថ្ងៃចុងក្រោយ', 'Seven-day performance summary')}</p></div><button className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center gap-2"><Download className="w-3.5 h-3.5" />{text('នាំចេញរបាយការណ៍', 'Export report')}</button></div><div className="h-48 flex items-end gap-3 sm:gap-5 border-b border-slate-100 px-2">{[42, 60, 48, 78, 66, 88, 96].map((height, index) => <div key={index} className="flex-1 h-full flex flex-col justify-end gap-2"><div className="bg-gradient-to-t from-indigo-600 to-violet-400 rounded-t-lg min-h-3" style={{ height: `${height}%` }} /><span className="text-[10px] text-center text-slate-400">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</span></div>)}</div></div><div className="bg-slate-900 rounded-2xl p-5 text-white"><h3 className="font-bold">{text('របាយការណ៍រហ័ស', 'Quick reports')}</h3><p className="text-xs text-slate-400 mt-1">{text('ជ្រើសរើសរបាយការណ៍សម្រាប់ទាញយក', 'Choose a report to download')}</p><div className="mt-5 space-y-2">{['Sales by event', 'Payment reconciliation', 'Ticket inventory', 'Customer activity'].map((report) => <button key={report} className="w-full px-3 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-left text-xs flex items-center justify-between"><span>{report}</span><Download className="w-3.5 h-3.5 text-indigo-300" /></button>)}</div></div></div>
      </>}

      {feature === 'refunds' && <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><StatCard label={text('កំពុងរង់ចាំ', 'Pending review')} value="12" detail={text('ត្រូវការពិនិត្យ', 'Needs review')} icon={RefreshCw} tone="amber" /><StatCard label={text('បានអនុម័ត', 'Approved')} value="$2,840" detail={text('រង់ចាំបង់ជូន', 'Awaiting payout')} icon={CheckCircle2} tone="indigo" /><StatCard label={text('បានសងប្រាក់', 'Refunded')} value="$8,920" detail={text('ខែនេះ', 'This month')} icon={DollarIcon} tone="emerald" /></div><div className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between"><div><h3 className="font-bold text-slate-900">{text('សំណើសងប្រាក់', 'Refund requests')}</h3><p className="text-xs text-slate-500 mt-1">{text('ពិនិត្យ និងអនុម័តការសងប្រាក់តាម Order', 'Review and approve refunds by order')}</p></div><div className="flex gap-2">{['ALL', 'PENDING', 'APPROVED', 'PAID'].map((status) => <button key={status} onClick={() => setRefundFilter(status)} className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${refundFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{status}</button>)}</div></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500 uppercase"><tr><th className="px-4 py-3">Request</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRefunds.map((refund) => <tr key={refund.id}><td className="px-4 py-3"><div className="font-bold text-slate-900">{refund.id}</div><div className="text-[10px] text-slate-400">{refund.order}</div></td><td className="px-4 py-3 font-medium">{refund.customer}</td><td className="px-4 py-3 text-slate-500">{refund.reason}</td><td className="px-4 py-3 font-bold">${refund.amount.toFixed(2)}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${refund.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : refund.status === 'APPROVED' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>{refund.status}</span></td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">{refund.status === 'PENDING' && <button onClick={() => approveRefund(refund.id)} className="px-2 py-1 rounded bg-indigo-600 text-white text-[10px] font-semibold">{text('អនុម័ត', 'Approve')}</button>}{refund.status === 'APPROVED' && <button onClick={() => markRefundPaid(refund.id)} className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-semibold">{text('សងប្រាក់', 'Mark paid')}</button>}</div></td></tr>)}</tbody></table></div></div></div>}

      {feature === 'promotions' && <div className="grid grid-cols-1 xl:grid-cols-3 gap-5"><div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5"><div className="flex items-center justify-between"><div><h3 className="font-bold text-slate-900">{text('កូដបញ្ចុះតម្លៃសកម្ម', 'Active discount codes')}</h3><p className="text-xs text-slate-500 mt-1">{text('បង្កើត និងគ្រប់គ្រងប្រូម៉ូសិន', 'Create and manage promotions')}</p></div><button className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2"><Plus className="w-3.5 h-3.5" />{text('បង្កើតកូដថ្មី', 'New code')}</button></div><div className="mt-5 space-y-3">{[['WELCOME10', '10%', 'All events', '124 uses'], ['KHMERFEST', '$5', 'Khmer Cultural Concert', '68 uses'], ['VIP2026', '15%', 'VIP tickets only', '31 uses']].map(([code, discount, scope, uses]) => <div key={code} className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><div className="flex items-center gap-2"><span className="font-mono font-bold text-indigo-700">{code}</span><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">ACTIVE</span></div><p className="text-xs text-slate-500 mt-1">{discount} off · {scope} · {uses}</p></div><button className="text-xs font-semibold text-slate-500 hover:text-rose-600">{text('បិទកូដ', 'Deactivate')}</button></div>)}</div></div><div className="bg-slate-900 rounded-2xl p-5 text-white"><h3 className="font-bold">{text('បង្កើតប្រូម៉ូសិនរហ័ស', 'Quick promotion')}</h3><div className="mt-4 space-y-3"><label className="block text-xs text-slate-300">{text('កូដ', 'Code')}<input value={promotionCode} onChange={(e) => setPromotionCode(e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg bg-slate-800 border-slate-700 px-3 py-2 text-sm text-white" /></label><label className="block text-xs text-slate-300">{text('បញ្ចុះតម្លៃ (%)', 'Discount (%)')}<input value={promotionDiscount} onChange={(e) => setPromotionDiscount(e.target.value)} className="mt-1 w-full rounded-lg bg-slate-800 border-slate-700 px-3 py-2 text-sm text-white" /></label><button onClick={() => setPromotionSaved(true)} className="w-full mt-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 py-2.5 text-xs font-bold">{promotionSaved ? text('បានរក្សាទុក ✓', 'Saved ✓') : text('រក្សាទុកប្រូម៉ូសិន', 'Save promotion')}</button></div></div></div>}

      {feature === 'organizers' && <div className="space-y-4"><div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><StatCard label={text('អ្នករៀបចំសកម្ម', 'Active organizers')} value="18" detail={text('អ្នករៀបចំបានផ្ទៀងផ្ទាត់', 'Verified organizers')} icon={UsersRound} tone="indigo" /><StatCard label={text('កម្មវិធីសរុប', 'Total events')} value="42" detail={text('ក្នុងប្រព័ន្ធ', 'On the platform')} icon={Landmark} tone="violet" /><StatCard label={text('កំពុងពិនិត្យ', 'Pending review')} value="3" detail={text('ត្រូវការអនុម័ត', 'Needs approval')} icon={Activity} tone="amber" /></div><div className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><div className="p-4 border-b border-slate-100 flex items-center justify-between"><div><h3 className="font-bold">{text('បញ្ជីអ្នករៀបចំកម្មវិធី', 'Organizer directory')}</h3><p className="text-xs text-slate-500 mt-1">{text('គ្រប់គ្រងអ្នករៀបចំ និងកម្មវិធីរបស់ពួកគេ', 'Manage organizers and their events')}</p></div><button className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold flex items-center gap-2"><Plus className="w-3.5 h-3.5" />{text('បន្ថែមអ្នករៀបចំ', 'Add organizer')}</button></div><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 text-slate-500 uppercase"><tr><th className="px-4 py-3">Organizer</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Events</th><th className="px-4 py-3">Sales</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{organizers.map((organizer) => <tr key={organizer.name}><td className="px-4 py-3 font-bold">{organizer.name}</td><td className="px-4 py-3 text-slate-500">{organizer.contact}</td><td className="px-4 py-3">{organizer.events}</td><td className="px-4 py-3 font-semibold">{organizer.sales}</td><td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${organizer.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{organizer.status}</span></td><td className="px-4 py-3 text-right"><button className="text-indigo-600 font-semibold">{text('មើលលម្អិត', 'View details')}</button></td></tr>)}</tbody></table></div></div></div>}

      {feature === 'checkin' && <div className="grid grid-cols-1 xl:grid-cols-3 gap-5"><div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-5"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center"><TicketCheck className="w-5 h-5" /></div><div><h3 className="font-bold text-slate-900">{text('ផ្ទៀងផ្ទាត់សំបុត្រចូលកម្មវិធី', 'Validate event ticket')}</h3><p className="text-xs text-slate-500 mt-1">{text('ស្វែងរកតាមលេខសំបុត្រ ឬ Scan QR code', 'Search by ticket code or scan a QR code')}</p></div></div><div className="mt-6 flex flex-col sm:flex-row gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" /><input value={checkinCode} onChange={(e) => { setCheckinCode(e.target.value); setCheckinResult('idle'); }} placeholder={text('បញ្ចូលលេខសំបុត្រ ឧ. TK-8831', 'Enter ticket code, e.g. TK-8831')} className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm" /></div><button onClick={() => setCheckinResult(checkinCode.toUpperCase() === 'TK-8831' ? 'valid' : checkinCode ? 'invalid' : 'idle')} className="px-5 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-semibold">{text('ផ្ទៀងផ្ទាត់', 'Validate')}</button></div>{checkinResult !== 'idle' && <div className={`mt-4 p-4 rounded-xl border flex items-start gap-3 ${checkinResult === 'valid' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>{checkinResult === 'valid' ? <CheckCircle2 className="w-5 h-5" /> : <X className="w-5 h-5" />}<div><p className="font-bold">{checkinResult === 'valid' ? text('សំបុត្រត្រឹមត្រូវ', 'Valid ticket') : text('រកមិនឃើញសំបុត្រ ឬសំបុត្រមិនត្រឹមត្រូវ', 'Ticket not found or invalid')}</p><p className="text-xs mt-1">{checkinResult === 'valid' ? text('អនុញ្ញាតឲ្យចូលកម្មវិធី Khmer Cultural Concert · Seat A-12', 'Admit to Khmer Cultural Concert · Seat A-12') : text('សូមពិនិត្យលេខសំបុត្រ ហើយសាកល្បងម្តងទៀត', 'Check the ticket code and try again')}</p></div></div>}</div><div className="space-y-4"><StatCard label={text('បាន Check-in ថ្ងៃនេះ', 'Checked in today')} value="284" detail={text('ពីសំបុត្រ 312', 'Of 312 tickets')} icon={ClipboardCheck} tone="cyan" /><div className="bg-slate-900 text-white rounded-2xl p-5"><h3 className="font-bold">{text('សកម្មភាពរហ័ស', 'Quick actions')}</h3><div className="mt-4 space-y-2"><button className="w-full rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-left text-xs">{text('បើកម៉ាស៊ីនស្កេន QR', 'Open QR scanner')}</button><button className="w-full rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-left text-xs">{text('ទាញយកបញ្ជី Check-in', 'Download check-in list')}</button></div></div></div></div>}

      {feature === 'audit' && <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 justify-between"><div><h3 className="font-bold">{text('កំណត់ត្រាសកម្មភាពរបស់ប្រព័ន្ធ', 'System activity log')}</h3><p className="text-xs text-slate-500 mt-1">{text('តាមដានសកម្មភាពសំខាន់ៗរបស់ Admin និង User', 'Track important admin and user actions')}</p></div><div className="relative"><Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" /><input value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} placeholder={text('ស្វែងរកសកម្មភាព...', 'Search activity...')} className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-xs" /></div></div><div className="divide-y divide-slate-100">{filteredAudit.map((row) => <div key={`${row.time}-${row.actor}`} className="p-4 flex items-start gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0"><Activity className={`w-4 h-4 ${row.tone}`} /></div><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-sm text-slate-800">{row.action}</span><span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-semibold text-slate-500">{row.scope}</span></div><p className="text-xs text-slate-500 mt-1">{row.actor} · {row.time}</p></div><button className="text-slate-400 hover:text-indigo-600"><ChevronIcon /></button></div>)}</div></div>}

      {feature === 'settings' && <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"><div className="lg:col-span-2 space-y-4"><div className="bg-white border border-slate-200 rounded-2xl p-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Settings2 className="w-5 h-5" /></div><div><h3 className="font-bold">{text('ការកំណត់ទូទៅ', 'General settings')}</h3><p className="text-xs text-slate-500 mt-1">{text('កំណត់ព័ត៌មានមូលដ្ឋានរបស់ប្រព័ន្ធ', 'Configure the basic platform information')}</p></div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5"><label className="text-xs font-semibold text-slate-600">{text('ឈ្មោះអាជីវកម្ម', 'Business name')}<input defaultValue="TicketManagement Platform" className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-normal" /></label><label className="text-xs font-semibold text-slate-600">{text('រូបិយប័ណ្ណ', 'Currency')}<select defaultValue="USD" className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-normal"><option>USD</option><option>KHR</option></select></label><label className="text-xs font-semibold text-slate-600">{text('តំបន់ពេលវេលា', 'Timezone')}<select defaultValue="Asia/Phnom_Penh" className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-normal"><option value="Asia/Phnom_Penh">Asia/Phnom Penh (UTC+7)</option><option value="UTC">UTC</option></select></label><label className="text-xs font-semibold text-slate-600">{text('ភាសាលំនាំដើម', 'Default language')}<select defaultValue="km" className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-normal"><option value="km">ខ្មែរ</option><option value="en">English</option></select></label></div></div><div className="bg-white border border-slate-200 rounded-2xl p-5"><h3 className="font-bold">{text('ការជូនដំណឹង និងសុវត្ថិភាព', 'Notifications and security')}</h3><div className="mt-4 space-y-3">{[['Email notifications', 'Send order and refund updates to admins'], ['Two-factor authentication', 'Require an extra verification step for admins'], ['Auto-approve trusted organizers', 'Skip manual review for verified partners']].map(([label, detail], index) => <label key={label} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 border border-slate-100"><span><span className="block text-sm font-semibold text-slate-800">{label}</span><span className="block text-xs text-slate-500 mt-0.5">{detail}</span></span><input type="checkbox" defaultChecked={index === 0} className="w-4 h-4 accent-indigo-600" /></label>)}</div></div></div><div className="bg-slate-900 text-white rounded-2xl p-5 h-fit"><ShieldCheck className="w-6 h-6 text-emerald-400" /><h3 className="mt-4 font-bold">{text('ស្ថានភាពសុវត្ថិភាព', 'Security status')}</h3><p className="text-xs text-slate-400 mt-1">{text('ប្រព័ន្ធរបស់អ្នកមានសុវត្ថិភាព', 'Your platform is secure')}</p><div className="mt-5 space-y-3 text-xs"><div className="flex justify-between"><span className="text-slate-400">JWT secret</span><span className="text-emerald-400">Configured</span></div><div className="flex justify-between"><span className="text-slate-400">Admin sessions</span><span className="text-emerald-400">Protected</span></div><div className="flex justify-between"><span className="text-slate-400">Audit logging</span><span className="text-emerald-400">Enabled</span></div></div><button onClick={() => setSettingsSaved(true)} className="w-full mt-6 rounded-lg bg-indigo-500 hover:bg-indigo-400 py-2.5 text-xs font-bold">{settingsSaved ? text('បានរក្សាទុក ✓', 'Saved ✓') : text('រក្សាទុកការកំណត់', 'Save settings')}</button></div></div>}
    </div>
  );
};

const DollarIcon: React.FC<{ className?: string }> = ({ className }) => <span className={`font-bold ${className || ''}`}>$</span>;
const ChevronIcon: React.FC = () => <span className="text-lg leading-none">›</span>;
void Bell;
void Filter;
