'use client';

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react';
import {
  TasksSidebar,
  SIDEBAR_TASK_DRAG_TYPE,
  type TaskSummary,
  type AddTaskDraft,
  type SidebarFilters,
  type FocusLevel,
} from '@/components/tasks/TasksSidebar';
import { useChronotype } from '@/hooks/useChronotype';

const START_HOUR = 8;
const END_HOUR = 20;
const SLOT_MINUTES = 5;
const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;
const SLOT_HEIGHT_PX = 12;
const SLOTS_PER_DAY = (END_HOUR - START_HOUR) * SLOTS_PER_HOUR;
const VIEW_DAYS_BEFORE = 2;
const VIEW_DAYS_AFTER = 4;
const VIEW_LENGTH = VIEW_DAYS_BEFORE + 1 + VIEW_DAYS_AFTER;
const WEEK_LENGTH = 7;

const todayKey = () => formatISODate(new Date());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const formatISODate = (date: Date) => date.toISOString().split('T')[0];

const formatDayLabel = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

const formatDayLong = (date: Date) =>
  date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

const formatRangeLabel = (start: Date, end: Date) => {
  const startOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const endOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const startLabel = start.toLocaleDateString(undefined, startOpts);
  const endLabel = end.toLocaleDateString(undefined, endOpts);
  return `${startLabel} – ${endLabel}`;
};

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

const toDurationLabel = (minutes: number) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs && mins) return `${hrs}h ${mins}m`;
  if (hrs) return `${hrs}h`;
  return `${mins}m`;
};

const clampDuration = (startSlot: number, durationSlots: number) =>
  Math.max(1, Math.min(durationSlots, SLOTS_PER_DAY - startSlot));

// Default energy bands (will be overridden by chronotype data)
const DEFAULT_HIGH_BAND = { startHour: 10, endHour: 12, color: '#22c55e', opacity: 0.35 };
const DEFAULT_MEDIUM_BAND = { startHour: 16, endHour: 18, color: '#86efac', opacity: 0.25 };

const timeSlots = Array.from({ length: SLOTS_PER_DAY }, (_, index) => index);

const scheduleHeight = SLOTS_PER_DAY * SLOT_HEIGHT_PX;

type ViewState = {
  offsetDays: number;
  todayKey: string;
};

const getInitialViewState = (): ViewState => ({
  offsetDays: 0,
  todayKey: todayKey(),
});

type Task = {
  id: string;
  title: string;
  dateKey: string;
  startSlot: number;
  durationSlots: number;
  color: 'green' | 'amber' | 'red';
  focusLevel: FocusLevel;
};

const initialSidebarTasks: TaskSummary[] = [
  {
    id: 'plan-1',
    title: 'Strategy doc: Q4 plan',
    lengthMinutes: 90,
    lengthLabel: '90 min',
    focusLabel: 'Deep focus',
    suggestionLabel: 'Suggested: Today 10:00',
    dueLabel: 'Due Thu',
  },
  {
    id: 'plan-2',
    title: 'Team standup notes',
    lengthMinutes: 20,
    lengthLabel: '20 min',
    focusLabel: 'Shallow focus',
    suggestionLabel: 'Suggested: Today 16:30',
    dueLabel: 'Due Today',
  },
  {
    id: 'plan-3',
    title: 'Research competitors',
    lengthMinutes: 45,
    lengthLabel: '45 min',
    focusLabel: 'Medium focus',
    suggestionLabel: 'Suggested: Tomorrow 11:00',
    dueLabel: 'Due Fri',
  },
  {
    id: 'plan-4',
    title: 'Customer follow-ups',
    lengthMinutes: 30,
    lengthLabel: '30 min',
    focusLabel: 'Medium focus',
    suggestionLabel: 'Suggested: Tomorrow 14:00',
    dueLabel: 'Due Sat',
  },
];

