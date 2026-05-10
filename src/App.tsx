/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function App() {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-slate-100 font-sans text-slate-900">
      {/* Sidebar */}
      <div className="w-60 bg-slate-950 text-slate-400 flex flex-col border-r border-slate-800">
        <div className="p-6 font-bold text-white border-b border-slate-800">VoucherEngine v1.2</div>
        <div className="flex-1 p-4 space-y-6">
          <div className="text-[10px] text-slate-500 font-bold uppercase">Infrastructure</div>
          <div className="space-y-2">
            <div className="flex justify-between text-[11px]"><span>Supabase DB</span><span className="text-emerald-400">ONLINE</span></div>
            <div className="flex justify-between text-[11px]"><span>PayPal Webhook</span><span className="text-emerald-400">LISTENING</span></div>
            <div className="flex justify-between text-[11px]"><span>SMTP Relay</span><span className="text-emerald-400">ACTIVE</span></div>
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase">GDPR Status</div>
          <div className="p-3 bg-slate-900 rounded text-[10px] text-slate-300 leading-relaxed">Data encryption active. Supabase PII fields obfuscated in logs. Automatic 30-day purge enabled.</div>
        </div>
        <div className="p-4 border-t border-slate-800 text-[10px]">System Uptime: 412h 12m</div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 flex flex-col gap-5 overflow-auto">
        {/* Stats */}
        <div className="flex bg-white p-3 rounded-sm border border-slate-200 shadow-sm">
          <div className="flex-1 p-3 flex flex-col border-r border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-500">Capture Rate</span>
            <span className="text-xl font-bold">99.8%</span>
          </div>
          <div className="flex-1 p-3 flex flex-col border-r border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-500">Vouchers Issued</span>
            <span className="text-xl font-bold">14,208</span>
          </div>
          <div className="flex-1 p-3 flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-500">Active Syncs</span>
            <span className="text-xl font-bold">1,042</span>
          </div>
        </div>
        
        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-5 flex-1 overflow-hidden">
          {/* Ingestion Table */}
          <div className="col-span-2 bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col">
            <div className="p-3 border-b bg-slate-50 flex justify-between items-center text-[11px] font-bold text-slate-700 uppercase">
              Live Webhook Ingestion Log
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full border-collapse text-[11px]">
                <thead className="bg-slate-50 text-slate-500 uppercase">
                  <tr>
                    <th className="p-2 text-left">Event ID</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                 <tr>
                    <td className="p-2 font-mono">WH-8H29A102</td>
                    <td className="p-2 text-slate-700">ORDER.APPROVED</td>
                    <td className="p-2">m.thompson@gmail.com</td>
                    <td className="p-2"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px]">PROCESSED</span></td>
                    <td className="p-2">14:22:01</td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Right Cards */}
          <div className="flex flex-col gap-4">
             <div className="bg-white p-3 border border-slate-200 rounded-sm shadow-sm">
                <div className="text-[11px] font-bold text-slate-700 uppercase mb-3">Supabase DB Sync</div>
                <div className="space-y-3">
                  <div className="border-l-2 border-emerald-500 pl-3">
                    <div className="text-[10px] text-slate-400">2 MINUTES AGO</div>
                    <div className="text-xs">Row created in <span className="font-mono">customers_tbl</span></div>
                  </div>
                </div>
             </div>
             <div className="bg-white p-3 border border-slate-200 rounded-sm shadow-sm">
                <div className="text-[11px] font-bold text-slate-700 uppercase mb-3">Voucher Dispatch</div>
                 <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="font-mono">VC-990-XP</span><span className="text-emerald-600">SENT</span></div>
                 </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

