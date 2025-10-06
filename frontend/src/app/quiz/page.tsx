'use client';

import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { getChronotypeDisplayInfo } from '@/lib/chronotype';


interface QuizOption {
  id: string;
  label: string;
  icon?: string | null;
}

interface QuizQuestion {
  id: string;
  question_key: string;
  prompt: string;
  question_type: string;
  points: number;
  order_index: number;
  options: QuizOption[];
}

interface QuizDefinition {
  id: string;
  title: string;
  version: number;
  questions: QuizQuestion[];
}

interface StoredAnswer {
  value: string;
  source: 'option' | 'custom';
}

interface AnswerStore {
  [questionId: string]: StoredAnswer;
}

interface QuizAttemptRecord {
  id: string;
  quiz_id: string;
  user_id: string;
  quiz_version: number;
  total_score: number;
  max_score: number;
  summary: Record<string, unknown>;
  submitted_at: string;
}

interface QuizResponsePayload {
  question_id: string;
  answer_value: string;
  elapsed_ms?: number | null;
  feedback?: string | null;
}

interface ChronotypeSummary {
  chronotype_type: string;
  confidence_score: number;
  recommended_sleep_schedule: Record<string, string>;
  analysis_details: Record<string, unknown>;
}

interface QuizSubmissionResult {
  attempt: QuizAttemptRecord;
  responses: QuizResponsePayload[];
  chronotype: ChronotypeSummary;
  message?: string;
}

interface QuizSubmissionPayload {
  quiz_id: string;
  quiz_version: number;
  responses: QuizResponsePayload[];
}


