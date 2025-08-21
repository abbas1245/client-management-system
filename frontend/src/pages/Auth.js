import React, { useState } from 'react';
import Login from '../components/Login';
import Signup from '../components/Signup';
import { Toaster } from '../components/ui/sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  // Add specific styles for authentication page
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div className="auth-page h-screen w-screen flex relative overflow-hidden bg-black">
      {/* Background Image - Full Screen Coverage */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat filter saturate-125 contrast-110 brightness-105"
          style={{
            backgroundImage: `url('/resized_image_1366x786.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        {/* Overlay (lightened) to make background more prominent while keeping form readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/35" />
      </div>

      {/* Left Side - Login/Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-start pl-8 lg:pl-12 xl:pl-16 relative z-10">
        <div className={`w-full ${isLogin ? 'max-w-md sm:max-w-lg' : 'max-w-lg sm:max-w-xl'}`}>
          {/* Glass Form Container with Scrolling */}
          <div className={`bg-gradient-to-br from-white/15 via-purple-900/25 to-fuchsia-900/25 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl shadow-black/60 relative overflow-hidden ${isLogin ? 'max-h-[calc(100vh-120px)] my-4' : 'max-h-[calc(100vh-80px)] my-2'}`}>
            {/* Subtle background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-blue-500/5 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-fuchsia-400/20 rounded-full blur-xl"></div>
            
            {/* Scrollable Form Content */}
            <div className={`relative z-10 ${isLogin ? 'p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-120px)]' : 'p-5 lg:p-6 overflow-y-hidden max-h-[calc(100vh-80px)]'}`}>
              {isLogin ? (
                <Login onSwitchToSignup={() => setIsLogin(false)} />
              ) : (
                <Signup onSwitchToLogin={() => setIsLogin(true)} />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="text-left mt-1 mb-0">
            <p className="text-purple-200/80 text-sm font-medium">
              © 2024 Cliento. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Pure Background Image */}
      <div className="hidden lg:block lg:w-1/2 relative z-10 bg-transparent"></div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(88, 28, 135, 0.95)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default Auth;