export default function SchedulePage() {
  const { chronotype, focusWindows, hasChronotype } = useChronotype();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewState, setViewState] = useState<ViewState>(getInitialViewState);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sidebarTasks, setSidebarTasks] = useState<TaskSummary[]>(initialSidebarTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragPreview, setDragPreview] = useState<{ taskId: string; dayIndex: number; slotIndex: number } | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [sidebarFilters, setSidebarFilters] = useState<SidebarFilters>({ focus: [], due: 'all' });
  const dragImageRef = useRef<HTMLImageElement | null>(null);
  const [selectedSidebarTaskId, setSelectedSidebarTaskId] = useState<string | null>(null);

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

  useEffect(() => {
    const id = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    setCurrentTime(new Date());
  }, [viewState.offsetDays]);

  const baseDay = useMemo(() => {
    const reference = new Date();
    reference.setHours(0, 0, 0, 0);
    return addDays(reference, viewState.offsetDays);
  }, [viewState.offsetDays]);

  const viewStartDate = useMemo(() => addDays(baseDay, -VIEW_DAYS_BEFORE), [baseDay]);

  const viewDates = useMemo(
    () =>
      Array.from({ length: VIEW_LENGTH }, (_, index) => {
        const next = addDays(viewStartDate, index);
        next.setHours(0, 0, 0, 0);
        return next;
      }),
    [viewStartDate]
  );

  const viewDayKeys = useMemo(() => viewDates.map(formatISODate), [viewDates]);
  const currentDayIndex = viewDayKeys.indexOf(viewState.todayKey);

  // Generate energy bands from chronotype focus windows
  const energyBands = useMemo(() => {
    if (!hasChronotype || !focusWindows.length) {
      return [DEFAULT_HIGH_BAND, DEFAULT_MEDIUM_BAND];
    }

    return focusWindows
      .filter(window => window.window_type === 'deep' || window.window_type === 'collaboration')
      .map(window => ({
        startHour: window.start_hour,
        endHour: window.end_hour,
        color: window.window_type === 'deep' ? '#22c55e' : '#86efac',
        opacity: window.window_type === 'deep' ? 0.35 : 0.25,
        type: window.window_type,
        recommendation: window.recommendation,
      }));
  }, [hasChronotype, focusWindows]);

  // Generate chronotype-based task suggestions
  const chronotypeTaskSuggestions = useMemo(() => {
    if (!hasChronotype || !focusWindows.length) {
      return initialSidebarTasks;
    }

    const suggestions: TaskSummary[] = [];
    
    // Find deep focus window for strategy work
    const deepWindow = focusWindows.find(w => w.window_type === 'deep');
    if (deepWindow) {
      suggestions.push({
        id: 'chronotype-strategy',
        title: 'Strategy planning session',
        lengthMinutes: 90,
        lengthLabel: '90 min',
        focusLabel: 'Deep focus',
        suggestionLabel: `Suggested: Today ${deepWindow.start_hour}:00`,
        dueLabel: 'Optimal timing',
      });
    }

    // Find collaboration window for meetings
    const collaborationWindow = focusWindows.find(w => w.window_type === 'collaboration');
    if (collaborationWindow) {
      suggestions.push({
        id: 'chronotype-meeting',
        title: 'Team collaboration',
        lengthMinutes: 30,
        lengthLabel: '30 min',
        focusLabel: 'Medium focus',
        suggestionLabel: `Suggested: Today ${collaborationWindow.start_hour}:00`,
        dueLabel: 'Optimal timing',
      });
    }

    // Add a recovery/light task suggestion
    suggestions.push({
      id: 'chronotype-recovery',
      title: 'Light administrative tasks',
      lengthMinutes: 20,
      lengthLabel: '20 min',
      focusLabel: 'Shallow focus',
      suggestionLabel: 'Suggested: Between focus windows',
      dueLabel: 'Energy optimization',
    });

    return suggestions.length > 0 ? suggestions : initialSidebarTasks;
  }, [hasChronotype, focusWindows]);

  // Update sidebar tasks when chronotype data is available
  useEffect(() => {
    if (chronotypeTaskSuggestions.length > 0) {
      setSidebarTasks(chronotypeTaskSuggestions);
    }
  }, [chronotypeTaskSuggestions]);

  const filteredSidebarTasks = useMemo(() => {
    return sidebarTasks.filter((task) => {
      const focusMatch = sidebarFilters.focus.length
        ? sidebarFilters.focus.some((focus) => task.focusLabel?.toLowerCase().includes(focus))
        : true;

      let dueMatch = true;
      if (sidebarFilters.due !== 'all') {
        const suggestion = task.suggestionLabel?.toLowerCase() ?? '';
        if (sidebarFilters.due === 'today') {
          dueMatch = suggestion.includes('today');
        } else if (sidebarFilters.due === 'next7') {
          dueMatch = suggestion.includes('tomorrow') || suggestion.includes('next');
        }
      }

      return focusMatch && dueMatch;
    });
  }, [sidebarTasks, sidebarFilters]);

  const draggingPreview = useMemo(() => {
    if (!draggingTaskId) return null;
    const sidebarTask = sidebarTasks.find((task) => task.id === draggingTaskId);
    if (sidebarTask) {
      return {
        title: sidebarTask.title,
        lengthMinutes: sidebarTask.lengthMinutes,
        lengthLabel: sidebarTask.lengthLabel ?? toDurationLabel(sidebarTask.lengthMinutes),
      };
    }

    const scheduledTask = tasks.find((task) => task.id === draggingTaskId);
    if (scheduledTask) {
      const minutes = scheduledTask.durationSlots * SLOT_MINUTES;
      return {
        title: scheduledTask.title,
        lengthMinutes: minutes,
        lengthLabel: toDurationLabel(minutes),
      };
    }

    return null;
  }, [draggingTaskId, sidebarTasks, tasks]);

  const previewSlotCount = draggingPreview ? Math.max(1, Math.ceil(draggingPreview.lengthMinutes / SLOT_MINUTES)) : 0;

  const selectedTask = useMemo(() => {
    if (!selectedTaskId) return null;
    return tasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [selectedTaskId, tasks]);

  const selectedTaskDetails = useMemo(() => {
    if (selectedTaskId) {
      const scheduled = tasks.find((task) => task.id === selectedTaskId);
      if (scheduled) {
        return {
          id: scheduled.id,
          title: scheduled.title,
          date: new Date(scheduled.dateKey),
          startSlot: scheduled.startSlot,
          durationSlots: scheduled.durationSlots,
          lengthLabel: toDurationLabel(scheduled.durationSlots * SLOT_MINUTES),
        };
      }
    }
    if (selectedSidebarTaskId) {
      const sidebarTask = sidebarTasks.find((task) => task.id === selectedSidebarTaskId);
      if (sidebarTask) {
        return {
          id: sidebarTask.id,
          title: sidebarTask.title,
          date: null,
          startSlot: null,
          durationSlots: null,
          lengthLabel: sidebarTask.lengthLabel,
          dueLabel: sidebarTask.dueLabel ?? 'No due date',
          focusLabel: sidebarTask.focusLabel,
        };
      }
    }
    return null;
  }, [selectedTaskId, tasks, selectedSidebarTaskId, sidebarTasks]);

  const deleteCalendarTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setSelectedTaskId((prev) => (prev === taskId ? null : prev));
  }, []);

  const deleteSidebarTask = useCallback((taskId: string) => {
    setSidebarTasks((prev) => prev.filter((task) => task.id !== taskId));
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    setSelectedSidebarTaskId((prev) => (prev === taskId ? null : prev));
    setSelectedTaskId((prev) => (prev === taskId ? null : prev));
  }, []);

  useEffect(() => {
    if (!selectedTaskId && !selectedSidebarTaskId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        if (selectedTaskId) {
          deleteCalendarTask(selectedTaskId);
        } else if (selectedSidebarTaskId) {
          deleteSidebarTask(selectedSidebarTaskId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteCalendarTask, deleteSidebarTask, selectedTaskId, selectedSidebarTaskId]);

  useEffect(() => {
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    if (!draggingTaskId) {
      setDragPreview(null);
    }
  }, [draggingTaskId]);

  const handleMainMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.closest('[data-task-block="true"]')) {
      setSelectedTaskId(null);
      setSelectedSidebarTaskId(null);
    }
  };

  const handleCreateTask = (draft: AddTaskDraft) => {
    const id = `sidebar-${Date.now()}`;
    const newTask: TaskSummary = {
      id,
      title: draft.title,
      lengthMinutes: draft.lengthMinutes,
      lengthLabel: `${draft.lengthMinutes} min`,
      focusLabel:
        draft.focusLevel === 'deep' ? 'Deep focus' : draft.focusLevel === 'medium' ? 'Medium focus' : 'Shallow focus',
      suggestionLabel: 'Suggested: Next available',
      dueLabel: 'Due Soon',
      completed: false,
    };
    setSidebarTasks((prev) => [newTask, ...prev]);
    setSelectedSidebarTaskId(id);
  };

  const handleToggleTaskComplete = (taskId: string, completed: boolean) => {
    setSidebarTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, completed } : task))
    );
  };

  const onDropTask = (event: ReactDragEvent<HTMLDivElement>, dayIndex: number, slotIndex: number) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData(SIDEBAR_TASK_DRAG_TYPE) || event.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const planningTask = sidebarTasks.find((task) => task.id === taskId);
    const dayKey = viewDayKeys[dayIndex];
    if (!dayKey) return;

    setTasks((prev) => {
      const existingIndex = prev.findIndex((task) => task.id === taskId);
      const clampedSlot = Math.min(slotIndex, SLOTS_PER_DAY - 1);

      if (existingIndex !== -1) {
        const next = [...prev];
        const task = next[existingIndex];
        next[existingIndex] = {
          ...task,
          dateKey: dayKey,
          startSlot: clampedSlot,
          durationSlots: clampDuration(clampedSlot, task.durationSlots),
        };
        return next;
      }

      if (!planningTask) {
        return prev;
      }

      const slotLength = Math.max(1, Math.ceil(planningTask.lengthMinutes / SLOT_MINUTES));
      const durationSlots = clampDuration(clampedSlot, slotLength);

      const focusLevel: FocusLevel = planningTask.focusLabel?.toLowerCase().includes('deep')
        ? 'deep'
        : planningTask.focusLabel?.toLowerCase().includes('shallow')
        ? 'shallow'
        : 'medium';

      return [
        ...prev,
        {
          id: taskId,
          title: planningTask.title,
          dateKey: dayKey,
          startSlot: clampedSlot,
          durationSlots,
          color: 'green',
          focusLevel,
        },
      ];
    });

    setDragPreview(null);
    setDraggingTaskId(null);
    setSelectedTaskId(taskId);
    setSelectedSidebarTaskId(null);
  };

  const onDragOver = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (draggingTaskId) {
      event.dataTransfer.dropEffect = 'copy';
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

  const addTask = (dayIndex: number, slotIndex: number) => {
    const dayKey = viewDayKeys[dayIndex];
    if (!dayKey) return;

    const id = Math.random().toString(36).slice(2);
    const defaultDuration = clampDuration(slotIndex, SLOTS_PER_HOUR); // default 1 hour
    setTasks((prev) => [
      ...prev,
      {
        id,
        title: 'New task',
        dateKey: dayKey,
        startSlot: slotIndex,
        durationSlots: defaultDuration,
        color: 'amber',
        focusLevel: 'medium',
      },
    ]);
    setSelectedTaskId(id);
    setSelectedSidebarTaskId(null);
  };

  const changeDuration = (id: string, deltaSlots: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              durationSlots: clampDuration(task.startSlot, task.durationSlots + deltaSlots),
            }
          : task
      )
    );
  };

  const resetToToday = () => setViewState((prev) => ({ ...prev, offsetDays: 0, todayKey: todayKey() }));

  const goForward = () =>
    setViewState((prev) => ({ ...prev, offsetDays: prev.offsetDays + WEEK_LENGTH }));

  const goBackward = () =>
    setViewState((prev) => ({ ...prev, offsetDays: prev.offsetDays - WEEK_LENGTH }));

  const currentSlotFloat = useMemo(() => {
    const dayIndex = currentDayIndex;
    if (dayIndex === -1) return null;
    const totalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const relativeMinutes = totalMinutes - START_HOUR * 60;
    if (relativeMinutes < 0 || relativeMinutes > (END_HOUR - START_HOUR) * 60) {
      return null;
    }
    return relativeMinutes / SLOT_MINUTES;
  }, [currentDayIndex, currentTime]);

  const currentSlotIndex = currentSlotFloat !== null ? Math.floor(currentSlotFloat) : null;
  const currentSlotOffset = currentSlotFloat !== null ? (currentSlotFloat - Math.floor(currentSlotFloat)) * SLOT_HEIGHT_PX : 0;

  const rangeLabel = formatRangeLabel(viewDates[0], viewDates[viewDates.length - 1]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F7]">
      <main
        className={`relative flex-1 overflow-hidden ${isSidebarOpen ? 'pr-0' : ''}`}
        onMouseDown={handleMainMouseDown}
      >
        <div className="flex items-center justify-between border-b border-emerald-100 bg-white px-6 py-3">
            <div className="flex items-center gap-2">
            <button
              onClick={goBackward}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              aria-label="Previous week"
            >
              ‹
            </button>
            <div className="text-sm font-semibold text-emerald-900">{rangeLabel}</div>
            <button
              onClick={goForward}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              aria-label="Next week"
            >
              ›
            </button>
            </div>
          <button
            onClick={resetToToday}
            className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-emerald-600"
          >
            Today
          </button>
          </div>

        <div className="relative h-full overflow-y-auto bg-white">
          <div className="relative" style={{ height: scheduleHeight }}>
            <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
              <div className="sticky top-0 z-40 h-10 bg-white" />
              {viewDates.map((date, index) => {
                const key = formatISODate(date);
                const isTodayColumn = index === currentDayIndex;
                return (
                  <div
                    key={key}
                    className={`sticky top-0 z-40 flex h-10 items-center justify-center border-l border-emerald-100 text-xs font-semibold ${
                      isTodayColumn ? 'bg-emerald-50 text-emerald-600' : 'bg-white text-gray-500'
                    }`}
                  >
                    {formatDayLabel(date)}
                  </div>
                );
              })}

              {timeSlots.map((slotIndex) => {
                const minutes = toMinutesFromSlot(slotIndex);
                const minuteOfHour = minutes % 60;
                const isHourStart = minuteOfHour === 0;
                const label = isHourStart ? formatTime(minutes) : '';
                const showIndicator =
                  currentSlotIndex !== null && currentSlotIndex === slotIndex && currentSlotFloat !== null;

                return (
                  <Fragment key={slotIndex}>
                    <div
                      className={`relative flex items-start px-2 text-[10px] ${
                        isHourStart ? 'font-medium text-gray-600' : 'text-gray-300'
                      }`}
                      style={{ height: SLOT_HEIGHT_PX }}
                    >
                      {label}
                      {showIndicator && (
                        <div
                          className="pointer-events-none absolute left-0 right-[-4px] z-50 flex items-center"
                          style={{ top: currentSlotOffset }}
                        >
                          <div className="h-px flex-1 bg-emerald-500" />
                          <div className="ml-1 h-2 w-2 rounded-full bg-emerald-500" />
                        </div>
                      )}
                    </div>

                    {viewDates.map((date, dayIndex) => {
                      const dayKey = formatISODate(date);
                      const isPreviewCell =
                        dragPreview &&
                        draggingPreview &&
                        dragPreview.dayIndex === dayIndex &&
                        dragPreview.slotIndex === slotIndex;
                      const isTodayColumn = dayIndex === currentDayIndex;

                      return (
                        <div
                          key={`${dayKey}-${slotIndex}`}
                          className={`relative border-l border-t ${
                            isHourStart ? 'border-emerald-100' : 'border-transparent'
                          } transition ${isPreviewCell ? 'bg-emerald-50/80' : isTodayColumn ? 'bg-gray-50' : 'bg-white'}`}
                          style={{ height: SLOT_HEIGHT_PX }}
                          onDrop={(event) => onDropTask(event, dayIndex, slotIndex)}
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
                              {energyBands.map((band, energyIndex) => {
                                const bandStartSlot = Math.max(0, Math.floor((band.startHour - START_HOUR) * SLOTS_PER_HOUR));
                                const bandEndSlot = Math.floor((band.endHour - START_HOUR) * SLOTS_PER_HOUR);
                                const top = bandStartSlot * SLOT_HEIGHT_PX - 1;
                                const height = Math.max(bandEndSlot - bandStartSlot, 1) * SLOT_HEIGHT_PX + 2;
                            return (
                              <div
                                    key={`band-${energyIndex}`}
                                className="absolute left-0 right-0"
                                    style={{ top, height, backgroundColor: band.color, opacity: band.opacity }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {tasks
                            .filter((task) => task.dateKey === dayKey && task.startSlot === slotIndex)
                            .map((task) => {
                              const isSelected = selectedTaskId === task.id;
                              const durationLabel = toDurationLabel(task.durationSlots * SLOT_MINUTES);
                              return (
                                <div
                                  key={task.id}
                                  data-task-block="true"
                            draggable
                                  onDragStart={(event) => {
                                    event.dataTransfer.setData('text/plain', task.id);
                                    setDraggingTaskId(task.id);
                                    if (dragImageRef.current) {
                                      event.dataTransfer.setDragImage(dragImageRef.current, 0, 0);
                                    }
                                  }}
                                  onDragEnd={() => {
                                    setDraggingTaskId(null);
                                    setDragPreview(null);
                                  }}
                                  onClick={(clickEvent) => {
                                    clickEvent.stopPropagation();
                                    setSelectedTaskId((prev) => (prev === task.id ? null : task.id));
                                  }}
                                  className={`relative z-30 ml-[6%] w-[88%] cursor-move rounded-lg border bg-white p-2 text-xs text-gray-900 shadow-sm ${
                                    task.color === 'green'
                                      ? 'border-emerald-500'
                                      : task.color === 'amber'
                                      ? 'border-amber-400'
                                      : 'border-rose-500'
                                  } ${isSelected ? 'ring-2 ring-emerald-500' : ''}`}
                                  style={{ height: Math.max(task.durationSlots * SLOT_HEIGHT_PX - 4, 24) }}
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="truncate text-[11px] font-medium text-emerald-900">{task.title}</p>
                                    <span className="text-[10px] text-emerald-500 uppercase">{task.focusLevel}</span>
                                  </div>
                                  <div className="mt-1 text-[10px] text-gray-500">
                                    {formatRange(task.startSlot, task.durationSlots)}
                                  </div>
                                </div>
                              );
                            })}

                          {isPreviewCell && draggingPreview && previewSlotCount > 0 && (
                            <div
                              className="pointer-events-none absolute left-1 right-1 z-20 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-500/10 px-2 text-center text-[11px] font-semibold text-emerald-700"
                              style={{ top: 2, height: previewSlotCount * SLOT_HEIGHT_PX - 4 }}
                            >
                              <span className="line-clamp-2">{draggingPreview.title}</span>
                              <span>{draggingPreview.lengthLabel}</span>
                              </div>
                          )}

                          {showIndicator && (
                            <div
                              className="pointer-events-none absolute left-0 right-0 z-50"
                              style={{ top: currentSlotOffset }}
                            >
                              <div className="h-px w-full bg-emerald-500" />
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
                    </div>

        {selectedTaskDetails && (
          <div className="pointer-events-auto absolute bottom-6 right-6 z-40 w-72 rounded-2xl border border-emerald-200 bg-white p-4 shadow-lg">
            <p className="text-sm font-semibold text-emerald-900">{selectedTaskDetails.title}</p>
            {selectedTaskDetails.date ? (
              <p className="mt-2 text-xs text-emerald-600">
                {formatDayLong(selectedTaskDetails.date)} ·
                {formatRange(selectedTaskDetails.startSlot ?? 0, selectedTaskDetails.durationSlots ?? 0)} ·{' '}
                {selectedTaskDetails.lengthLabel}
              </p>
            ) : (
              <p className="mt-2 text-xs text-emerald-600">
                {selectedTaskDetails.focusLabel && `${selectedTaskDetails.focusLabel} · `}
                {selectedTaskDetails.lengthLabel} · {selectedTaskDetails.dueLabel}
              </p>
            )}
                <div className="mt-4 flex items-center justify-between text-[11px] text-gray-500">
                  <div>Selected task</div>
                  {/* Delete handled via Backspace/Delete keyboard shortcut */}
                </div>
          </div>
        )}
        </main>

      <TasksSidebar
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
        tasks={filteredSidebarTasks}
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
        onCreateTask={handleCreateTask}
        filters={sidebarFilters}
        onFiltersChange={setSidebarFilters}
        onToggleTaskComplete={handleToggleTaskComplete}
        selectedTaskId={selectedSidebarTaskId}
        onSelectTask={(taskId) => {
          setSelectedSidebarTaskId((prev) => (prev === taskId ? null : taskId));
          setSelectedTaskId(null);
        }}
        onDeleteSelected={() => {
          if (selectedSidebarTaskId) {
            deleteSidebarTask(selectedSidebarTaskId);
          }
        }}
      />
    </div>
  );
}

