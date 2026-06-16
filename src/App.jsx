import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import RecipeFinder from './RecipeFinder';

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <RecipeFinder
      user={session.user}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
}
