import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { User, Lock, Eye, EyeOff, Sparkles, LogIn, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TeamSpiritCard } from '../common/TeamSpiritCard';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [headingVisible, setHeadingVisible] = useState(false);

  // Trigger Fireworks / Crackers particle bursts on load
  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      const duration = 2500;
      const animationEnd = Date.now() + duration;

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = Math.floor(40 * (timeLeft / duration));

        // Crackers burst 1 (Left-Center)
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 50,
          particleCount,
          origin: { x: randomInRange(0.1, 0.4), y: Math.random() * 0.4 + 0.15 },
          colors: ['#ff4500', '#ff8c00', '#ff007f', '#9d4edd', '#ffd700', '#ff0055']
        });

        // Crackers burst 2 (Right-Center)
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 50,
          particleCount,
          origin: { x: randomInRange(0.6, 0.9), y: Math.random() * 0.4 + 0.15 },
          colors: ['#00f5d4', '#7b2cbf', '#f72585', '#4cc9f0', '#ffb703', '#3a86ff']
        });
      }, 250);

      // Fade-in animated heading slightly after fireworks start
      const timer = setTimeout(() => {
        setHeadingVisible(true);
      }, 400);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else {
      setHeadingVisible(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password) {
      setErrorMsg('Please enter both Username and Password');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(username.trim(), password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials. Please check your username and password.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden px-4 py-8 select-none">
      
      {/* Background Decorative Glowing Orbs & Grid Patterns */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-1000" />
      <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">

        {/* Animated Brand Header */}
        <div
          className={`text-center mb-8 transition-all duration-1000 ease-out transform ${
            headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
          }`}
        >
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-3xl bg-white/90 border border-white/40 backdrop-blur-xl shadow-2xl group hover:scale-105 transition-transform duration-300">
            <div className="h-16 px-4 py-2 bg-white rounded-2xl flex items-center justify-center overflow-hidden">
              <img src="/ibrain-logo.png" alt="iBrain Labs" className="h-full w-auto object-contain" />
            </div>
          </div>

          {/* Shimmering Animated Heading */}
          <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-400 to-purple-300 tracking-tight drop-shadow-md mb-2">
            Welcome to iBrain Labs
          </h1>

          <p className="text-xs sm:text-sm font-semibold text-purple-200/80 tracking-wide flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            AI Automations & Digital Marketing Dashboard
          </p>
        </div>

        {/* Centered Glassmorphism Login Card */}
        <div className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
          
          {/* Team Spirit Quote Card */}
          <TeamSpiritCard className="mb-6" />

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-300/60">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-white/15 rounded-2xl text-white text-sm placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-200 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-300/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/60 border border-white/15 rounded-2xl text-white text-sm placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-300/60 hover:text-white transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 mt-2 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-purple-950/50 hover:shadow-purple-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>

          </form>

          {/* Card Footer Credentials Hint */}
          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-[11px] font-semibold text-purple-200/60">
              iBrain Labs • Expertise In Every Execution
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default LoginScreen;
