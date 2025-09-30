'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [customResponse, setCustomResponse] = useState('');
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [progress, setProgress] = useState(12.5); // 1/8 questions = 12.5%
  const [result, setResult] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = [
    {
      question: "Welcome! What brings you to Sero?",
      options: [
        {
          id: "work-life-balance",
          text: "Finding better work-life balance",
          icon: "🏃‍♂️"
        },
        {
          id: "energy-cycles",
          text: "Understanding my energy cycles better",
          icon: "⚡"
        },
        {
          id: "productivity",
          text: "Increasing my productivity",
          icon: "📚"
        }
      ]
    },
    {
      question: "Suppose you had to stay up 4 hours later than usual for some reason. How would you perform the next day?",
      options: [
        {
          id: "very-poorly",
          text: "Very poorly",
          icon: "😴"
        },
        {
          id: "poorly",
          text: "Poorly",
          icon: "😵"
        },
        {
          id: "neither",
          text: "Neither poorly nor well",
          icon: "😐"
        },
        {
          id: "well",
          text: "Well",
          icon: "😊"
        }
      ]
    },
    {
      question: "What time would you prefer to wake up if you had complete freedom to plan your day?",
      options: [
        {
          id: "5am",
          text: "5:00 AM",
          icon: "🌅"
        },
        {
          id: "6am",
          text: "6:00 AM",
          icon: "🌄"
        },
        {
          id: "7am",
          text: "7:00 AM",
          icon: "☀️"
        },
        {
          id: "8am",
          text: "8:00 AM",
          icon: "🌞"
        },
        {
          id: "9am",
          text: "9:00 AM",
          icon: "🌤️"
        },
        {
          id: "10am",
          text: "10:00 AM or later",
          icon: "🌥️"
        }
      ]
    },
    {
      question: "What time would you prefer to go to bed if you had complete freedom to plan your evening?",
      options: [
        {
          id: "8pm",
          text: "8:00 PM",
          icon: "🌆"
        },
        {
          id: "9pm",
          text: "9:00 PM",
          icon: "🌇"
        },
        {
          id: "10pm",
          text: "10:00 PM",
          icon: "🌃"
        },
        {
          id: "11pm",
          text: "11:00 PM",
          icon: "🌌"
        },
        {
          id: "12am",
          text: "12:00 AM",
          icon: "🌙"
        },
        {
          id: "1am",
          text: "1:00 AM or later",
          icon: "🌚"
        }
      ]
    },
    {
      question: "How alert do you feel during the first half hour after waking up in the morning?",
      options: [
        {
          id: "not-alert",
          text: "Not at all alert",
          icon: "😴"
        },
        {
          id: "slightly-alert",
          text: "Slightly alert",
          icon: "😑"
        },
        {
          id: "fairly-alert",
          text: "Fairly alert",
          icon: "😊"
        },
        {
          id: "very-alert",
          text: "Very alert",
          icon: "😄"
        }
      ]
    },
    {
      question: "You have to take a test that you know will be mentally exhausting and will last 2 hours. You would be free to choose the time of day. Considering only your own 'feeling best' rhythm, which ONE of the four testing times would you choose?",
      options: [
        {
          id: "8am-test",
          text: "8:00 AM - 10:00 AM",
          icon: "🌅"
        },
        {
          id: "11am-test",
          text: "11:00 AM - 1:00 PM",
          icon: "☀️"
        },
        {
          id: "3pm-test",
          text: "3:00 PM - 5:00 PM",
          icon: "🌤️"
        },
        {
          id: "7pm-test",
          text: "7:00 PM - 9:00 PM",
          icon: "🌆"
        }
      ]
    },
    {
      question: "If you went to bed at 11:00 PM, what level of tiredness would you be?",
      options: [
        {
          id: "not-tired",
          text: "Not at all tired",
          icon: "😄"
        },
        {
          id: "slightly-tired",
          text: "A little tired",
          icon: "😊"
        },
        {
          id: "fairly-tired",
          text: "Fairly tired",
          icon: "😐"
        },
        {
          id: "very-tired",
          text: "Very tired",
          icon: "😴"
        }
      ]
    },
    {
      question: "For some reason you have gone to bed several hours later than usual, but there is no need to get up at any particular time the next morning. Which ONE of the following are you most likely to do?",
      options: [
        {
          id: "wake-later",
          text: "Wake up at the usual time, but not fall back asleep",
          icon: "⏰"
        },
        {
          id: "wake-later-sleep",
          text: "Wake up at the usual time, feel drowsy, then fall back asleep",
          icon: "😴"
        },
        {
          id: "wake-much-later",
          text: "Wake up much later than usual",
          icon: "😪"
        }
      ]
    }
  ];

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNext = async () => {
    // Save current answer
    const answer = selectedOption || customResponse;
    if (answer) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion]: answer
      }));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setProgress(((currentQuestion + 2) / questions.length) * 100);
      setSelectedOption(null);
      setCustomResponse('');
    } else {
      // Quiz completed - send to backend
      await submitQuiz();
    }
  };

  const submitQuiz = async () => {
    // Placeholder flow: skip backend and show a default chronotype result
    setSubmitting(true);
    try {
      const placeholder = {
        chronotype_result: {
          chronotype_type: 'Lion',
          confidence_score: 1.0,
          recommended_sleep_schedule: {
            bedtime: '9:00 PM - 10:00 PM',
            wake_time: '5:00 AM - 6:00 AM',
          },
        },
      };
      // Small delay for UX so the change is perceptible
      await new Promise((res) => setTimeout(res, 400));
      setResult(placeholder as any);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setProgress((currentQuestion / questions.length) * 100);
      
      // Restore previous answer if it exists
      const prevAnswer = answers[currentQuestion - 1];
      if (prevAnswer) {
        // Check if it's an option ID or custom response
        const isOption = questions[currentQuestion - 1].options.some(opt => opt.id === prevAnswer);
        if (isOption) {
          setSelectedOption(prevAnswer);
          setCustomResponse('');
        } else {
          setCustomResponse(prevAnswer);
          setSelectedOption(null);
        }
      } else {
        setSelectedOption(null);
        setCustomResponse('');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8 py-8 relative">
      {/* Green gradient circle decoration - positioned relative to viewport */}
      <div className="absolute -right-60 bottom-10 w-[40rem] h-[40rem] bg-gradient-to-b from-green-400 to-yellow-300 rounded-full opacity-35 blur-3xl"></div>
      <div className="absolute -right-40 bottom-20 w-[28rem] h-[28rem] bg-gradient-to-b from-green-300 to-yellow-200 rounded-full opacity-40 blur-2xl"></div>
      
      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Quiz content */}
        <div className="px-16 py-12">
          {result ? (
            <div className="max-w-6xl mx-auto">
              {/* Top bar */}
              <div className="h-1 w-full bg-black/20 rounded-full mb-10">
                <div className="h-1 w-11/12 bg-black rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-3">Your chronotype is...</h2>
                  <h1 className="text-5xl font-extrabold text-gray-900 mb-8">The Lion</h1>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4">What does this mean?</h3>
                  <div className="border border-gray-300 rounded-xl p-6 h-64 overflow-y-auto bg-white">
                    <p className="text-gray-800 leading-relaxed mb-6">
                      Early riser, high morning energy. Energy peaks early in the day, declines steadily in afternoon/evening.
                      Ideal tasks: most demanding tasks in the morning, lighter tasks later.
                    </p>
                    <p className="text-gray-800 leading-relaxed mb-6">
                      Early riser, high morning energy. Energy peaks early in the day, declines steadily in afternoon/evening.
                      Ideal tasks: most demanding tasks in the morning, lighter tasks later.
                    </p>
                    <p className="text-gray-800 leading-relaxed mb-6">
                      Early riser, high morning energy. Energy peaks early in the day, declines steadily in afternoon/evening.
                      Ideal tasks: most demanding tasks in the morning, lighter tasks later.
                    </p>
                    <p className="text-gray-800 leading-relaxed">
                      Early riser, high morning energy. Energy peaks early in the day, declines steadily in afternoon/evening.
                      Ideal tasks: most demanding tasks in the morning, lighter tasks later.
                    </p>
                  </div>

                  <button
                    className="mt-10 px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                    onClick={() => window.location.href = '/dashboard'}
                  >
                    Get Started
                  </button>
                </div>
                <div className="hidden lg:flex items-center justify-center">
                  <Image src="/48bc971cb110c807f8c6cf903c7add4b1c9dfcd7.png" alt="Lion silhouette" width={480} height={320} className="opacity-60 -scale-x-100" />
                </div>
              </div>
            </div>
          ) : (
        <>
        {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-12">
            <div 
              className="bg-gray-900 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

        {/* Question */}
          <h1 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            {questions[currentQuestion].question}
          </h1>

          {/* Input Field */}
          <div className="mb-12">
            <div className="relative">
              <input
                type="text"
                value={customResponse}
                onChange={(e) => setCustomResponse(e.target.value)}
                placeholder="Type your response here"
                className="w-full px-6 py-4 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
              />
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            </div>
          </div>

            {/* Option Cards */}
          <div className={`grid gap-4 mb-16 ${
            questions[currentQuestion].options.length === 3 ? 'grid-cols-3' :
            questions[currentQuestion].options.length === 4 ? 'grid-cols-4' :
            questions[currentQuestion].options.length === 6 ? 'grid-cols-3' :
            'grid-cols-2'
          }`}>
            {questions[currentQuestion].options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
                  selectedOption === option.id
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{option.icon}</div>
                  <p className="text-gray-900 font-medium text-sm leading-tight">
                    {option.text}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                currentQuestion === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={submitting}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              {currentQuestion < questions.length - 1 ? 'Next' : (submitting ? 'Submitting…' : 'Submit')}
            </button>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
