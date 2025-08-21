import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Login = ({ onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast.success('Welcome back!');
        // Navigate to dashboard after successful login
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">
            Welcome Back
          </h2>
          <Sparkles className="h-5 w-5 text-fuchsia-400" />
        </div>
        <p className="text-white/80 text-sm font-medium">
          Sign in to your Cliento account
        </p>
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
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="pl-10 pr-4 h-10 bg-purple-900/40 border border-purple-400/50 rounded-xl text-white placeholder:text-purple-200 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 group-hover:border-purple-400/70 group-hover:bg-purple-900/50 text-sm font-medium shadow-lg backdrop-blur-sm"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90 font-semibold text-sm flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-fuchsia-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
              <Lock className="h-3 w-3 text-white" />
            </div>
            Password
          </Label>
          <div className="relative group">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="pl-10 pr-10 h-10 bg-fuchsia-900/40 border border-fuchsia-400/50 rounded-xl text-white placeholder:text-fuchsia-200 focus:ring-2 focus:ring-fuchsia-400/50 focus:border-fuchsia-400/50 transition-all duration-300 group-hover:border-fuchsia-400/70 group-hover:bg-fuchsia-900/50 text-sm font-medium shadow-lg backdrop-blur-sm"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fuchsia-300" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fuchsia-300 hover:text-fuchsia-200 transition-colors p-1 hover:bg-fuchsia-400/20 rounded-lg"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-10 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-blue-700 rounded-xl text-white font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 mt-5 border border-purple-400/30"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Signing In...
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-4 text-center space-y-2">
        <p className="text-white/70 text-xs font-medium">
          <button
            onClick={() => navigate('/auth/forgot')}
            className="text-purple-300 hover:text-purple-200 font-semibold transition-colors hover:underline underline-offset-2"
          >
            Forgot password?
          </button>
        </p>
        <p className="text-white/70 text-xs font-medium">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-purple-300 hover:text-purple-200 font-semibold transition-colors hover:underline underline-offset-2"
          >
            Sign up here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
