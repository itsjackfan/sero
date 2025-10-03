'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const name = user?.identities?.[0]?.identity_data?.full_name;
  const [showChronotypeModal, setShowChronotypeModal] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      }).format(new Date()),
    []
  );

  const energySeries = useMemo(() => {
    const points = [
      { time: '8AM', actual: 38, projected: 42 },
      { time: '9AM', actual: 52, projected: 55 },
      { time: '10AM', actual: 68, projected: 70 },
      { time: '11AM', actual: 80, projected: 78 },
      { time: '12PM', actual: 74, projected: 76 },
      { time: '1PM', actual: 66, projected: 71 },
      { time: '2PM', actual: 60, projected: 64 },
      { time: '3PM', actual: 58, projected: 60 },
      { time: '4PM', actual: 62, projected: 58 },
      { time: '5PM', actual: 65, projected: 55 },
      { time: '6PM', actual: 60, projected: 52 },
      { time: '7PM', actual: 52, projected: 48 },
      { time: '8PM', actual: 40, projected: 42 },
      { time: '9PM', actual: 32, projected: 36 },
      { time: '10PM', actual: 24, projected: 28 },
    ];

    return points.map((item, index) => {
      if (index === 0 || index === points.length - 1) return item;
      const prev = points[index - 1];
      const next = points[index + 1];
      return {
        ...item,
        actual: Math.round((prev.actual + item.actual + next.actual) / 3),
        projected: Math.round((prev.projected + item.projected + next.projected) / 3),
      };
    });
  }, []);

  const tooltipFormatter = (value: number) => `${value}%`;

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-6 py-8 lg:px-8">
        <h1 className="text-[22px] font-semibold text-gray-900">Good afternoon, {loading ? '...' : (name || (user?.email?.split('@')[0] ?? 'User'))}.</h1>
        <div className="mt-1 flex items-baseline gap-2 text-sm font-semibold text-gray-800">
          <span>Your flow at a glance</span>
          {/* <span className="text-xs uppercase tracking-wide text-gray-500">{formattedDate}</span> */}
        </div>
        <div className="text-[10px] text-gray-500">Productivity analytics</div>

        {/* Chart Card */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900">{formattedDate}</div>
          </div>
          {/* Animated energy chart */}
          <div className="relative h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energySeries} margin={{ top: 10, left: -24, right: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F2937" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1F2937" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A7D9C0" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A7D9C0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} interval={1} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ stroke: '#1F2937', strokeWidth: 1, strokeDasharray: '4 4' }}
                  formatter={tooltipFormatter}
                  labelFormatter={(label) => `Energy at ${label}`}
                  contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', boxShadow: '0 8px 16px rgba(15, 23, 42, 0.08)' }}
                  labelStyle={{ color: '#1F2937', fontWeight: 600 }}
                  wrapperStyle={{ outline: 'none' }}
                />  
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke="#A7D9C0"
                  strokeWidth={3}
                  fill="url(#projectedGradient)"
                  animationDuration={1200}
                  animationBegin={100}
                  name="Projected energy"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#1F2937"
                  strokeWidth={3}
                  fill="url(#actualGradient)"
                  animationDuration={1200}
                  name="Actual energy"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute right-4 top-4 flex flex-col items-end text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-1 w-4 rounded-full bg-[#1F2937]" />Actual energy
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-1 w-4 rounded-full bg-[#A7D9C0]" />Projected energy
            </div>
          </div>
          </div>
        </div>

        {/* Quick cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-[#5DAE8A] p-5 text-white shadow-sm">
            <div className="text-xs opacity-90">Your chronotype</div>
            <div className="mt-1 text-2xl font-semibold">Lion</div>
            <div className="mt-6 flex items-end justify-between">
              <div className="max-w-[55%] text-sm opacity-95">
                Morning-focused routines are primed to help you stay in flow.
              </div>
              <Image src="/48bc971cb110c807f8c6cf903c7add4b1c9dfcd7.png" alt="lion" width={200} height={140} className="-scale-x-100 opacity-70" />
            </div>
            <button
              className="mt-6 w-full rounded-lg bg-black py-2 text-sm text-white"
              onClick={() => setShowChronotypeModal(true)}
            >
              Learn more
            </button>
          </div>

          <div className="rounded-2xl bg-[#D8C4A3] p-5 shadow-sm">
            <div className="text-xs text-gray-800 opacity-90">Current status</div>
            <div className="mt-2 text-2xl font-semibold text-white drop-shadow-sm">Moderate<br />energy</div>
            <p className="mt-4 text-sm text-gray-900/80">
              Keep an even pace and take restorative breaks to extend your focus window.
            </p>
            <button
              className="mt-6 w-full rounded-lg bg-black py-2 text-sm text-white"
              onClick={() => setShowEnergyModal(true)}
            >
              Learn more
            </button>
          </div>
        </div>
      </main>

      {/* Chronotype modal */}
      {showChronotypeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chronotype-modal-title"
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowChronotypeModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>🦁</span>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Chronotype spotlight</div>
                  <div id="chronotype-modal-title" className="text-xl font-semibold text-gray-900">Lion</div>
                </div>
              </div>
              <button
                className="ml-4 rounded-full bg-gray-100 p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowChronotypeModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mt-5 space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>🌅</span>
                <p>{"As a Lion, you're naturally up with the sunrise and your focus peaks before midday, making mornings ideal for deep work."}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>📋</span>
                <p>{"Prioritize strategy or high-priority tasks early, then move lighter collaboration into the afternoon to match your energy curve."}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>😴</span>
                <p>{"Wind down before sunset routines kick in and keep a consistent bedtime so tomorrow's momentum stays strong."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEnergyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="energy-modal-title"
        >
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowEnergyModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl" aria-hidden>⚡️</span>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">Energy update</div>
                  <div id="energy-modal-title" className="text-xl font-semibold text-gray-900">Moderate energy</div>
                </div>
              </div>
              <button
                className="ml-4 rounded-full bg-gray-100 p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setShowEnergyModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mt-5 space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>🔋</span>
                <p>{"Your energy is steady right now, so pace your workload and lean on routines that keep you grounded."}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>🤝</span>
                <p>{"Schedule collaborative sessions or checkpoint meetings during this plateau to stay connected without draining focus."}</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>🧘</span>
                <p>{"Light breaks, hydration, and a short reset this afternoon will help you finish the day strong without overextending."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
