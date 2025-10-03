'use client';

import {
  type DragEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export const SIDEBAR_TASK_DRAG_TYPE = 'application/sero-sidebar-task';

export type FocusLevel = 'deep' | 'medium' | 'shallow';

export type SidebarFilters = {
  focus: FocusLevel[];
  due: 'all' | 'today' | 'next7';
};

export type TaskSummary = {
  id: string;
  title: string;
  lengthMinutes: number;
  lengthLabel: string;
  focusLabel?: string;
  suggestionLabel?: string;
  dueLabel?: string;
  completed?: boolean;
};

export type AddTaskDraft = {
  title: string;
  lengthMinutes: number;
  focusLevel: FocusLevel;
};

type TasksSidebarProps = {
  isOpen: boolean;
  onToggleOpen: () => void;
  tasks: TaskSummary[];
  footer?: ReactNode;
  draggingTaskId?: string | null;
  onTaskDragStart?: (taskId: string, event: DragEvent<HTMLDivElement>) => void;
  onTaskDragEnd?: () => void;
  onCreateTask?: (draft: AddTaskDraft) => void;
  filters?: SidebarFilters;
  onFiltersChange?: (filters: SidebarFilters) => void;
  onToggleTaskComplete?: (taskId: string, completed: boolean) => void;
  selectedTaskId?: string | null;
  onSelectTask?: (taskId: string) => void;
  onDeleteSelected?: () => void;
};

const defaultFilters: SidebarFilters = { focus: [], due: 'all' };

const focusOptions: { value: FocusLevel; label: string }[] = [
  { value: 'deep', label: 'Deep focus' },
  { value: 'medium', label: 'Medium focus' },
  { value: 'shallow', label: 'Shallow focus' },
];

const lengthPresets = [15, 30, 45, 60, 90];

export function TasksSidebar({
  isOpen,
  onToggleOpen,
  tasks,
  footer,
  draggingTaskId,
  onTaskDragStart,
  onTaskDragEnd,
  onCreateTask,
  filters,
  onFiltersChange,
  onToggleTaskComplete,
  selectedTaskId,
  onSelectTask,
  onDeleteSelected,
}: TasksSidebarProps) {
  const appliedFilters = filters ?? defaultFilters;

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftLength, setDraftLength] = useState<number>(lengthPresets[2]);
  const [draftFocus, setDraftFocus] = useState<FocusLevel>('medium');
  const addInputRef = useRef<HTMLInputElement | null>(null);

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isAddOpen) {
      setTimeout(() => addInputRef.current?.focus(), 0);
    }
  }, [isAddOpen]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!isFiltersOpen) return;
      const target = event.target as Node | null;
      if (!target) return;
      if (filtersRef.current?.contains(target)) return;
      setIsFiltersOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isFiltersOpen) setIsFiltersOpen(false);
        if (isAddOpen) setIsAddOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isAddOpen, isFiltersOpen]);

  const taskCount = tasks.length;

  const handleAddSubmit = () => {
    const title = draftTitle.trim();
    if (!title || !onCreateTask) return;
    onCreateTask({ title, lengthMinutes: draftLength, focusLevel: draftFocus });
    setDraftTitle('');
    setDraftLength(lengthPresets[2]);
    setDraftFocus('medium');
    setIsAddOpen(false);
  };

  const toggleFocusFilter = (value: FocusLevel) => {
    if (!onFiltersChange) return;
    const nextFocus = appliedFilters.focus.includes(value)
      ? appliedFilters.focus.filter((f) => f !== value)
      : [...appliedFilters.focus, value];
    onFiltersChange({ ...appliedFilters, focus: nextFocus });
  };

  const changeDueFilter = (value: SidebarFilters['due']) => {
    if (!onFiltersChange) return;
    onFiltersChange({ ...appliedFilters, due: value });
  };

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    if (appliedFilters.focus.length) {
      parts.push(`${appliedFilters.focus.length} focus`);
    }
    if (appliedFilters.due !== 'all') {
      parts.push(appliedFilters.due === 'today' ? 'Due Today' : 'Due Next 7');
    }
    return parts.join(' • ');
  }, [appliedFilters]);

  return (
    <aside
      className={`relative border-l border-emerald-100 bg-white transition-[width] duration-300 ease-in-out ${
        isOpen ? 'w-[340px]' : 'w-[56px]'
      }`}
    >
      <button
        type="button"
        onClick={onToggleOpen}
        className="absolute left-0 top-4 -translate-x-1/2 rounded-full border border-emerald-200 bg-white p-1 text-emerald-600 shadow-sm transition hover:bg-emerald-50"
        aria-label={isOpen ? 'Collapse tasks sidebar' : 'Expand tasks sidebar'}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M6 4L9 7L6 10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div className="flex h-full flex-col">
        <div
          className={`border-b border-emerald-100 px-5 py-4 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">Tasks</p>
              <h2 className="text-base font-semibold text-emerald-900">Planning queue</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
              {taskCount}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-emerald-700">
            <button
              className="rounded-full bg-emerald-500 px-3 py-1 font-semibold text-white shadow-sm transition hover:bg-emerald-600"
              onClick={() => setIsAddOpen((prev) => !prev)}
            >
              {isAddOpen ? 'Cancel' : '+ Add task'}
            </button>
            <button
              className="flex items-center gap-1 text-emerald-500 underline-offset-4 hover:underline"
              onClick={() => setIsFiltersOpen((prev) => !prev)}
            >
              Filters
              {filterSummary && <span className="text-[10px] text-emerald-400">({filterSummary})</span>}
            </button>
          </div>

          {isAddOpen && (
            <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-800">
              <div className="space-y-2">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide">Task title</label>
                  <input
                    ref={addInputRef}
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    placeholder="Write a draft..."
                    className="w-full rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide">Length</label>
                    <select
                      value={draftLength}
                      onChange={(event) => setDraftLength(Number(event.target.value))}
                      className="w-full rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    >
                      {lengthPresets.map((minutes) => (
                        <option key={minutes} value={minutes}>{`${minutes} min`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide">Focus</label>
                    <select
                      value={draftFocus}
                      onChange={(event) => setDraftFocus(event.target.value as FocusLevel)}
                      className="w-full rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                    >
                      {focusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubmit}
                  className="w-full rounded-full bg-emerald-600 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Save task
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className={`flex-1 overflow-y-auto px-3 pb-4 ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <div className="mt-3 space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(SIDEBAR_TASK_DRAG_TYPE, task.id);
                  event.dataTransfer.effectAllowed = 'copy';
                  onTaskDragStart?.(task.id, event);
                }}
                onDragEnd={() => {
                  onTaskDragEnd?.();
                }}
                className={`group flex items-start gap-3 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-xs transition hover:border-emerald-200 hover:bg-emerald-50 ${
                  draggingTaskId === task.id ? 'opacity-60 ring-1 ring-emerald-400' : ''
                } ${task.completed ? 'opacity-70 grayscale-[20%]' : ''} ${
                  selectedTaskId === task.id ? 'border-emerald-400 ring-1 ring-emerald-300 bg-emerald-50/80' : ''
                }`}
                onClick={() => onSelectTask?.(task.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectTask?.(task.id);
                  }
                  if ((event.key === 'Backspace' || event.key === 'Delete') && onDeleteSelected) {
                    event.preventDefault();
                    onDeleteSelected();
                  }
                }}
              >
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-600">
                  ⠿
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={Boolean(task.completed)}
                        onChange={(event) => onToggleTaskComplete?.(task.id, event.target.checked)}
                        className="h-3.5 w-3.5 rounded border border-emerald-300 bg-white text-emerald-500 focus:ring-emerald-400"
                      />
                      <span
                        className={`truncate text-[12px] font-semibold ${
                          task.completed ? 'text-emerald-400 line-through' : 'text-emerald-900'
                        }`}
                      >
                        {task.title}
                      </span>
                    </label>
                    {task.dueLabel && (
                      <span className={`text-[10px] font-medium ${task.completed ? 'text-emerald-300' : 'text-emerald-500'}`}>
                        {task.dueLabel}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-emerald-600">
                    <span className="rounded-full bg-emerald-100 px-2 py-[2px] font-medium text-emerald-700">
                      {task.lengthLabel}
                    </span>
                    {task.focusLabel && <span className="text-emerald-500">{task.focusLabel}</span>}
                  </div>
                  {task.suggestionLabel && (
                    <div className="mt-1 text-[10px] text-emerald-500">{task.suggestionLabel}</div>
                  )}
                </div>
              </div>
            ))}

            {tasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-emerald-200 bg-emerald-50/60 p-6 text-center text-xs text-emerald-700">
                <p className="font-semibold">No tasks yet</p>
                <p className="mt-2 text-[11px] text-emerald-500">Add tasks to start planning your week.</p>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-emerald-100 px-5 py-4 text-[11px] text-emerald-600">
            {footer ?? 'Drag tasks onto your calendar to schedule them.'}
          </div>
        )}
      </div>

      {isOpen && isFiltersOpen && (
        <div
          ref={filtersRef}
          className="absolute right-4 top-[108px] z-50 w-64 rounded-xl border border-emerald-200 bg-white p-4 text-xs shadow-xl"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-500">Filters</p>
            <button
              className="text-[11px] text-emerald-500 underline-offset-4 hover:underline"
              onClick={() => {
                onFiltersChange?.(defaultFilters);
              }}
            >
              Reset
            </button>
          </div>

          <div className="mt-3">
            <p className="text-[11px] font-semibold text-emerald-900">Focus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {focusOptions.map((option) => {
                const isActive = appliedFilters.focus.includes(option.value);
                return (
                  <button
                    key={option.value}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow'
                        : 'border-emerald-200 text-emerald-600 hover:border-emerald-400'
                    }`}
                    onClick={() => toggleFocusFilter(option.value)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-semibold text-emerald-900">Due</p>
            <div className="mt-2 flex gap-2">
              {[
                { value: 'all', label: 'All' },
                { value: 'today', label: 'Today' },
                { value: 'next7', label: 'Next 7 days' },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                    appliedFilters.due === option.value
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow'
                      : 'border-emerald-200 text-emerald-600 hover:border-emerald-400'
                  }`}
                  onClick={() => changeDueFilter(option.value as SidebarFilters['due'])}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}


