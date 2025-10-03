'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { GoogleCalendarEvent } from '@/lib/google/calendar';
import { TasksSidebar, SIDEBAR_TASK_DRAG_TYPE, type TaskSummary } from '@/components/tasks/TasksSidebar';

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_MINUTES = 15;
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
const SLOT_HEIGHT_PX = 24;
const SLOTS_PER_DAY = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;

const toMinutesFromSlot = (slotIndex: number) => START_HOUR * 60 + slotIndex * SLOT_MINUTES;

const formatTime = (minutesTotal: number) => {
  const hours = Math.floor(minutesTotal / 60);
  const minutes = minutesTotal % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const formatRange = (startSlot: number, durationSlots: number) => {
  const startMinutes = toMinutesFromSlot(startSlot);
  const endMinutes = toMinutesFromSlot(Math.min(SLOTS_PER_DAY, startSlot + durationSlots));
  return `${formatTime(startMinutes)}–${formatTime(endMinutes)}`;
};

const clampDuration = (startSlot: number, durationSlots: number) => {
  return Math.max(1, Math.min(durationSlots, SLOTS_PER_DAY - startSlot));
};

type Task = {
  id: string;
  title: string;
  dayIndex: number;
  startSlot: number;
  durationSlots: number;
  color: 'green' | 'amber' | 'red' | 'blue';
  isExternal?: boolean;
};

type ScheduleClientProps = {
  weekDays: string[];
  weekStartISO: string;
  googleEvents: GoogleCalendarEvent[];
  requiresGoogleAuth: boolean;
};

const HIGH_BAND = { startHour: 10, endHour: 12, color: '#22c55e', opacity: 0.35 };
const MEDIUM_BAND = { startHour: 16, endHour: 18, color: '#86efac', opacity: 0.25 };

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function parseISO(dateString: string) {
  return new Date(dateString);
}

function eventToTask(event: GoogleCalendarEvent, weekStart: Date): Task | null {
  const startDate = parseISO(event.start);
  const endDate = parseISO(event.end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return null;
  }

  const diffDays = Math.floor((startDate.getTime() - weekStart.getTime()) / ONE_DAY_MS);
  if (diffDays < 0 || diffDays >= 7) {
    return null;
  }

  const eventStartMinutes = event.allDay
    ? START_HOUR * 60
    : startDate.getHours() * 60 + startDate.getMinutes();
  const eventEndMinutes = event.allDay
    ? END_HOUR * 60
    : endDate.getHours() * 60 + endDate.getMinutes();

  const startSlot = Math.max(0, Math.floor((eventStartMinutes - START_HOUR * 60) / SLOT_MINUTES));
  const rawDurationMinutes = Math.max(eventEndMinutes - eventStartMinutes, SLOT_MINUTES);
  const durationSlots = Math.ceil(rawDurationMinutes / SLOT_MINUTES);

  return {
    id: `google-${event.calendarId}-${event.id}`,
    title: event.summary,
    dayIndex: diffDays,
    startSlot: Math.min(startSlot, SLOTS_PER_DAY - 1),
    durationSlots: clampDuration(Math.min(startSlot, SLOTS_PER_DAY - 1), durationSlots),
    color: 'blue',
    isExternal: true,
  };
}

export function ScheduleClient({ weekDays, weekStartISO, googleEvents, requiresGoogleAuth }: ScheduleClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 't1',
      title: 'Event #1',
      dayIndex: 0,
      startSlot: (9 - START_HOUR) * SLOTS_PER_HOUR,
      durationSlots: 2 * SLOTS_PER_HOUR,
      color: 'red',
    },
    {
      id: 't2',
      title: 'Event #4',
      dayIndex: 3,
      startSlot: (11 - START_HOUR) * SLOTS_PER_HOUR,
      durationSlots: 2 * SLOTS_PER_HOUR,
      color: 'amber',
    },
    {
      id: 't3',
      title: 'Event #6',
      dayIndex: 2,
      startSlot: (11 - START_HOUR) * SLOTS_PER_HOUR,
      durationSlots: 3 * SLOTS_PER_HOUR,
      color: 'green',
    },
    {
      id: 't4',
      title: 'Event #1',
      dayIndex: 4,
      startSlot: (9 - START_HOUR) * SLOTS_PER_HOUR,
      durationSlots: 2 * SLOTS_PER_HOUR,
      color: 'red',
    },
  ]);

  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ taskId: string; dayIndex: number; slotIndex: number } | null>(null);
  const dragImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = document.createElement('img');
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    img.width = 0;
    img.height = 0;
    img.style.position = 'absolute';
    img.style.pointerEvents = 'none';
    img.style.top = '-1000px';
    document.body.appendChild(img);
    dragImageRef.current = img;
    return () => {
      if (img.parentNode) {
        img.parentNode.removeChild(img);
      }
      dragImageRef.current = null;
    };
  }, []);

  const planningTasks = useMemo<TaskSummary[]>(
    () => [
      {
        id: 'plan-1',
        title: 'Strategy doc: Q4 plan',
        lengthMinutes: 90,
        lengthLabel: '90 min',
        focusLabel: 'Deep focus',
        suggestionLabel: 'Suggested: Today 10:00',
      },
      {
        id: 'plan-2',
        title: 'Team standup notes',
        lengthMinutes: 20,
        lengthLabel: '20 min',
        focusLabel: 'Shallow focus',
        suggestionLabel: 'Suggested: Today 16:30',
      },
      {
        id: 'plan-3',
        title: 'Research competitors',
        lengthMinutes: 45,
        lengthLabel: '45 min',
        focusLabel: 'Medium focus',
        suggestionLabel: 'Suggested: Tomorrow 11:00',
      },
      {
        id: 'plan-4',
        title: 'Customer follow-ups',
        lengthMinutes: 30,
        lengthLabel: '30 min',
        focusLabel: 'Medium focus',
        suggestionLabel: 'Suggested: Tomorrow 14:00',
      },
    ],
    []
  );

  const weekStart = useMemo(() => new Date(weekStartISO), [weekStartISO]);

  const googleTasks = useMemo(() => {
    return googleEvents
      .map((event) => eventToTask(event, weekStart))
      .filter((task): task is Task => Boolean(task));
  }, [googleEvents, weekStart]);

  const allTasks = useMemo(() => [...tasks, ...googleTasks], [tasks, googleTasks]);

  const onDropTask = (e: React.DragEvent<HTMLDivElement>, dayIndex: number, slotIndex: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData(SIDEBAR_TASK_DRAG_TYPE) || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const planningTask = planningTasks.find((task) => task.id === taskId);

    setTasks((prev) => {
      const existingIndex = prev.findIndex((t) => t.id === taskId);
      const clampedSlot = Math.min(slotIndex, SLOTS_PER_DAY - 1);

      if (existingIndex !== -1) {
        const next = [...prev];
        const existing = next[existingIndex];
        next[existingIndex] = {
          ...existing,
          dayIndex,
          startSlot: clampedSlot,
          durationSlots: clampDuration(clampedSlot, existing.durationSlots),
        };
        return next;
      }

      if (!planningTask) {
        return prev;
      }

      const suggestedSlots = clampDuration(clampedSlot, Math.max(1, Math.ceil(planningTask.lengthMinutes / SLOT_MINUTES)));

      return [
        ...prev,
        {
          id: taskId,
          title: planningTask.title,
          dayIndex,
          startSlot: clampedSlot,
          durationSlots: suggestedSlots,
          color: 'green',
        },
      ];
    });

    setDragPreview(null);
    setDraggingTaskId(null);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggingTaskId) {
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const onDragEnterCell = (dayIndex: number, slotIndex: number) => {
    setDragPreview((prev) => {
      if (!draggingTaskId) return prev;
      if (prev && prev.taskId === draggingTaskId && prev.dayIndex === dayIndex && prev.slotIndex === slotIndex) {
        return prev;
      }
      return { taskId: draggingTaskId, dayIndex, slotIndex };
    });
  };

  const draggingCard = useMemo(() => {
    if (!draggingTaskId) return null;
    return planningTasks.find((task) => task.id === draggingTaskId) ?? null;
  }, [draggingTaskId, planningTasks]);

  const addTask = (dayIndex: number, slotIndex: number) => {
    const id = Math.random().toString(36).slice(2);
    const defaultDuration = clampDuration(slotIndex, SLOTS_PER_HOUR);
    setTasks((prev) => [
      ...prev,
      { id, title: 'New task', dayIndex, startSlot: slotIndex, durationSlots: defaultDuration, color: 'amber' },
    ]);
  };

  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const changeDuration = (id: string, deltaSlots: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              durationSlots: clampDuration(t.startSlot, t.durationSlots + deltaSlots),
            }
          : t
      )
    );
  };

  const previewSlotCount = draggingCard ? Math.max(1, Math.ceil(draggingCard.lengthMinutes / SLOT_MINUTES)) : 0;

  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <main className={`flex-1 p-8 transition-[padding-right] duration-300 ${isSidebarOpen ? 'pr-10' : 'pr-3'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900">Schedule</h1>
            {requiresGoogleAuth && (
              <div className="mt-3 rounded-lg border border-dashed border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Connect your Google Calendar in settings to sync events.
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className="rounded-full bg-gray-100 px-3 py-1">Today</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold text-gray-700">Current Week</div>
            <button className="h-8 w-8 rounded-full bg-gray-100" />
            <button className="h-8 w-8 rounded-full bg-gray-100" />
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
            <div className="h-12" />
            {weekDays.map((d) => (
              <div key={d} className="flex h-12 items-center justify-center text-sm font-medium text-gray-600">
                {d}
              </div>
            ))}

            {Array.from({ length: SLOTS_PER_DAY }, (_, index) => index).map((slotIndex) => {
              const minutes = toMinutesFromSlot(slotIndex);
              const minuteOfHour = minutes % 60;
              const isHourStart = minuteOfHour === 0;
              const label = isHourStart ? formatTime(minutes) : '';

              return (
                <Fragment key={slotIndex}>
                  <div
                    className={`flex items-center px-2 text-[10px] ${isHourStart ? 'text-gray-600 font-medium' : 'text-gray-400'}`}
                    style={{ height: SLOT_HEIGHT_PX }}
                  >
                    {label}
                  </div>
                  {weekDays.map((_, dayIndex) => {
                    const isPreviewCell =
                      dragPreview && dragPreview.dayIndex === dayIndex && dragPreview.slotIndex === slotIndex && draggingCard;

                    const tasksForCell = allTasks.filter(
                      (t) => t.dayIndex === dayIndex && t.startSlot === slotIndex
                    );

                    return (
                      <div
                        key={`cell-${dayIndex}-${slotIndex}`}
                        className={`relative border-t ${isHourStart ? 'border-gray-200' : 'border-gray-100'} transition $
                          {isPreviewCell ? 'bg-emerald-50/80' : 'bg-white'}
                        `}
                        style={{ height: SLOT_HEIGHT_PX }}
                        onDrop={(e) => onDropTask(e, dayIndex, slotIndex)}
                        onDragOver={onDragOver}
                        onDragEnter={() => onDragEnterCell(dayIndex, slotIndex)}
                        onDragLeave={(event) => {
                          const relatedTarget = event.relatedTarget as HTMLElement | null;
                          if (!relatedTarget || !event.currentTarget.contains(relatedTarget)) {
                            setDragPreview((prev) =>
                              prev && prev.dayIndex === dayIndex && prev.slotIndex === slotIndex ? null : prev
                            );
                          }
                        }}
                        onDoubleClick={() => addTask(dayIndex, slotIndex)}
                      >
                        {slotIndex === 0 && (
                          <div className="pointer-events-none absolute inset-0 z-10">
                            {[HIGH_BAND, MEDIUM_BAND].map((band, i) => {
                              const bandStartSlot = Math.max(0, Math.floor((band.startHour - START_HOUR) * SLOTS_PER_HOUR));
                              const bandEndSlot = Math.floor((band.endHour - START_HOUR) * SLOTS_PER_HOUR);
                              const top = bandStartSlot * SLOT_HEIGHT_PX - 1;
                              const height = Math.max(bandEndSlot - bandStartSlot, 1) * SLOT_HEIGHT_PX + 2;
                              return (
                                <div
                                  key={`band-${i}`}
                                  className="absolute left-0 right-0"
                                  style={{ top, height, backgroundColor: band.color, opacity: band.opacity }}
                                />
                              );
                            })}
                          </div>
                        )}

                        {tasksForCell.map((t) => (
                          <div
                            key={t.id}
                            draggable={!t.isExternal}
                            onDragStart={(e) => {
                              if (!t.isExternal) {
                                e.dataTransfer.setData('text/plain', t.id);
                              }
                            }}
                            className={`relative z-30 ml-[5%] w-[90%] rounded-lg border bg-white p-2 text-xs text-gray-900 shadow-sm ${
                              t.color === 'green'
                                ? 'border-emerald-500'
                                : t.color === 'amber'
                                ? 'border-amber-400'
                                : t.color === 'red'
                                ? 'border-rose-500'
                                : 'border-blue-500'
                            } ${t.isExternal ? 'cursor-default bg-blue-50' : 'cursor-move'}`}
                            style={{ height: t.durationSlots * SLOT_HEIGHT_PX - 6 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-semibold">{formatRange(t.startSlot, t.durationSlots)}</div>
                              {!t.isExternal && (
                                <div className="flex items-center gap-1">
                                  <button
                                    className="rounded bg-gray-100 px-1"
                                    title="Shorter"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      changeDuration(t.id, -1);
                                    }}
                                  >
                                    −
                                  </button>
                                  <button
                                    className="rounded bg-gray-100 px-1"
                                    title="Longer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      changeDuration(t.id, 1);
                                    }}
                                  >
                                    +
                                  </button>
                                  <button
                                    className="rounded bg-rose-50 px-1 text-rose-600"
                                    title="Delete"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteTask(t.id);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="mt-1 line-clamp-2">{t.title}</div>
                          </div>
                        ))}

                        {isPreviewCell && draggingCard && previewSlotCount > 0 && (
                          <div
                            className="pointer-events-none absolute left-1 right-1 z-20 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-500/10 px-2 text-center text-[11px] font-semibold text-emerald-700"
                            style={{
                              top: 2,
                              height: previewSlotCount * SLOT_HEIGHT_PX - 4,
                            }}
                          >
                            <span className="line-clamp-2">{draggingCard.title}</span>
                            <span>{draggingCard.lengthLabel}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Fragment>
              );
            })}
          </div>
        </div>
      </main>

      <TasksSidebar
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
        tasks={planningTasks}
        draggingTaskId={draggingTaskId}
        onTaskDragStart={(taskId, event) => {
          setDraggingTaskId(taskId);
          if (dragImageRef.current) {
            event.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
          }
        }}
        onTaskDragEnd={() => {
          setDraggingTaskId(null);
          setDragPreview(null);
        }}
      />
    </div>
  );
}

export default ScheduleClient;


