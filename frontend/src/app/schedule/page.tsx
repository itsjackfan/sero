'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';

type Task = {
  id: string;
  title: string;
  dayIndex: number; // 0..6
  startHour: number; // 8..20
  durationHours: number; // integer for simplicity
  color: 'green' | 'amber' | 'red';
};

const days = ['Monday 22', 'Tuesday 23', 'Wednesday 24', 'Thursday 25', 'Friday 26', 'Saturday 27', 'Sunday 28'];
const hours = Array.from({ length: 13 }).map((_, i) => 8 + i); // 8AM..20PM

// Fixed energy bands per day: one high, one medium
const HIGH_BAND = { startHour: 10, endHour: 12, color: '#22c55e', opacity: 0.35 }; // 10am–12pm
const MEDIUM_BAND = { startHour: 16, endHour: 18, color: '#86efac', opacity: 0.25 }; // 4pm–6pm

export default function SchedulePage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', title: 'Event #1', dayIndex: 0, startHour: 9, durationHours: 2, color: 'red' },
    { id: 't2', title: 'Event #4', dayIndex: 3, startHour: 11, durationHours: 2, color: 'amber' },
    { id: 't3', title: 'Event #6', dayIndex: 2, startHour: 11, durationHours: 3, color: 'green' },
    { id: 't4', title: 'Event #1', dayIndex: 4, startHour: 9, durationHours: 2, color: 'red' },
  ]);

  // no derived series; we use fixed blocks each day

  const onDropTask = (e: React.DragEvent<HTMLDivElement>, dayIndex: number, hour: number) => {
    const taskId = e.dataTransfer.getData('text/plain');
    e.preventDefault();
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, dayIndex, startHour: hour } : t)));
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const addTask = (dayIndex: number, hour: number) => {
    const id = Math.random().toString(36).slice(2);
    setTasks((prev) => [
      ...prev,
      { id, title: 'New task', dayIndex, startHour: hour, durationHours: 1, color: 'amber' },
    ]);
  };

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const changeDuration = (id: string, delta: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, durationHours: Math.max(1, Math.min(6, t.durationHours + delta)) } : t))
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="grid grid-cols-[240px_1fr] min-h-screen">
        {/* Sidebar clone to match shell */}
        <aside className="bg-white border-r border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/a009048e011b5a410b510b06b126c6e2110c05bf.png" alt="Sero" width={180} height={48} />
          </div>
          <nav className="space-y-2">
            {['Home', 'Schedule', 'Insights', 'Tasks', 'Settings'].map((label) => (
              <button
                key={label}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium ${
                  label === 'Schedule' ? 'bg-[#43A070] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  if (label === 'Home') window.location.href = '/dashboard';
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main schedule */}
        <main className="p-8">
          <h1 className="text-[22px] font-semibold text-gray-900">Schedule</h1>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded-full bg-gray-100">Today</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold text-gray-700">Sep 22 – 28, 2025</div>
              <button className="w-8 h-8 rounded-full bg-gray-100" />
              <button className="w-8 h-8 rounded-full bg-gray-100" />
            </div>
          </div>

          {/* Grid */}
          <div className="mt-6 rounded-2xl bg-white ring-1 ring-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
              {/* Day headers */}
              <div className="h-12" />
              {days.map((d) => (
                <div key={d} className="h-12 flex items-center justify-center text-sm text-gray-600 font-medium">
                  {d}
                </div>
              ))}

              {/* Rows */}
              {hours.map((h, row) => (
                <>
                  <div key={`h-${h}`} className="h-16 px-2 text-[10px] text-gray-400 flex items-start pt-2">
                    {`${h}:00`}
                  </div>
                  {days.map((_, dayIndex) => (
                    <div
                      key={`cell-${dayIndex}-${row}`}
                      className="relative h-16 border-t border-gray-100"
                      onDrop={(e) => onDropTask(e, dayIndex, h)}
                      onDragOver={onDragOver}
                      onDoubleClick={() => addTask(dayIndex, h)}
                    >
                      {/* Energy overlay: only render from the block's starting cell */}
                      {row === 0 && (
                        <div className="pointer-events-none absolute inset-0 z-20">
                          {[
                            { ...HIGH_BAND },
                            { ...MEDIUM_BAND },
                          ].map((b, i) => {
                            const startIndex = hours.indexOf(b.startHour);
                            const length = b.endHour - b.startHour;
                            const top = startIndex * 64 - 1; // overlap borders
                            const height = length * 64 + 2; // cover border lines fully
                            return (
                              <div
                                key={`block-${i}`}
                                className="absolute left-0 right-0"
                                style={{ top, height, opacity: b.opacity, backgroundColor: b.color }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Tasks in this cell */}
                      {tasks
                        .filter((t) => t.dayIndex === dayIndex && t.startHour === h)
                        .map((t) => (
                          <div
                            key={t.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}
                            className={`relative z-30 w-[90%] ml-[5%] rounded-lg border p-2 text-xs shadow-sm cursor-move bg-white text-gray-900 ${
                              t.color === 'green'
                                ? 'border-emerald-500'
                                : t.color === 'amber'
                                ? 'border-amber-400'
                                : 'border-rose-500'
                            }`}
                            style={{ height: `${t.durationHours * 64 - 8}px` }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="font-semibold text-[10px]">{`${t.startHour.toString().padStart(2, '0')}:00–${
                                (t.startHour + t.durationHours).toString().padStart(2, '0')
                              }:00`}</div>
                              <div className="flex items-center gap-2">
                                <button
                                  className="px-1 rounded bg-gray-100"
                                  title="Shorter"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeDuration(t.id, -1);
                                  }}
                                >
                                  −
                                </button>
                                <button
                                  className="px-1 rounded bg-gray-100"
                                  title="Longer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    changeDuration(t.id, 1);
                                  }}
                                >
                                  +
                                </button>
                                <button
                                  className="px-1 rounded bg-rose-50 text-rose-600"
                                  title="Delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(t.id);
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                            <div className="mt-1">{t.title}</div>
                          </div>
                        ))}
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
