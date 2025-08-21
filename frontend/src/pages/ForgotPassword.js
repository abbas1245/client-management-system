import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { Mail, KeyRound } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        toast.success('If this email exists, a reset link has been sent');
        if (result.token) {
          navigate(`/auth/reset?token=${encodeURIComponent(result.token)}`);
        }
      } else {
        toast.error(result.error);
      }
    } catch (_) {
      toast.error('Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/resized_image_1366x786.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-black/60" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-start pl-8 lg:pl-12 xl:pl-16 relative z-10">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-gradient-to-br from-white/15 via-purple-900/25 to-fuchsia-900/25 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl shadow-black/60 relative overflow-hidden max-h-[700px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-fuchsia-500/5 to-blue-500/5 rounded-3xl"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-fuchsia-400/20 rounded-full blur-xl"></div>

            <div className="relative z-10 p-6 lg:p-8 overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-purple-400/30 scrollbar-track-transparent">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 mb-3">
                  <KeyRound className="h-5 w-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Forgot Password</h2>
                  <KeyRound className="h-5 w-5 text-fuchsia-400" />
                </div>
                <p className="text-white/80 text-sm font-medium">Enter your email to reset your password</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90 font-semibold text-sm flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg">
                      <Mail className="h-3 w-3 text-white" />
                    </div>
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      className="pl-10 pr-4 h-10 bg-purple-900/40 border border-purple-400/50 rounded-xl text-white placeholder:text-purple-200 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 group-hover:border-purple-400/70 group-hover:bg-purple-900/50 text-sm font-medium shadow-lg backdrop-blur-sm"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-blue-700 rounded-xl text-white font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 mt-5 border border-purple-400/30"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/auth')}
                    className="text-purple-300 hover:text-purple-200 font-semibold text-xs transition-colors hover:underline underline-offset-2"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="text-left mt-6">
            <p className="text-white/80 text-sm font-medium">© 2024 Cliento. All rights reserved.</p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative z-10"></div>

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
        }}
      />
    </div>
  );
};

export default ForgotPassword;


