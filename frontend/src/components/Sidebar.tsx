'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsSidebar } from './SettingsSidebar';

interface SidebarProps {
  navigationItems: Record<string, string>;
}

export function Sidebar({ navigationItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const navigationEntries = useMemo(() => 
    Object.entries(navigationItems).map(([label, href]) => ({ label, href })), 
    [navigationItems]
  );

  const activeHref = useMemo(() => {
    if (!pathname) return '';
    const matching = navigationEntries.find((item) =>
      item.href === '/home/dashboard' ? pathname.startsWith(item.href) : pathname === item.href
    );
    return matching?.href ?? '';
  }, [pathname, navigationEntries]);

  const displayName = useMemo(() => {
    if (loading) return 'Loading...';
    const fullName = (user?.identities?.[0] as any)?.identity_data?.full_name;
    return fullName || user?.user_metadata?.full_name || user?.email || 'Account';
  }, [loading, user]);

  useEffect(() => {
    if (!isAccountOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
        return;
      }
      setIsAccountOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keyup', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keyup', handleEscape);
    };
  }, [isAccountOpen]);

  useEffect(() => {
    setIsAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isSettingsModalOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsModalOpen(false);
      }
    };

    document.addEventListener('keyup', handleEscape);

    return () => {
      document.removeEventListener('keyup', handleEscape);
    };
  }, [isSettingsModalOpen]);

  return (
    <>
      <motion.aside 
        className="relative flex h-screen flex-col border-r border-gray-200 bg-white"
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Collapse Button */}
        <motion.button
          className="absolute -right-3 top-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isCollapsed ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-gray-600"
          >
            <path
              d="M7.5 3L4.5 6L7.5 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>

        <div className="p-4">
          {/* Logo Section */}
          <motion.div 
            className="mb-8 flex items-center gap-3"
            animate={{ justifyContent: isCollapsed ? "center" : "flex-start" }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/home/dashboard" aria-label="Go to dashboard">
                    <Image src="/a009048e011b5a410b510b06b126c6e2110c05bf.png" alt="Sero" width={180} height={48} />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/home/dashboard" aria-label="Go to dashboard">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#43A070] text-white font-bold text-sm">
                    S
                  </div>
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationEntries.map((item) => {
              const isActive = item.href === '/home/dashboard'
                ? pathname?.startsWith(item.href)
                : pathname === item.href;

              return (
                <motion.button
                  key={item.label}
                  type="button"
                  className={`w-full text-left rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-[#43A070] text-white' : 'text-gray-700 hover:bg-gray-100'
                  } ${isCollapsed ? 'px-3 py-3 flex items-center justify-center' : 'px-3 py-3'}`}
                  onClick={() => {
                    if (pathname === item.href) return;
                    router.push(item.href);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    {isCollapsed ? (
                      <motion.span
                        key="icon"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-lg"
                      >
                        {item.label === 'Dashboard' && '📊'}
                        {item.label === 'Schedule' && '📅'}
                        {item.label === 'Insights' && '📈'}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Account Section */}
        <div className="mt-auto p-4">
          <div className="sticky bottom-0">
            <div className="relative">
              <AnimatePresence>
                {isAccountOpen && !isCollapsed && (
                  <motion.div
                    ref={menuRef}
                    className="absolute bottom-[calc(100%+16px)] left-0 right-0 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-xl"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{displayName}</div>
                          {user?.email && <div className="text-xs text-gray-500">{user.email}</div>}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                      onClick={() => {
                        setIsAccountOpen(false);
                        setIsSettingsModalOpen(true);
                      }}
                    >
                      Account settings
                    </button>
                    <button
                      type="button"
                      className="mt-2 w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                      onClick={async () => {
                        setIsAccountOpen(false);
                        await signOut();
                      }}
                    >
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                ref={triggerRef}
                type="button"
                className={`flex w-full items-center rounded-lg border border-gray-200 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900/20 ${
                  isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
                }`}
                onClick={() => {
                  if (isCollapsed) {
                    setIsSettingsModalOpen(true);
                  } else {
                    setIsAccountOpen((prev) => !prev);
                  }
                }}
                aria-expanded={isAccountOpen}
                aria-haspopup="dialog"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AnimatePresence mode="wait">
                  {isCollapsed ? (
                    <motion.div
                      key="collapsed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white"
                    >
                      {displayName.charAt(0).toUpperCase()}
                      <span className="absolute -bottom-1 -right-1 text-xs">⚙️</span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="expanded"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col"
                    >
                      <span className="text-xs text-gray-500">Account</span>
                      <span className="text-sm font-semibold text-gray-900">{displayName}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isCollapsed && <span aria-hidden className="text-gray-400">⚙️</span>}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.aside>

      <SettingsSidebar 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </>
  );
}



