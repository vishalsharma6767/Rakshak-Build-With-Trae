'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) console.error('Error logging in:', error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) console.error('Error signing up:', error.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <form onSubmit={handleAuth} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 bg-gray-800 border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-2 bg-gray-800 border border-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button type="submit" className="p-2 bg-green-700 hover:bg-green-600 border border-green-700">
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
        <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-center">
          {isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}
        </button>
      </form>
    </div>
  );
}
