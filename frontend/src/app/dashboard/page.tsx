'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const name = user?.identities?.[0]?.identity_data?.full_name;
  const [showChronotypeModal, setShowChronotypeModal] = useState(false);
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [energyScale, setEnergyScale] = useState(1); // demo-only visual adjustment

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

  // Helper function to parse time string (e.g., '8AM', '12PM', '3PM') to hour (0-23)
  const parseTimeToHour = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)(AM|PM)/);
    if (!match) return 0;
    let hour = parseInt(match[1], 10);
    const period = match[2];
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour;
  };

  // Get current hour
  const currentHour = useMemo(() => {
    return new Date().getHours();
  }, []);

  // Adjusted series based on user feedback (demo-only)
  // Also filter actual energy to only show up to current time
  const adjustedEnergySeries = useMemo(
    () =>
      energySeries.map((point) => {
        const pointHour = parseTimeToHour(point.time);
        const adjustedActual = Math.max(
          0,
          Math.min(100, Math.round(point.actual * energyScale)),
        );
        return {
          ...point,
          // Only show actual energy up to current hour, set to null for future times
          actual: pointHour <= currentHour ? adjustedActual : null,
        };
      }),
    [energySeries, energyScale, currentHour],
  );

  // Find the current time data point (last one with actual energy)
  const currentTimePoint = useMemo(() => {
    const lastActualPoint = adjustedEnergySeries
      .slice()
      .reverse()
      .find((point) => point.actual !== null);
    return lastActualPoint || null;
  }, [adjustedEnergySeries]);

  // Simple representative prediction value for the modal
  const predictedLevel =
    energySeries.length > 0
      ? energySeries[Math.floor(energySeries.length / 2)].projected
      : 72;

  // Global keyboard listener for "d" key to open feedback modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'd') {
        setShowFeedbackModal(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFeedbackChoice = (choice: 'higher' | 'lower' | 'same') => {
    if (choice === 'higher') {
      setEnergyScale(1.12);
    } else if (choice === 'lower') {
      setEnergyScale(0.88);
    } else {
      setEnergyScale(1);
    }
    setShowFeedbackModal(false);
  };

  const tooltipFormatter = (value: number) => `${value}%`;

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
                    onClick={() => {
                      if (item.label === 'Insights') {
                        window.location.href = '/insights';
                      }
                      if (item.label === 'Schedule') {
                        window.location.href = '/schedule';
                      }
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main */}
            <main className="p-8">
              <h1 className="text-[22px] font-semibold text-gray-900">Good afternoon, {loading ? '...' : (name || (user?.email?.split('@')[0] ?? 'User'))}.</h1>
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
                {/* Animated energy chart */}
                <div className="relative h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={adjustedEnergySeries}
                      margin={{ top: 10, left: -24, right: 10, bottom: 0 }}
                    >
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
                        dot={(props: any) => {
                          // Only show dot at the last actual energy point (current time)
                          if (
                            currentTimePoint &&
                            props.payload.time === currentTimePoint.time &&
                            props.payload.actual !== null
                          ) {
                            return (
                              <circle
                                cx={props.cx}
                                cy={props.cy}
                                r={5}
                                fill="#1F2937"
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            );
                          }
                          return <g />;
                        }}
                      />
                      {/* Dashed vertical line at current time */}
                      {currentTimePoint && (
                        <ReferenceLine
                          x={currentTimePoint.time}
                          stroke="#1F2937"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          opacity={0.5}
                        />
                      )}
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
                <button
                  className="mt-4 w-full py-2 rounded-lg bg-black text-white text-sm"
                  onClick={() => setShowChronotypeModal(true)}
                >
                  Learn more
                </button>
              </div>

              {/* Status card */}
              <div className="rounded-xl bg-[#D8C4A3] p-5 shadow-sm">
                <div className="text-xs text-gray-800 opacity-90">Current status</div>
                <div className="text-2xl font-semibold text-white drop-shadow-sm mt-2">Moderate<br/>energy</div>
                <button
                  className="mt-4 w-full py-2 rounded-lg bg-black text-white text-sm"
                  onClick={() => setShowEnergyModal(true)}
                >
                  Learn more
                </button>
              </div>

              {/* Insights card */}
              <div className="rounded-xl bg-[#2F946F] p-5 text-white shadow-sm">
                <div className="text-xs opacity-90">Week of Sept. 21</div>
                <div className="text-2xl font-semibold mt-1">Insights</div>
                <div className="text-sm opacity-90 mt-4">Flow peak</div>
              </div>
            </aside>
      </div>

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
      {/* Higher / lower / same feedback modal (triggered with "d") */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowFeedbackModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Quick check-in
                </div>
                <h2
                  id="feedback-modal-title"
                  className="mt-1 text-lg font-semibold text-gray-900"
                >
                  How does this feel compared to your prediction?
                </h2>
              </div>
              <button
                className="ml-4 rounded-full bg-gray-100 px-2 py-1 text-lg leading-none text-gray-500 hover:text-gray-800"
                onClick={() => setShowFeedbackModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="mt-4 text-sm text-gray-700">
              Your current predicted energy level is{' '}
              <span className="font-semibold text-gray-900">
                {predictedLevel}%
              </span>{' '}
              based on your chronotype.
            </p>
            <p className="mt-2 text-sm text-gray-700">
              Are your actual energy levels higher, lower, or about the same as
              this prediction?
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <button
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:border-[#16A34A] hover:bg-[#16A34A]/10"
                onClick={() => handleFeedbackChoice('higher')}
              >
                Higher
              </button>
              <button
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:border-[#DC2626] hover:bg-[#DC2626]/10"
                onClick={() => handleFeedbackChoice('lower')}
              >
                Lower
              </button>
              <button
                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-700 hover:bg-gray-900 hover:text-white"
                onClick={() => handleFeedbackChoice('same')}
              >
                About the same
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
