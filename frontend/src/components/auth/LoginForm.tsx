'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { LOGIN } from '@/lib/graphql/mutations';
import { useAuth } from './AuthContext';
import { LoginInput, AuthResponse } from '@/types/crypto';

interface LoginFormProps {
  onSwitchToRegister?: () => void;
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const [formData, setFormData] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();
  
  const [loginMutation] = useMutation<{ login: AuthResponse }>(LOGIN);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const { data } = await loginMutation({
        variables: {
          input: formData,
        },
      });
      
      if (data?.login) {
        login(data.login);
        onSuccess?.();
        router.push('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ 
        general: error instanceof Error ? error.message : 'Login failed. Please check your credentials.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof LoginInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-900 backdrop-blur-lg bg-opacity-80 dark:bg-opacity-80 rounded-2xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          Sign In to CryptAssist
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange('email')}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange('password')}
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password
                  ? 'border-red-300 dark:border-red-600'
                  : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
              placeholder="Enter your password"
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-red-600 dark:text-red-400 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        {onSwitchToRegister && (
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Sign up here
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};