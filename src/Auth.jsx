import { useState } from 'react';
import { ChefHat } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setSuccessMsg('Account created! Check your email for a confirmation link, then sign in.');
        setMode('signin');
        setPassword('');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-xs font-semibold tracking-widest text-yellow-600 uppercase mb-2">Food Finder</div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-stone-800 mb-3">
            <ChefHat size={24} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-800">What's for Dinner?</h1>
          <p className="text-stone-500 mt-1 text-sm">
            {mode === 'signin' ? 'Sign in to access your recipes.' : 'Create a free account to get started.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full px-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password (min. 6 characters)"
            className="w-full px-4 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}
          {successMsg && <p className="text-sm text-green-600">{successMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-yellow-400 text-stone-800 font-medium hover:bg-yellow-500 disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setSuccessMsg(''); }}
            className="text-yellow-600 font-medium hover:underline"
          >
            {mode === 'signin' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