export default function QuizPage() {
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const { user, session, loading: authLoading } = useAuth();

  const [quiz, setQuiz] = useState<QuizDefinition | null>(null);
  const [fetchingQuiz, setFetchingQuiz] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerStore>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customResponse, setCustomResponse] = useState('');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmissionResult | null>(null);

  const fetchQuizDefinition = useCallback(async () => {
    if (!backendBaseUrl) {
      setFetchError('Quiz endpoint is not configured. Set NEXT_PUBLIC_API_URL and reload.');
      setFetchingQuiz(false);
      return;
    }

    setFetchingQuiz(true);
    setFetchError(null);
    try {
      const response = await fetch(`${backendBaseUrl}/quiz`);
      if (!response.ok) {
        throw new Error(`Failed to load quiz (${response.status})`);
      }

      const data: QuizDefinition = await response.json();
      data.questions.sort((a, b) => a.order_index - b.order_index);

      setQuiz(data);
      setCurrentQuestion(0);
      setAnswers({});
      setSelectedOption(null);
      setCustomResponse('');
      setResult(null);
    } catch (error) {
      console.error('Failed to load quiz definition:', error);
      setFetchError('We could not load the quiz right now. Please try again in a moment.');
    } finally {
      setFetchingQuiz(false);
    }
  }, [backendBaseUrl]);

  useEffect(() => {
    void fetchQuizDefinition();
  }, [fetchQuizDefinition]);

  useEffect(() => {
    if (!quiz) return;
    const question = quiz.questions[currentQuestion];
    if (!question) return;

    const stored = answers[question.id];
    if (!stored) {
      setSelectedOption(null);
      setCustomResponse('');
      return;
    }

    if (stored.source === 'option') {
      setSelectedOption(stored.value);
      setCustomResponse('');
    } else {
      setSelectedOption(null);
      setCustomResponse(stored.value);
    }
  }, [quiz, currentQuestion, answers]);

  const progress = useMemo(() => {
    if (!quiz) return 0;
    if (result) return 100;
    const total = quiz.questions.length || 1;
    return Math.min(((currentQuestion + 1) / total) * 100, 100);
  }, [quiz, currentQuestion, result]);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setCustomResponse('');
    setSubmissionError(null);
  };

  const handleBack = () => {
    if (currentQuestion === 0) return;
    setSubmissionError(null);
    setCurrentQuestion((prev) => prev - 1);
  };

  const submitQuiz = useCallback(
    async (finalAnswers: AnswerStore) => {
      if (!quiz) return;
      if (!backendBaseUrl) {
        setSubmissionError('Quiz endpoint is not configured.');
        return;
      }
      if (!user || !session?.access_token) {
        setSubmissionError('Please sign in to submit the quiz.');
        return;
      }

      const responses: QuizResponsePayload[] = quiz.questions.map((question) => {
        const answer = finalAnswers[question.id];
        if (!answer) {
          throw new Error(`Missing answer for question ${question.question_key}`);
        }
        return {
          question_id: question.id,
          answer_value: answer.value,
        };
      });

      setSubmitting(true);
      setSubmissionError(null);
      try {
        const response = await fetch(`${backendBaseUrl}/quiz/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            quiz_id: quiz.id,
            quiz_version: quiz.version,
            responses,
          } satisfies QuizSubmissionPayload),
        });

        if (response.status === 409) {
          const body = await response.json();
          setSubmissionError(body?.message ?? 'The quiz has been updated. Reloading the latest version.');
          await fetchQuizDefinition();
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to submit quiz (${response.status})`);
        }

        const data: QuizSubmissionResult = await response.json();
        setResult(data);
      } catch (error) {
        console.error('Failed to submit quiz:', error);
        setSubmissionError('We could not submit your quiz. Please try again in a moment.');
      } finally {
        setSubmitting(false);
      }
    },
    [backendBaseUrl, fetchQuizDefinition, quiz, user, session?.access_token]
  );

  const handleNext = async () => {
    if (!quiz) return;
    const question = quiz.questions[currentQuestion];
    if (!question) return;

    const answerValue = selectedOption ?? customResponse.trim();
    if (!answerValue) {
      setSubmissionError('Please choose an option or provide a response before continuing.');
      return;
    }

    const nextAnswers: AnswerStore = {
      ...answers,
      [question.id]: {
        value: answerValue,
        source: selectedOption ? 'option' : 'custom',
      },
    };

    setAnswers(nextAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      setSubmissionError(null);
      setCurrentQuestion((prev) => prev + 1);
      return;
    }

    await submitQuiz(nextAnswers);
  };

  const question = quiz?.questions[currentQuestion];

  let content: JSX.Element;

  if (authLoading || fetchingQuiz) {
    content = (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-base text-gray-600">Loading your quiz…</p>
      </div>
    );
  } else if (!backendBaseUrl) {
    content = (
      <div className="max-w-xl mx-auto text-center py-24">
        <h1 className="text-2xl font-semibold text-gray-900">Quiz service not configured</h1>
        <p className="mt-3 text-gray-600">Set NEXT_PUBLIC_API_URL in your environment and reload the page.</p>
      </div>
    );
  } else if (!user) {
    content = (
      <div className="max-w-xl mx-auto text-center py-24">
        <h1 className="text-2xl font-semibold text-gray-900">Please sign in</h1>
        <p className="mt-3 text-gray-600">Sign in to your Sero account to take the chronotype quiz.</p>
      </div>
    );
  } else if (!session?.access_token) {
    content = (
      <div className="max-w-xl mx-auto text-center py-24">
        <h1 className="text-2xl font-semibold text-gray-900">Session expired</h1>
        <p className="mt-3 text-gray-600">Refresh the page or sign in again to continue.</p>
      </div>
    );
  } else if (fetchError) {
    content = (
      <div className="max-w-xl mx-auto text-center py-24">
        <h1 className="text-2xl font-semibold text-gray-900">We couldn&apos;t load the quiz</h1>
        <p className="mt-3 text-gray-600">{fetchError}</p>
        <button
          onClick={() => void fetchQuizDefinition()}
          className="mt-6 inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Try again
        </button>
      </div>
    );
  } else if (!quiz || !quiz.questions.length || !question) {
    content = (
      <div className="max-w-xl mx-auto text-center py-24">
        <h1 className="text-2xl font-semibold text-gray-900">No quiz available</h1>
        <p className="mt-3 text-gray-600">Check back soon for the latest chronotype assessment.</p>
      </div>
    );
  } else if (result) {
    const scheduleEntries = Object.entries(result.chronotype.recommended_sleep_schedule || {});
    const chronotypeInfo = getChronotypeDisplayInfo(result.chronotype.chronotype_type || 'lion');

    content = (
      <div className="px-16 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="h-1 w-full bg-black/20 rounded-full mb-10">
            <div className="h-1 w-full bg-black rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">Your chronotype is…</h2>
              <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
                {result.chronotype.chronotype_type || 'Processing'}
              </h1>
              {result.message && (
                <p className="text-gray-700 mb-6">{result.message}</p>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended schedule</h3>
              <div className="border border-gray-300 rounded-xl p-6 bg-white space-y-4">
                {scheduleEntries.length ? (
                  scheduleEntries.map(([label, value]) => (
                    <div key={label} className="flex justify-between text-gray-800 text-sm">
                      <span className="font-medium capitalize">{label.replace(/_/g, ' ')}</span>
                      <span>{value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">We&apos;re finalizing your chronotype recommendations.</p>
                )}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <button
                  className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    window.location.href = '/home/dashboard';
                  }}
                >
                  Go to dashboard
                </button>
                <button
                  className="px-8 py-3 border border-gray-300 rounded-full font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                  onClick={() => void fetchQuizDefinition()}
                >
                  Retake quiz
                </button>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <Image
                src={chronotypeInfo.image}
                alt={`${chronotypeInfo.name} chronotype illustration`}
                width={480}
                height={320}
                className="opacity-60 -scale-x-100"
              />
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    const questionOptions = question.options ?? [];
    const gridCols =
      questionOptions.length === 3
        ? 'grid-cols-3'
        : questionOptions.length === 4
        ? 'grid-cols-4'
        : questionOptions.length === 6
        ? 'grid-cols-3'
        : 'grid-cols-2';

    content = (
      <div className="px-16 py-12">
        <div className="w-full bg-gray-200 rounded-full h-2 mb-12">
          <div
            className="bg-gray-900 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-12 text-center">{question.prompt}</h1>

        {/* <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              value={customResponse}
              onChange={(event) => {
                setCustomResponse(event.target.value);
                setSelectedOption(null);
                setSubmissionError(null);
              }}
              placeholder="Type your response here"
              className="w-full px-6 py-4 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2" aria-hidden>
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>
          </div>
        </div> */}

        <div className={`grid gap-4 mb-16 ${gridCols}`}>
          {questionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                selectedOption === option.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{option.icon ?? '✨'}</div>
                <p className="text-gray-900 font-medium text-sm leading-tight">{option.label}</p>
              </div>
            </button>
          ))}
        </div>

        {submissionError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submissionError}
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentQuestion === 0 || submitting}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              currentQuestion === 0 || submitting
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={submitting}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            {currentQuestion < quiz.questions.length - 1 ? 'Next' : submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8 py-8 relative">
      <div className="absolute -right-60 bottom-10 w-[40rem] h-[40rem] bg-gradient-to-b from-green-400 to-yellow-300 rounded-full opacity-35 blur-3xl"></div>
      <div className="absolute -right-40 bottom-20 w-[28rem] h-[28rem] bg-gradient-to-b from-green-300 to-yellow-200 rounded-full opacity-40 blur-2xl"></div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {content}
      </div>
    </div>
  );
}
