'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Full-bleed layout */}
      <div className="grid grid-cols-[240px_1fr_340px] min-h-screen">
            {/* Sidebar */}
            <aside className="bg-white border-r border-gray-200 p-6">
              <div className="flex items- gap-3 mb-8">
                <Image src="/a009048e011b5a410b510b06b126c6e2110c05bf.png" alt="Sero" width={180} height={48} />
              </div>
              <nav className="space-y-2">
                {[
                  { label: 'Home', active: true },
                  { label: 'Schedule' },
                  { label: 'Insights' },
                  { label: 'Tasks' },
                  { label: 'Settings' },
                ].map((item) => (
                  <button
                    key={item.label}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                      item.active
                        ? 'bg-[#43A070] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main */}
            <main className="p-8">
              <h1 className="text-[22px] font-semibold text-gray-900">Good afternoon, John.</h1>
              <div className="mt-1 text-sm text-gray-800 font-semibold">Your flow at a glance</div>
              <div className="text-[10px] text-gray-500">Productivity analytics</div>

              {/* Chart Card */}
              <div className="mt-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-900 font-medium">Wednesday, September 24</div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 bg-gray-100 rounded-full p-1 text-xs">
                      <button className="px-3 py-1 rounded-full bg-black text-white">Day</button>
                      <button className="px-3 py-1 rounded-full text-gray-700">Week</button>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-gray-100" />
                    <button className="w-8 h-8 rounded-full bg-gray-100" />
                  </div>
                </div>
                {/* Simple mocked graph */}
                <div className="relative h-[260px]">
                  <div className="absolute inset-0">
                    {/* grid lines */}
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${(i+1)*20}%` }} />
                    ))}
                    {/* x-axis marks */}
                    <div className="absolute left-0 right-0 bottom-6 flex justify-between text-[10px] text-gray-400">
                      {['8AM','9AM','10AM','11AM','12PM','1PM','2PM','3PM','4PM','5PM','6PM','7PM','8PM','9PM','10PM'].map(t => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                  </div>
                  {/* active line */}
                  <svg className="absolute inset-0 w-full h-full">
                    <path d="M0,220 C120,120 240,100 360,90 C420,86 480,86 540,90" stroke="#3FA072" strokeWidth="3" fill="none" />
                    <path d="M0,240 C120,160 240,140 360,130" stroke="#A7D9C0" strokeWidth="3" fill="none" />
                    <line x1="360" y1="20" x2="360" y2="240" stroke="#1F2937" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              {/* Tasks table mock */}
              <div className="mt-6 rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                <div className="p-6 text-gray-900 font-semibold">My Tasks</div>
                <div className="border-t border-gray-200">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-3 text-sm border-t border-gray-100">
                      <div className="text-gray-700">Cross-functional Brainstorming Meeting</div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100">Focused</span>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-[#43A070]/15 text-[#43A070]">9/25, 4-6PM</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </main>

            {/* Right Column */}
            <aside className="p-6 space-y-6 bg-transparent">
              {/* Chronotype card */}
              <div className="rounded-xl bg-[#5DAE8A] text-white p-5 shadow-sm">
                <div className="text-xs opacity-90">Your chronotype</div>
                <div className="text-2xl font-semibold mt-1">Lion</div>
                <div className="flex items-end justify-between mt-4">
                  <div />
                  <Image src="/48bc971cb110c807f8c6cf903c7add4b1c9dfcd7.png" alt="lion" width={240} height={160} className="opacity-70 -scale-x-100" />
                </div>
                <button className="mt-4 w-full py-2 rounded-lg bg-black text-white text-sm">Learn more</button>
              </div>

              {/* Status card */}
              <div className="rounded-xl bg-[#D8C4A3] p-5 shadow-sm">
                <div className="text-xs text-gray-800 opacity-90">Current status</div>
                <div className="text-2xl font-semibold text-white drop-shadow-sm mt-2">Moderate<br/>energy</div>
                <button className="mt-4 w-full py-2 rounded-lg bg-black text-white text-sm">Learn more</button>
              </div>

              {/* Insights card */}
              <div className="rounded-xl bg-[#2F946F] p-5 text-white shadow-sm">
                <div className="text-xs opacity-90">Week of Sept. 21</div>
                <div className="text-2xl font-semibold mt-1">Insights</div>
                <div className="text-sm opacity-90 mt-4">Flow peak</div>
              </div>
            </aside>
      </div>
    </div>
  );
}
