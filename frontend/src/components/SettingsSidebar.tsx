'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  colorId?: string;
  backgroundColor?: string;
  accessRole: 'owner' | 'reader' | 'writer' | 'freeBusyReader';
  selected: boolean;
  enabled: boolean;
}

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSidebar({ isOpen, onClose }: SettingsSidebarProps) {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'calendar'>('general');
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [calendarsLoading, setCalendarsLoading] = useState(false);
  const [calendarsError, setCalendarsError] = useState<string | null>(null);
  const [requiresGoogleAuth, setRequiresGoogleAuth] = useState(false);

  const fetchCalendars = useCallback(async () => {
    if (!session) return;
    
    setCalendarsLoading(true);
    setCalendarsError(null);

    try {
      // Make API call to backend
      const response = await fetch('/api/google/calendars', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setRequiresGoogleAuth(true);
          const body = await response.json().catch(() => ({}));
          if (body.error === 'google_auth_required') {
            setCalendarsError('Connect your Google account to sync calendars.');
            return;
          }
        }

        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data.calendars)) {
        setCalendars(data.calendars);
        setRequiresGoogleAuth(false);
      } else {
        throw new Error('Unexpected response from calendar endpoint');
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
      if (!requiresGoogleAuth) {
        setCalendarsError('Failed to load calendars. Please try again.');
      }
    } finally {
      setCalendarsLoading(false);
    }
  }, [session, requiresGoogleAuth]);

  const toggleCalendar = useCallback(async (calendarId: string) => {
    // Update local state immediately for responsive UI
    setCalendars(prev => prev.map(cal => 
      cal.id === calendarId 
        ? { ...cal, enabled: !cal.enabled }
        : cal
    ));
    
    try {
      // Get updated enabled calendars
      const enabledCalendars = calendars
        .map(cal => cal.id === calendarId ? { ...cal, enabled: !cal.enabled } : cal)
        .filter(cal => cal.enabled)
        .map(cal => cal.id);
      
      // Save to backend
      const response = await fetch('/api/user/calendars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          enabled_calendars: enabledCalendars,
          sync_frequency: 'realtime'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (!response.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to save calendar settings');
      }
      
      console.log('Calendar settings saved successfully');
    } catch (error) {
      console.error('Error saving calendar settings:', error);
      // Revert local state on error
      setCalendars(prev => prev.map(cal => 
        cal.id === calendarId 
          ? { ...cal, enabled: !cal.enabled }
          : cal
      ));
      setCalendarsError('Failed to save calendar preferences. Please try again.');
    }
  }, [calendars, session]);

  useEffect(() => {
    if (isOpen && activeTab === 'calendar') {
      fetchCalendars();
    }
  }, [isOpen, activeTab, fetchCalendars]);

  const handleConnectGoogle = () => {
    window.location.href = '/api/google/auth';
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: '⚙️' },
    { id: 'calendar' as const, label: 'Calendar', icon: '📅' },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">General Settings</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              defaultValue={user?.user_metadata?.full_name || user?.email || ''}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">This will be editable in a future update</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              value={user?.email || ''}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed here</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCalendarSettings = () => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Calendar Sync</h3>

          {requiresGoogleAuth && !calendarsLoading && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
              <div className="text-3xl mb-3">📅</div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Connect Google Calendar</h4>
              <p className="text-sm text-gray-600 mb-4">
                Authorize Sero to access your Google Calendar so you can sync events directly into your schedule.
              </p>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                onClick={handleConnectGoogle}
              >
                Connect Google Calendar
              </button>
            </div>
          )}
          
          {calendarsLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span className="ml-2 text-gray-600">Loading calendars...</span>
            </div>
          )}
          
          {calendarsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="text-red-500 mr-2">⚠️</div>
                <p className="text-red-700 text-sm">{calendarsError}</p>
              </div>
              <button
                type="button"
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                onClick={fetchCalendars}
              >
                Try again
              </button>
            </div>
          )}
          
          {!requiresGoogleAuth && !calendarsLoading && !calendarsError && calendars.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Select which calendars to sync with your schedule:
              </p>
              
              {calendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: calendar.backgroundColor }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{calendar.summary}</div>
                      {calendar.description && (
                        <div className="text-sm text-gray-500">{calendar.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={calendar.enabled}
                      onChange={() => toggleCalendar(calendar.id)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-900/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
                  </label>
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={fetchCalendars}
                >
                  Refresh Calendars
                </button>
              </div>
            </div>
          )}

          {!requiresGoogleAuth && !calendarsLoading && !calendarsError && calendars.length === 0 && (
            <div className="text-sm text-gray-600">No calendars found.</div>
          )}
        </div>
      </div>
    );
  };


  const renderActiveTab = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'calendar':
        return renderCalendarSettings();
      default:
        return renderGeneralSettings();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30" 
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div className="relative flex w-full max-w-2xl h-[44vh] bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Close Button - Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
        
        {/* Sidebar Navigation */}
        <div className="w-48 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
            </div>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
}
