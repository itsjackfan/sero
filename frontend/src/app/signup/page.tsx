'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    console.log('Signup submitted:', formData);
    // For now, redirect to quiz page
    window.location.href = '/quiz';
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center pl-4 pr-4 py-8">
      <div className="w-full max-w-none flex items-center justify-between gap-4">
        {/* Left side - Signup form */}
        <div className="flex-[2] px-20 py-12">
        {/* Logo - positioned in upper left */}
        <div className="absolute top-8 left-8 z-10">
          <Image
            src="/a009048e011b5a410b510b06b126c6e2110c05bf.png"
            alt="Sero"
            width={150}
            height={100}
            className="h-24"
          />
        </div>

        {/* Welcome text */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-500">Sign up to start tracking your energy patterns.</p>
        </div>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-900 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="First name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-900 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Last name"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Choose a username"
              required
            />
          </div>

          {/* Password Fields */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Create Account
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-gray-900 underline hover:text-gray-700">
            Log in
          </Link>
        </p>

        {/* Google sign up */}
        <div className="max-w-lg mt-6">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>
        </div>
        </div>

        {/* Right side - Gradient image container */}
        <div className="hidden lg:block flex-[2]">
          <div className="w-full h-[90vh] relative rounded-l-2xl overflow-hidden shadow-lg">
            <Image
              src="/d6882270b842d0d7471cadf24f46ffdaf6a19c1a.jpg"
              alt=""
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
