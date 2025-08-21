import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';

const useQuery = () => new URLSearchParams(useLocation().search);

const ResetPassword = () => {
  const query = useQuery();
  const tokenFromQuery = query.get('token') || '';
  const [token, setToken] = useState(tokenFromQuery);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await resetPassword(token, password, confirmPassword);
      if (result.success) {
        toast.success('Password reset successfully. Please sign in.');
        setTimeout(() => navigate('/auth'), 1000);
      } else {
        toast.error(result.error);
      }
    } catch (_) {
      toast.error('Failed to reset password');
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
                  <Lock className="h-5 w-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-white">Reset Password</h2>
                  <Lock className="h-5 w-5 text-fuchsia-400" />
                </div>
                <p className="text-white/80 text-sm font-medium">Enter your new password</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-white/90 font-semibold text-sm">Reset Token</Label>
                  <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste the token" className="h-10 bg-purple-900/40 border border-purple-400/50 rounded-xl text-white placeholder:text-purple-200" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white/90 font-semibold text-sm">New Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter new password" className="h-10 bg-fuchsia-900/40 border border-fuchsia-400/50 rounded-xl text-white placeholder:text-fuchsia-200" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/90 font-semibold text-sm">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" className="h-10 bg-fuchsia-900/40 border border-fuchsia-400/50 rounded-xl text-white placeholder:text-fuchsia-200" required />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-10 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-blue-600 hover:from-purple-700 hover:via-fuchsia-700 hover:to-blue-700 rounded-xl text-white font-bold text-sm">{loading ? 'Resetting...' : 'Reset Password'}</Button>
                <div className="text-center mt-2">
                  <button type="button" onClick={() => navigate('/auth')} className="text-purple-300 hover:text-purple-200 font-semibold text-xs">Back to Sign In</button>
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

      <Toaster position="top-right" />
    </div>
  );
};

export default ResetPassword;


