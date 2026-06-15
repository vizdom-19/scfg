import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Get API URL from environment variables
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Create axios instance with credentials
  const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin 
      ? { email: formData.email, password: formData.password } 
      : formData;

    try {
      const response = await apiClient.post(endpoint, payload);

      if (response.data.success) {
        setMessage(isLogin ? "Login Successful! Redirecting..." : "Registration Successful! Please Login.");
        if (isLogin) {
          if (response.data.user) {
            sessionStorage.setItem('user', JSON.stringify(response.data.user));
          }
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        } else {
          // Reset form and switch to login
          setFormData({ name: '', email: '', password: '' });
          setIsLogin(true);
        }
      } else {
        setError(response.data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#1c9c9c]/10 font-sans antialiased px-4 py-8">
      {/* Main Container Card mirroring the layout proportions */}
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-[940px] min-h-[580px] flex flex-col md:flex-row overflow-hidden border border-white/20">
        
        {/* LEFT SIDE: Welcome Graphic Aspect (Hidden on very small viewports) */}
        <div className="relative md:w-[45%] bg-gradient-to-br from-[#d2ebd4] via-[#e2f3df] to-[#f4fbf1] p-10 flex flex-col justify-between overflow-hidden">
          {/* Wave/Curve Overlay shape context */}
          <div className="absolute top-0 right-0 h-full w-16 bg-[#1f7060] opacity-10 rounded-l-[100%] pointer-events-none transform translate-x-8" />
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-widest text-[#3d6854] font-serif uppercase">
              Welcome
            </h1>
          </div>

          {/* Stylized CSS Illustration Elements to represent the custom vector artwork */}
          <div className="relative w-full h-56 mt-4 flex items-end justify-center">
            {/* Background Mountains */}
            <div className="absolute bottom-0 left-4 w-40 h-40 bg-[#99cbab]/40 rounded-t-full filter blur-[1px]" />
            <div className="absolute bottom-0 right-4 w-48 h-48 bg-[#b8dfc4]/50 rounded-t-full filter blur-[1px]" />
            
            {/* Layered Forest Pine Shapes */}
            <div className="absolute bottom-0 left-12 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[60px] border-b-[#428163]" />
            <div className="absolute bottom-0 left-20 w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[80px] border-b-[#2e6347]" />
            <div className="absolute bottom-0 right-16 w-0 h-0 border-l-[28px] border-l-transparent border-r-[28px] border-r-transparent border-b-[70px] border-b-[#357252]" />
            
            {/* Deer Silhouettes (represented as stylized minimalist design nodes) */}
            <div className="absolute bottom-2 left-1/3 flex flex-col items-center opacity-80 animate-pulse">
              <div className="w-2 h-5 bg-[#1e4431] rounded-full" />
              <div className="w-5 h-3 bg-[#1e4431] rounded-full -mt-2" />
            </div>
          </div>

          <div className="relative z-10 text-left">
            <p className="text-xs font-semibold text-[#4e7d65] uppercase tracking-wider">SCfG</p>
          </div>
        </div>

        {/* RIGHT SIDE: Interactive Auth Forms */}
        <div className="md:w-[55%] bg-[#1f7060] p-8 md:p-12 flex flex-col justify-center text-white relative">
          
          <div className="w-full max-w-[360px] mx-auto text-left">
            <h2 className="text-2xl font-semibold mb-1">Hello!</h2>
            <p className="text-base text-emerald-100/80 mb-6">
              {isLogin ? 'We are glad to see you again :)' : 'We are glad to see you :)'}
            </p>

            {/* Alerts Container */}
            {error && (
              <div className="p-3 rounded-xl text-xs text-center mb-4 bg-red-500/20 text-red-200 border border-red-500/30 backdrop-blur-sm animate-shake">
                {error}
              </div>
            )}
            {message && (
              <div className="p-3 rounded-xl text-xs text-center mb-4 bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 backdrop-blur-sm">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="flex flex-col">
                  <label className="text-xs text-emerald-100/70 mb-1.5 ml-1 font-medium tracking-wide">Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    disabled={loading}
                    className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:bg-white/15 focus:border-[#d4f86d] focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>
              )}

              <div className="flex flex-col">
                <label className="text-xs text-emerald-100/70 mb-1.5 ml-1 font-medium tracking-wide">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  disabled={loading}
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:bg-white/15 focus:border-[#d4f86d] focus:outline-none transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs text-emerald-100/70 mb-1.5 ml-1 font-medium tracking-wide">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="xxxxxxxxx"
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  disabled={loading}
                  minLength="6" 
                  className="p-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 text-sm focus:bg-white/15 focus:border-[#d4f86d] focus:outline-none transition-all tracking-widest disabled:opacity-50"
                />
              </div>

              {!isLogin && (
                <div className="flex items-start space-x-2 pt-1 pb-2">
                  <input 
                    type="checkbox" 
                    required 
                    id="terms"
                    disabled={loading}
                    className="accent-[#d4f86d] rounded border-white/20 bg-transparent w-4 h-4 cursor-pointer disabled:opacity-50"
                  />
                  <label htmlFor="terms" className="text-[11px] text-emerald-100/70 leading-none cursor-pointer selection:bg-transparent">
                    I agree <span className="underline hover:text-white transition-colors">Terms of Service</span> and <span className="underline hover:text-white transition-colors">Privacy Policy</span>
                  </label>
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#d4f86d] to-[#bde252] hover:shadow-lg hover:shadow-black/20 text-[#1f7060] rounded-xl font-bold text-sm transition-all duration-300 mt-4 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (isLogin ? 'Signing In...' : 'Signing Up...') : (isLogin ? 'Sign In' : 'Sign Up')}
              </button>
            </form>

            <p className="text-center mt-6 text-xs text-emerald-100/60">
              {isLogin ? "New to the platform? " : "Already have an account? "}
              <span 
                onClick={() => { 
                  if (!loading) {
                    setIsLogin(!isLogin); 
                    setError(''); 
                    setMessage(''); 
                    setFormData({ name: '', email: '', password: '' });
                  }
                }}
                className="text-[#d4f86d] font-bold cursor-pointer hover:underline ml-1"
              >
                {isLogin ? 'Join now' : 'Sign in'}
              </span>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
