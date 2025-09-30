'use client';

import { FormEvent, KeyboardEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function InsightsPage() {
  const chatEndpoint = process.env.NEXT_PUBLIC_API_URL + '/gemini/chat';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: 'Welcome back, John. I am tracking how your energy and tasks align. What would you like to explore today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigationItems = useMemo(
    () => [
      { label: 'Home', href: '/dashboard' },
      { label: 'Schedule', href: '#' },
      { label: 'Insights', href: '/insights', active: true },
      { label: 'Tasks', href: '#' },
      { label: 'Settings', href: '#' },
    ],
    []
  );

  const sendMessage = async () => {
    if (isLoading) {
      return;
    }

    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);

    if (!chatEndpoint) {
      setError('Chat endpoint is not configured. Update NEXT_PUBLIC_API_URL in your environment.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: trimmed,
          // history: nextMessages.map(({ role, content }) => ({ role, content }))
          model: 'gemini-2.5-flash'
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data: { response: string; success: boolean } = await response.json();
      const assistantReply = data.response || 'I could not generate new insights just now. Try another prompt in a moment.';

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: assistantReply,
        },
      ]);
    } catch (requestError) {
      console.error('Insights chat error:', requestError);
      setError('We could not reach your insights service. Try again shortly.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <div className="grid min-h-screen grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="bg-white border-r border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/dashboard" aria-label="Go to dashboard">
              <Image src="/a009048e011b5a410b510b06b126c6e2110c05bf.png" alt="Sero" width={180} height={48} />
            </Link>
          </div>
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                  item.active ? 'bg-[#43A070] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className="p-8">
          <div>
            <h1 className="text-[22px] font-semibold text-gray-900">Insights workspace</h1>
            <p className="mt-1 text-sm text-gray-700">Review how your chronotype guidance aligns with today&apos;s flow.</p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Weekly coach</h2>
                  <p className="text-sm text-gray-500">Ask follow-up questions about your energy patterns and habits.</p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-4">
                <div className="h-[340px] overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            message.role === 'user'
                              ? 'bg-[#1F2937] text-white'
                              : 'bg-white text-gray-800 ring-1 ring-gray-200'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 ring-1 ring-gray-200 shadow-sm">
                          Drafting your insight...
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <label htmlFor="insights-message" className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Ask a question
                  </label>
                  <textarea
                    id="insights-message"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900"
                    placeholder="Summarize how my energy tracked with yesterday&apos;s tasks"
                    disabled={isLoading}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Powered by your configured insights endpoint</span>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isLoading ? 'Sending...' : 'Send message'}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            <aside className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200 p-6">
              <div className="text-xs uppercase tracking-wide text-gray-500">This week</div>
              <div className="mt-2 text-xl font-semibold text-gray-900">Snapshot</div>
              <ul className="mt-4 space-y-3 text-sm text-gray-700">
                <li className="rounded-lg bg-gray-50 px-3 py-2">Morning focus windows remain 18% more productive than afternoon sessions.</li>
                <li className="rounded-lg bg-gray-50 px-3 py-2">Average evening wind-down starts at 7:45 PM, ten minutes earlier than last week.</li>
                <li className="rounded-lg bg-gray-50 px-3 py-2">Keep stacking deep work before lunch to sustain the current momentum.</li>
              </ul>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

