(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/sero/frontend/src/app/quiz/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuizPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/sero/frontend/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/sero/frontend/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/sero/frontend/node_modules/next/image.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function QuizPage() {
    _s();
    const [currentQuestion, setCurrentQuestion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [selectedOption, setSelectedOption] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [customResponse, setCustomResponse] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [answers, setAnswers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(12.5); // 1/8 questions = 12.5%
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
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
    const handleOptionSelect = (optionId)=>{
        setSelectedOption(optionId);
    };
    const handleNext = async ()=>{
        // Save current answer
        const answer = selectedOption || customResponse;
        if (answer) {
            setAnswers((prev)=>({
                    ...prev,
                    [currentQuestion]: answer
                }));
        }
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setProgress((currentQuestion + 2) / questions.length * 100);
            setSelectedOption(null);
            setCustomResponse('');
        } else {
            // Quiz completed - send to backend
            await submitQuiz();
        }
    };
    const submitQuiz = async ()=>{
        // Placeholder flow: skip backend and show a default chronotype result
        setSubmitting(true);
        try {
            const placeholder = {
                chronotype_result: {
                    chronotype_type: 'Lion',
                    confidence_score: 1.0,
                    recommended_sleep_schedule: {
                        bedtime: '9:00 PM - 10:00 PM',
                        wake_time: '5:00 AM - 6:00 AM'
                    }
                }
            };
            // Small delay for UX so the change is perceptible
            await new Promise((res)=>setTimeout(res, 400));
            setResult(placeholder);
        } finally{
            setSubmitting(false);
        }
    };
    const handleBack = ()=>{
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setProgress(currentQuestion / questions.length * 100);
            // Restore previous answer if it exists
            const prevAnswer = answers[currentQuestion - 1];
            if (prevAnswer) {
                // Check if it's an option ID or custom response
                const isOption = questions[currentQuestion - 1].options.some((opt)=>opt.id === prevAnswer);
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-white flex items-center justify-center px-8 py-8 relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -right-60 bottom-10 w-[40rem] h-[40rem] bg-gradient-to-b from-green-400 to-yellow-300 rounded-full opacity-35 blur-3xl"
            }, void 0, false, {
                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                lineNumber: 302,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute -right-40 bottom-20 w-[28rem] h-[28rem] bg-gradient-to-b from-green-300 to-yellow-200 rounded-full opacity-40 blur-2xl"
            }, void 0, false, {
                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                lineNumber: 303,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full max-w-7xl mx-auto relative z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-16 py-12",
                    children: result ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-w-6xl mx-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-1 w-full bg-black/20 rounded-full mb-10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-1 w-11/12 bg-black rounded-full"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                    lineNumber: 312,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                lineNumber: 311,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 lg:grid-cols-2 gap-10 items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-3xl font-semibold text-gray-900 mb-3",
                                                children: "Your chronotype is..."
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                lineNumber: 317,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "text-5xl font-extrabold text-gray-900 mb-8",
                                                children: "The Lion"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                lineNumber: 318,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-semibold text-gray-900 mb-4",
                                                children: "What does this mean?"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                lineNumber: 320,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border border-gray-300 rounded-xl p-6 h-64 overflow-y-auto bg-white",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-800 leading-relaxed mb-6",
                                                        children: "Early riser, high morning energy. Energy peaks early in the day, declines steadily in afternoon/evening. Ideal tasks: most demanding tasks in the morning, lighter tasks later."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                        lineNumber: 322,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-800 leading-relaxed mb-6",
                                                        children: "Early riser, high morning energy. Energy peaks early in the day, declines steadily in afternoon/evening. Ideal tasks: most demanding tasks in the morning, lighter tasks later."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                        lineNumber: 326,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-800 leading-relaxed mb-6",
                                                        children: "Early riser, high morning energy. Energy peaks early in the day, declines steadily in afternoon/evening. Ideal tasks: most demanding tasks in the morning, lighter tasks later."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-gray-800 leading-relaxed",
                                                        children: "Early riser, high morning energy. Energy peaks early in the day, declines steadily in afternoon/evening. Ideal tasks: most demanding tasks in the morning, lighter tasks later."
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                lineNumber: 321,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "mt-10 px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors",
                                                onClick: ()=>window.location.href = '/dashboard',
                                                children: "Get Started"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                lineNumber: 340,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                        lineNumber: 316,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "hidden lg:flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: "/48bc971cb110c807f8c6cf903c7add4b1c9dfcd7.png",
                                            alt: "Lion silhouette",
                                            width: 480,
                                            height: 320,
                                            className: "opacity-60 -scale-x-100"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                            lineNumber: 348,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                        lineNumber: 347,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                lineNumber: 315,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                        lineNumber: 309,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full bg-gray-200 rounded-full h-2 mb-12",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-gray-900 h-2 rounded-full transition-all duration-300",
                                    style: {
                                        width: "".concat(progress, "%")
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                    lineNumber: 356,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                lineNumber: 355,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold text-gray-900 mb-12 text-center",
                                children: questions[currentQuestion].question
                            }, void 0, false, {
                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                lineNumber: 363,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-12",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: customResponse,
                                            onChange: (e)=>setCustomResponse(e.target.value),
                                            placeholder: "Type your response here",
                                            className: "w-full px-6 py-4 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                            lineNumber: 370,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "absolute right-4 top-1/2 transform -translate-y-1/2",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6 text-gray-400",
                                                fill: "currentColor",
                                                viewBox: "0 0 24 24",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                        lineNumber: 379,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        d: "M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                        lineNumber: 380,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                lineNumber: 378,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                            lineNumber: 377,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                    lineNumber: 369,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                lineNumber: 368,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid gap-4 mb-16 ".concat(questions[currentQuestion].options.length === 3 ? 'grid-cols-3' : questions[currentQuestion].options.length === 4 ? 'grid-cols-4' : questions[currentQuestion].options.length === 6 ? 'grid-cols-3' : 'grid-cols-2'),
                                children: questions[currentQuestion].options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>handleOptionSelect(option.id),
                                        className: "p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ".concat(selectedOption === option.id ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-4xl mb-4",
                                                    children: option.icon
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                    lineNumber: 404,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-900 font-medium text-sm leading-tight",
                                                    children: option.text
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                                    lineNumber: 405,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                            lineNumber: 403,
                                            columnNumber: 17
                                        }, this)
                                    }, option.id, false, {
                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                        lineNumber: 394,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                lineNumber: 387,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleBack,
                                        disabled: currentQuestion === 0,
                                        className: "px-8 py-3 rounded-lg font-medium transition-colors ".concat(currentQuestion === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white hover:bg-gray-700'),
                                        children: "Back"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                        lineNumber: 415,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$sero$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleNext,
                                        disabled: submitting,
                                        className: "px-8 py-3 rounded-lg font-medium transition-colors ".concat(submitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'),
                                        children: currentQuestion < questions.length - 1 ? 'Next' : submitting ? 'Submitting…' : 'Submit'
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                        lineNumber: 426,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                                lineNumber: 414,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                    lineNumber: 307,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
                lineNumber: 305,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/sero/frontend/src/app/quiz/page.tsx",
        lineNumber: 300,
        columnNumber: 5
    }, this);
}
_s(QuizPage, "/4bBC43lDkEAqyfo+H1sSl7yETc=");
_c = QuizPage;
var _c;
__turbopack_context__.k.register(_c, "QuizPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_sero_frontend_src_app_quiz_page_tsx_f250a2f3._.js.map