'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  mode,
  onModeChange
}) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X size={24} />
        </button>
        
        {mode === 'login' ? (
          <LoginForm 
            onSwitchToRegister={() => onModeChange('register')} 
            onSuccess={onClose}
          />
        ) : (
          <RegisterForm 
            onSwitchToLogin={() => onModeChange('login')} 
            onSuccess={onClose}
          />
        )}
      </div>
    </div>
  );
};