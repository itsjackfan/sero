import { useAuth } from '@/contexts/AuthContext';

export interface ChronotypeData {
  id: string;
  user_id: string;
  profile_id: string;
  label: string | null;
  description: string | null;
  source: string;
  data_points: Record<string, any> | null;
  guidance: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  quiz_version: number;
  profile_id: string;
  score: number;
  raw_result: {
    chronotype_type: string;
    confidence_score: number;
    raw_scores: Record<string, number>;
    question_breakdown: Record<string, Record<string, number>>;
  };
  summary: {
    chronotype: string;
    confidence: number;
    recommended_sleep_schedule: Record<string, string>;
    analysis_details: Record<string, any>;
  };
  created_at: string;
  updated_at: string;
}

export interface EnergyCurvePoint {
  id: string;
  user_chronotype_id: string;
  hour: number;
  predicted_energy: number;
  actual_energy: number | null;
}

export interface FocusWindow {
  id: string;
  user_chronotype_id: string;
  window_type: string;
  start_hour: number;
  end_hour: number;
  recommendation: string | null;
}

export async function fetchUserChronotype(accessToken: string, apiUrl: string): Promise<ChronotypeData | null> {
  try {
    const response = await fetch(`${apiUrl}/quiz/chronotype`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null; // User hasn't taken quiz yet
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch chronotype: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user chronotype:', error);
    return null;
  }
}

export async function fetchUserQuizResult(accessToken: string, apiUrl: string): Promise<QuizResult | null> {
  try {
    const response = await fetch(`${apiUrl}/quiz/results`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 404) {
      return null; // User hasn't taken quiz yet
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch quiz results: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    return null;
  }
}

export async function fetchUserEnergyCurve(accessToken: string, apiUrl: string, chronotypeId: string): Promise<EnergyCurvePoint[]> {
  try {
    const response = await fetch(`${apiUrl}/user/chronotype/${chronotypeId}/energy-curve`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch energy curve: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching energy curve:', error);
    return [];
  }
}

export async function fetchUserFocusWindows(accessToken: string, apiUrl: string, chronotypeId: string): Promise<FocusWindow[]> {
  try {
    const response = await fetch(`${apiUrl}/user/chronotype/${chronotypeId}/focus-windows`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch focus windows: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching focus windows:', error);
    return [];
  }
}

// Helper function to get chronotype display info
export function getChronotypeDisplayInfo(chronotypeType: string) {
  const chronotypeInfo = {
    lion: {
      name: 'Lion',
      emoji: '🦁',
      color: '#5DAE8A',
      description: 'Morning-focused routines are primed to help you stay in flow.',
      image: '/lion.png',
    },
    bear: {
      name: 'Bear',
      emoji: '🐻',
      color: '#F4A261',
      description: 'Balanced energy that follows natural daylight rhythms.',
      image: '/bear.png', // You'll need to add this image
    },
    wolf: {
      name: 'Wolf',
      emoji: '🐺',
      color: '#1F2937',
      description: 'Evening-focused with peak creativity in late afternoon.',
      image: '/wolf.png', // You'll need to add this image
    },
    dolphin: {
      name: 'Dolphin',
      emoji: '🐬',
      color: '#3B82F6',
      description: 'Light sleeper with irregular but precise energy patterns.',
      image: '/dolphin.png', // You'll need to add this image
    },
  };

  return chronotypeInfo[chronotypeType.toLowerCase() as keyof typeof chronotypeInfo] || chronotypeInfo.lion;
}

// Helper function to format energy curve data for charts
export function formatEnergyCurveForChart(energyCurve: EnergyCurvePoint[]) {
  const hourToTime = (hour: number) => {
    if (hour === 0) return '12AM';
    if (hour < 12) return `${hour}AM`;
    if (hour === 12) return '12PM';
    return `${hour - 12}PM`;
  };

  return energyCurve
    .sort((a, b) => a.hour - b.hour)
    .map(point => ({
      hour: point.hour, // Keep the original hour for easier processing
      time: hourToTime(point.hour),
      predicted: Math.round(point.predicted_energy * 100), // Convert 0-1 to 0-100
      actual: point.actual_energy ? Math.round(point.actual_energy * 100) : null,
    }));
}
