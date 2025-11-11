'use client';

import React, { useState, FormEvent, Dispatch, SetStateAction } from 'react';
import { ZodError } from 'zod';
import axios from 'axios';
import Image from 'next/image';
import Input from '../_components/ui/Input';
import {Button} from '../_components/ui/Button';
import Alert from '../_components/ui/Alert';
import { SigninSchema } from '../_components/ui/Schema';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
interface FormErrors {
  username?: string;
  password?: string;
  general?: string;
}
const Signin = () => {
  const router = useRouter(); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showAlert, setShowAlert] = useState(false);
  
  const BASE_URL = "http://localhost:3001"; // Ensure this URL is correct

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setAuthLoading(true);

    try {
      const validatedData = SigninSchema.parse({  username, password });
      const response = await axios.post(`${BASE_URL}/signin`, validatedData);
      
      if (response.data && response.data.token) { 
            localStorage.setItem('authToken', response.data.token);
            const newtoken=localStorage.getItem('authToken');
            console.log('Token stored in localStorage:', newtoken);
            setShowAlert(true);
            setTimeout(() => {
              router.push('/dashboard');
            }, 1500);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const formErrors: FormErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formErrors[err.path[0] as keyof FormErrors] = err.message;
          }
        });
        setErrors(formErrors);
      } else if (axios.isAxiosError(error)) {
        if (error.response?.status === 411) {
            setErrors({ username: error.response.data.message || 'use differnet account' });
        } else {
            setErrors({ general: 'wrong credential' });
        }
      } else {
        setErrors({ general: 'login failed. Please try again.' });
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, field: keyof FormErrors) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };
  
  return (
    // The component now returns a React Fragment <> containing all the elements
    <div className='bg-gradient-to-br  from-red-600 via-blue-600  to-purple-600  text-white'>
    <nav>
        <div className=" brand flex gap-2 items-center  ">
          <Link href={"/"} >          
            <Image src="../logo.svg" alt="App Logo" width={240} height={80} />
          </Link>
        
          </div>
      </nav>
   
    <div className="flex items-center   justify-center min-h-screen ">
      
      <div className='w-[450px] shadow-lg rounded-2xl border-1 border-blue-600 bg-white/80 backdrop-blur-sm '>
        <div className="m-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 ">
            Welcome back !
          </h2>
          <p className="mt-2 text-1xl text-gray-800">
            login to continue
          </p>
        </div>

        {/* The <form> element now handles the layout and submission */}
        <form className="mt-8 m-4 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px ">
            <div className="pt-4 ">
              <Input
                value={username}
                onChange={handleInputChange(setUsername, 'username')}
                placeholder='your@email.com'
                disabled={authLoading}
                label={'Email'}
                inputId={'username'}
                className='w-full p-3 bg-white border border-blue-300 rounded-md text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                type='email'
              />
              {errors.username && <p className='text-red-500 text-sm mt-1 px-1'>{errors.username}</p>}
            </div>
            <div className="pt-4">
              <Input
                value={password}
                onChange={handleInputChange(setPassword, 'password')}
                type='password'
                placeholder='Password...'
                disabled={authLoading}
                className='w-full p-3 bg-white border border-blue-300 rounded-md text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
                label={'Password'}
                inputId={'password'}
              />
              {errors.password && <p className='text-red-500 text-sm mt-1 px-1'>{errors.password}</p>}
            </div>
          </div>
          
          {errors.general && <p className='text-red-500 text-sm text-center font-semibold pt-2'>{errors.general}</p>}

          <div className="pt-2">
            <Button 
              type='submit' 
              variant="primary" 
              size="lg" 
              disabled={authLoading}
              className="w-full bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {authLoading ? ' Logging' : 'Sign in'}
            </Button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-800  mb-14">
            New User?{' '}
            <Link href="/signup" className=" font-medium text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </div>
         
      </div>
      
      {/* The Alert is positioned outside the main div to act as an overlay */}
      {showAlert && (
        <Alert text='Logging ! Redirecting to Dashboard...' />
      )}
    </div>
     </div>
  );
};

export default Signin;

