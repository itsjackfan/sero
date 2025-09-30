'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page for now
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/a009048e011b5a410b510b06b126c6e2110c05bf.png"
            alt="Sero Logo"
            width={60}
            height={60}
            className="mr-4"
          />
          <span className="text-4xl font-bold text-blue-900">Sero</span>
        </div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
