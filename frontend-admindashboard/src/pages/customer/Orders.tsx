import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Ticket } from 'lucide-react';

export default function CustomerOrders() {
  return <div className="mx-auto max-w-2xl py-12 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#2b3d60] bg-[#1b3158] text-[#8fb3ff]"><Ticket className="h-8 w-8" /></div>
    <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6ea0ff]">My orders</p>
    <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-white">Your orders will appear here.</h1>
    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#9da0a8]">The customer order history screen is waiting for a backend endpoint that filters by the authenticated owner. We will not display the shared order list here because tenant isolation must also protect individual customer ownership.</p>
    <div className="mx-auto mt-6 flex max-w-md items-start gap-3 rounded-xl border border-[#30425f] bg-[#172438] p-4 text-left"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#4ec9b0]" /><p className="text-xs leading-5 text-[#b8c7df]">This is intentional: the frontend never treats a tenant-wide admin list as a personal order history.</p></div>
    <Link to="/events" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#3574f0] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4c83f5]"><ArrowLeft className="h-4 w-4" /> Browse events</Link>
  </div>;
}
