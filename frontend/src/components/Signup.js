import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Zap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Signup = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const result = await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword
      );
      
      if (result.success) {
        toast.success('Account created successfully!');
        // Navigate to dashboard after successful signup
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

  const getPasswordStrength = () => {
    const { password } = formData;
    if (password.length === 0) return { strength: 0, color: 'bg-gray-500', text: '' };
    if (password.length < 6) return { strength: 1, color: 'bg-red-500', text: 'Weak' };
    if (password.length < 10) return { strength: 2, color: 'bg-yellow-500', text: 'Fair' };
    if (password.length < 12) return { strength: 3, color: 'bg-blue-500', text: 'Good' };
    return { strength: 4, color: 'bg-green-500', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <div className="inline-flex items-center gap-2 mb-3">
          <Zap className="h-5 w-5 text-fuchsia-400" />
          <h2 className="text-xl font-bold text-white">
            Create Account
          </h2>
          <Zap className="h-5 w-5 text-blue-400" />
        </div>
        <p className="text-white/80 text-sm font-medium">
          Join Cliento and start managing your sales
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/90 font-semibold text-sm flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg">
              <User className="h-3 w-3 text-white" />
            </div>
            Full Name
          </Label>
          <div className="relative group">
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              className="pl-10 pr-4 h-9 bg-purple-900/40 border border-purple-400/50 rounded-xl text-white placeholder:text-purple-200 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 group-hover:border-purple-400/70 group-hover:bg-purple-900/50 text-sm font-medium shadow-lg backdrop-blur-sm"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/90 font-semibold text-sm flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-fuchsia-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
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
              className="pl-10 pr-4 h-9 bg-fuchsia-900/40 border border-fuchsia-400/50 rounded-xl text-white placeholder:text-fuchsia-200 focus:ring-2 focus:ring-fuchsia-400/50 focus:border-fuchsia-400/50 transition-all duration-300 group-hover:border-fuchsia-400/70 group-hover:bg-fuchsia-900/50 text-sm font-medium shadow-lg backdrop-blur-sm"
            />
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-fuchsia-300" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white/90 font-semibold text-sm flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
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
              placeholder="Create a password"
              required
              className="pl-10 pr-10 h-9 bg-blue-900/40 border border-blue-400/50 rounded-xl text-white placeholder:text-blue-200 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 group-hover:border-blue-400/70 group-hover:bg-blue-900/50 text-sm font-medium shadow-lg backdrop-blur-sm"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-200 transition-colors p-1 hover:bg-blue-400/20 rounded-lg"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Ultra-compact strength bar */}
          {formData.password.length > 0 && (
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    level <= passwordStrength.strength ? passwordStrength.color : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white/90 font-semibold text-sm flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg">
              <Lock className="h-3 w-3 text-white" />
            </div>
            Confirm Password
          </Label>
          <div className="relative group">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              className="pl-10 pr-10 h-9 bg-purple-900/40 border border-purple-400/50 rounded-xl text-white placeholder:text-purple-200 focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 transition-all duration-300 group-hover:border-purple-400/70 group-hover:bg-purple-900/50 text-sm font-medium shadow-lg backdrop-blur-sm"
            />
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300 hover:text-purple-200 transition-colors p-1 hover:bg-purple-400/20 rounded-lg"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Ultra-compact match indicator */}
          {formData.confirmPassword.length > 0 && (
            <div className="text-xs font-semibold mt-1">
              {formData.password === formData.confirmPassword ? (
                <span className="text-green-300">Passwords match</span>
              ) : (
                <span className="text-red-300">Passwords do not match</span>
              )}
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-9 bg-gradient-to-r from-fuchsia-600 via-blue-600 to-purple-600 hover:from-fuchsia-700 hover:via-blue-700 hover:to-purple-700 rounded-xl text-white font-bold text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-fuchsia-500/30 hover:shadow-2xl hover:shadow-fuchsia-500/50 mt-4 border border-fuchsia-400/30"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating Account...
            </div>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="mt-3 text-center">
        <p className="text-white/70 text-xs font-medium">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-fuchsia-300 hover:text-fuchsia-200 font-semibold transition-colors hover:underline underline-offset-2"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
};

export default Signup;
