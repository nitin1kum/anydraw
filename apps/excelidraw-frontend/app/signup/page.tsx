'use client';

import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { ZodError } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CreateUserSchema } from '@repo/common/types'; 

// A simple Alert component for user feedback
const Alert = ({ text }: { text: string }) => (
    <div className="fixed top-5 right-5 bg-blue-500 text-white py-2 px-4 rounded-lg shadow-lg animate-pulse z-50">
        {text}
    </div>
);

// Define a type for form validation errors
interface FormErrors {
  name?: string;
  username?: string; // Corresponds to the email field
  password?: string;
  general?: string;
}

const SignupPage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAlert, setShowAlert] = useState(false);

  // Use an environment variable for your API URL
  const BASE_URL = process.env.NEXT_PUBLIC_HTTP_BACKEND_URL || "http://localhost:3001";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setAuthLoading(true);

    try {
      // 1. Validate form data on the client-side using Zod
      const validatedData = CreateUserSchema.parse({ name, username, password });
      
      // 2. Send validated data to the backend
      await axios.post(`${BASE_URL}/signup`, validatedData);
      
      // 3. Handle success
      setShowAlert(true);
      setTimeout(() => {
        router.push('/signin'); // Redirect to sign-in page after success
      }, 2000);

    } catch (error) {
      // 4. Handle errors
      if (error instanceof ZodError) {
        const formErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(formErrors);
      } else if (axios.isAxiosError(error)) {
        setErrors({ general: error.response?.data?.message || 'Registration failed. The email might already be in use.' });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className='bg-gradient-to-br  from-red-600 via-blue-600  to-purple-600 min-h-screen'>
      <nav className="p-4">
        <Link href="/">
          {/* Ensure your logo is in the /public folder */}
          <Image src="/logo.svg" alt="App Logo" width={240} height={80} priority />
        </Link>
      </nav>
      <div className="flex items-center justify-center py-12 px-4">
        <div className='w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border-2 border-blue-200'>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              And start collaborating in seconds.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md">
               <div>
                  <input name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-white border border-blue-300 rounded-md text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your Name" />
                  {errors.name && <p className='text-red-500 text-xs mt-1 px-1'>{errors.name}</p>}
               </div>
               <div>
                  <input name="email" type="email" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-3 bg-white border border-blue-300 rounded-md text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="your@email.com" />
                  {errors.username && <p className='text-red-500 text-xs mt-1 px-1'>{errors.username}</p>}
               </div>
               <div>
                  <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-white border border-blue-300 rounded-md text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Password" />
                  {errors.password && <p className='text-red-500 text-xs mt-1 px-1'>{errors.password}</p>}
               </div>
            </div>
            {errors.general && <p className='text-red-500 text-sm text-center font-semibold pt-2'>{errors.general}</p>}
            <div className="pt-2">
              <button type='submit' disabled={authLoading} className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed">
                {authLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </div>
        </div>
        {showAlert && (
          <Alert text='Success! Redirecting to sign in...' />
        )}
      </div>
    </div>
  );
};

export default SignupPage;

