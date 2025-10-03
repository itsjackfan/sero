import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ChronotypeData, 
  QuizResult, 
  EnergyCurvePoint, 
  FocusWindow,
  fetchUserChronotype,
  fetchUserQuizResult,
  fetchUserEnergyCurve,
  fetchUserFocusWindows
} from '@/lib/chronotype';

export function useChronotype() {
  const { session } = useAuth();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  const [chronotype, setChronotype] = useState<ChronotypeData | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [energyCurve, setEnergyCurve] = useState<EnergyCurvePoint[]>([]);
  const [focusWindows, setFocusWindows] = useState<FocusWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!session?.access_token || !apiUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch chronotype and quiz result in parallel
        const [chronotypeData, quizResultData] = await Promise.all([
          fetchUserChronotype(session.access_token, apiUrl),
          fetchUserQuizResult(session.access_token, apiUrl),
        ]);

        setChronotype(chronotypeData);
        setQuizResult(quizResultData);

        // If we have chronotype data, fetch related data
        if (chronotypeData) {
          const [energyCurveData, focusWindowsData] = await Promise.all([
            fetchUserEnergyCurve(session.access_token, apiUrl, chronotypeData.id),
            fetchUserFocusWindows(session.access_token, apiUrl, chronotypeData.id),
          ]);

          setEnergyCurve(energyCurveData);
          setFocusWindows(focusWindowsData);
        }
      } catch (err) {
        console.error('Error fetching chronotype data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chronotype data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [session?.access_token, apiUrl]);

  const refetch = async () => {
    if (!session?.access_token || !apiUrl) return;
    
    try {
      setLoading(true);
      setError(null);

      const [chronotypeData, quizResultData] = await Promise.all([
        fetchUserChronotype(session.access_token, apiUrl),
        fetchUserQuizResult(session.access_token, apiUrl),
      ]);

      setChronotype(chronotypeData);
      setQuizResult(quizResultData);

      if (chronotypeData) {
        const [energyCurveData, focusWindowsData] = await Promise.all([
          fetchUserEnergyCurve(session.access_token, apiUrl, chronotypeData.id),
          fetchUserFocusWindows(session.access_token, apiUrl, chronotypeData.id),
        ]);

        setEnergyCurve(energyCurveData);
        setFocusWindows(focusWindowsData);
      }
    } catch (err) {
      console.error('Error refetching chronotype data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refetch chronotype data');
    } finally {
      setLoading(false);
    }
  };

  return {
    chronotype,
    quizResult,
    energyCurve,
    focusWindows,
    loading,
    error,
    refetch,
    hasChronotype: !!chronotype,
  };
}
