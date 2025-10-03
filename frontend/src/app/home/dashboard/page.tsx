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
import { useChronotype } from '@/hooks/useChronotype';
import { getChronotypeDisplayInfo, formatEnergyCurveForChart } from '@/lib/chronotype';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { chronotype, energyCurve, quizResult, loading: chronotypeLoading, hasChronotype } = useChronotype();
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
    if (!hasChronotype || !energyCurve.length) {
      // Fallback to default data when no chronotype data is available
      const points = [
        { time: '6AM', projected: 0 },
        { time: '7AM', projected: 0 },
        { time: '8AM', projected: 0 },
        { time: '9AM', projected: 0 },
        { time: '10AM', projected: 0 },
        { time: '11AM', projected: 0 },
        { time: '12PM', projected: 0 },
        { time: '1PM', projected: 0 },
        { time: '2PM', projected: 0 },
        { time: '3PM', projected: 0 },
        { time: '4PM', projected: 0 },
        { time: '5PM', projected: 0 },
        { time: '6PM', projected: 0 },
        { time: '7PM', projected: 0 },
        { time: '8PM', projected: 0 },
        { time: '9PM', projected: 0 },
        { time: '10PM', projected: 0 },
        { time: '11PM', projected: 0 },
      ];

      return points;
    }

    // Use real chronotype energy curve data
    const formattedCurve = formatEnergyCurveForChart(energyCurve);
    
    // Fill in missing hours with interpolated values for smooth chart
    const allHours = Array.from({ length: 24 }, (_, i) => i);
    const chartData = allHours.map(hour => {
      const existingPoint = formattedCurve.find(point => point.hour === hour);

      if (existingPoint) {
        return {
          time: existingPoint.time,
          projected: existingPoint.predicted,
        };
      }

      // Interpolate missing hours based on surrounding data points
      const hourToTime = (h: number) => {
        if (h === 0) return '12AM';
        if (h < 12) return `${h}AM`;
        if (h === 12) return '12PM';
        return `${h - 12}PM`;
      };

      // Find the closest surrounding data points for interpolation
      const beforePoint = formattedCurve
        .filter(point => point.hour < hour)
        .slice(-1)[0];

      const afterPoint = formattedCurve
        .filter(point => point.hour > hour)[0];

      let interpolatedProjected = 50; // Default fallback
      if (beforePoint && afterPoint) {
        const ratio = (hour - beforePoint.hour) / (afterPoint.hour - beforePoint.hour);
        interpolatedProjected = Math.round(
          beforePoint.predicted + ratio * (afterPoint.predicted - beforePoint.predicted)
        );
      } else if (beforePoint) {
        interpolatedProjected = beforePoint.predicted;
      } else if (afterPoint) {
        interpolatedProjected = afterPoint.predicted;
      }

      return {
        time: hourToTime(hour),
        projected: interpolatedProjected,
      };
    });

    return chartData;
  }, [hasChronotype, energyCurve]);

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
                  name="Predicted energy"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute right-4 top-4 flex flex-col items-end text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span className="h-1 w-4 rounded-full bg-[#A7D9C0]" />Predicted energy
            </div>
          </div>
          </div>
        </div>

        {/* Quick cards */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {chronotypeLoading ? (
            <div className="rounded-2xl bg-gray-200 p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-6"></div>
              <div className="h-12 bg-gray-300 rounded w-full mb-6"></div>
              <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
          ) : hasChronotype && chronotype ? (
            (() => {
              const chronotypeInfo = getChronotypeDisplayInfo(chronotype.label || 'lion');
              
              return (
                <div className="rounded-2xl p-5 text-white shadow-sm" style={{ backgroundColor: chronotypeInfo.color }}>
                  <div className="text-xs opacity-90">Your chronotype</div>
                  <div className="mt-1 text-2xl font-semibold">{chronotypeInfo.name}</div>
                  <div className="mt-6 flex items-end justify-between">
                    <div className="max-w-[55%] text-sm opacity-95">
                      {chronotype.description || chronotypeInfo.description}
                    </div>
                    <Image 
                      src={chronotypeInfo.image} 
                      alt={chronotypeInfo.name.toLowerCase()} 
                      width={200} 
                      height={140} 
                      className="-scale-x-100 opacity-70" 
                    />
                  </div>
                  <button
                    className="mt-6 w-full rounded-lg bg-black py-2 text-sm text-white"
                    onClick={() => setShowChronotypeModal(true)}
                  >
                    Learn more
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="rounded-2xl bg-gray-100 p-5 text-gray-600 shadow-sm">
              <div className="text-xs opacity-90">Your chronotype</div>
              <div className="mt-1 text-2xl font-semibold">Not determined</div>
              <div className="mt-6 text-sm">
                Take the chronotype quiz to discover your optimal schedule and energy patterns.
              </div>
              <button
                className="mt-6 w-full rounded-lg bg-black py-2 text-sm text-white"
                onClick={() => window.location.href = '/quiz'}
              >
                Take Quiz
              </button>
            </div>
          )}

          {chronotypeLoading ? (
            <div className="rounded-2xl bg-gray-200 p-5 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-16 mb-6"></div>
              <div className="h-12 bg-gray-300 rounded w-full mb-6"></div>
              <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
          ) : hasChronotype && chronotype ? (
            (() => {
              // Get current hour and determine energy status
              const currentHour = new Date().getHours();
              const currentEnergyPoint = energyCurve.find(point => point.hour === currentHour);
              const currentEnergy = currentEnergyPoint?.predicted_energy || 0.5;
              
              let energyStatus = 'Moderate';
              let energyColor = '#D8C4A3'; // Default moderate
              let energyAdvice = 'Keep an even pace and take restorative breaks to extend your focus window.';
              
              if (currentEnergy > 0.7) {
                energyStatus = 'High';
                energyColor = '#10B981'; // Green
                energyAdvice = 'Perfect time for deep focus work and complex tasks. Make the most of this energy peak!';
              } else if (currentEnergy < 0.4) {
                energyStatus = 'Low';
                energyColor = '#F59E0B'; // Orange
                energyAdvice = 'Take it easy with lighter tasks. Consider a short break or restorative activity.';
              }

              return (
                <div className="rounded-2xl p-5 shadow-sm text-white" style={{ backgroundColor: energyColor }}>
                  <div className="text-xs opacity-90">Current status</div>
                  <div className="mt-2 text-2xl font-semibold drop-shadow-sm">{energyStatus}<br />energy</div>
                  <p className="mt-4 text-sm opacity-95">
                    {energyAdvice}
                  </p>
                  <button
                    className="mt-6 w-full rounded-lg bg-black py-2 text-sm text-white"
                    onClick={() => setShowEnergyModal(true)}
                  >
                    Learn more
                  </button>
                </div>
              );
            })()
          ) : (
            <div className="rounded-2xl bg-[#D8C4A3] p-5 shadow-sm">
              <div className="text-xs text-gray-800 opacity-90">Current status</div>
              <div className="mt-2 text-2xl font-semibold text-white drop-shadow-sm">Unknown<br />energy</div>
              <p className="mt-4 text-sm text-gray-900/80">
                Take the chronotype quiz to get personalized energy insights and recommendations.
              </p>
              <button
                className="mt-6 w-full rounded-lg bg-black py-2 text-sm text-white"
                onClick={() => window.location.href = '/quiz'}
              >
                Take Quiz
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Chronotype modal */}
      {showChronotypeModal && chronotype && (
        (() => {
          const chronotypeInfo = getChronotypeDisplayInfo(chronotype.label || 'lion');
          const guidance = chronotype.guidance || {};
          
          return (
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
                    <span className="text-3xl" aria-hidden>{chronotypeInfo.emoji}</span>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-500">Chronotype spotlight</div>
                      <div id="chronotype-modal-title" className="text-xl font-semibold text-gray-900">{chronotypeInfo.name}</div>
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
                  {guidance.status_title && (
                    <div className="flex items-start gap-3">
                      <span className="text-xl" aria-hidden>🌅</span>
                      <p>{guidance.status_body || `As a ${chronotypeInfo.name}, you have unique energy patterns that can be optimized for peak performance.`}</p>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden>📋</span>
                    <p>{chronotype.description || `Discover your optimal schedule and energy patterns with ${chronotypeInfo.name} chronotype insights.`}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-xl" aria-hidden>😴</span>
                    <p>{guidance.insights_prompt || `Learn more about your ${chronotypeInfo.name} chronotype to maximize your daily productivity.`}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      )}
      {showEnergyModal && (
        (() => {
          const currentHour = new Date().getHours();
          const currentEnergyPoint = energyCurve.find(point => point.hour === currentHour);
          const currentEnergy = currentEnergyPoint?.predicted_energy || 0.5;
          
          let energyStatus = 'Moderate';
          let energyIcon = '⚡️';
          let energyAdvice = [
            'Your energy is steady right now, so pace your workload and lean on routines that keep you grounded.',
            'Schedule collaborative sessions or checkpoint meetings during this plateau to stay connected without draining focus.',
            'Light breaks, hydration, and a short reset this afternoon will help you finish the day strong without overextending.'
          ];
          
          if (currentEnergy > 0.7) {
            energyStatus = 'High';
            energyIcon = '🚀';
            energyAdvice = [
              'You\'re in peak energy mode! Tackle your most challenging and creative tasks right now.',
              'This is the perfect time for deep focus work, strategic planning, and complex problem-solving.',
              'Make the most of this energy surge - schedule your most important work during this window.'
            ];
          } else if (currentEnergy < 0.4) {
            energyStatus = 'Low';
            energyIcon = '😴';
            energyAdvice = [
              'Your energy is low right now. Focus on lighter, routine tasks that don\'t require intense concentration.',
              'Consider taking a short break, getting some fresh air, or doing a quick energizing activity.',
              'This is a good time for administrative work, email, or planning for tomorrow.'
            ];
          }

          return (
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
                    <span className="text-3xl" aria-hidden>{energyIcon}</span>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-gray-500">Energy update</div>
                      <div id="energy-modal-title" className="text-xl font-semibold text-gray-900">{energyStatus} energy</div>
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
                  {energyAdvice.map((advice, index) => {
                    const icons = ['🔋', '🤝', '🧘'];
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-xl" aria-hidden>{icons[index]}</span>
                        <p>{advice}</p>
                      </div>
                    );
                  })}
                  {hasChronotype && chronotype && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 mb-1">Based on your {chronotype.label} chronotype</div>
                      <div className="text-xs text-gray-500">
                        Energy level: {Math.round(currentEnergy * 100)}% predicted for this time
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
