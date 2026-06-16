import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Pricing from './Pricing';
import RecipeFinder from './RecipeFinder';
import ManageAccount from './ManageAccount';

export default function App() {
  const [session, setSession] = useState(undefined);
  const [subscription, setSubscription] = useState(undefined);
  const [showPricing, setShowPricing] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  // Handle PayFast return URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.unsubscribe();
  }, []);

  // Fetch subscription whenever session changes
  useEffect(() => {
    if (!session) { setSubscription(null); return; }
    supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        setSubscription(data ?? null);
        if (!data) setShowPricing(true);
      });
  }, [session]);

  const handlePlanSelected = (plan) => {
    setSubscription({ plan, status: 'active' });
    setShowPricing(false);
  };

  const handleSignOut = () => {
    setShowAccount(false);
    supabase.auth.signOut();
  };

  // Loading — waiting for session check
  if (session === undefined || (session && subscription === undefined)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return <Auth />;

  if (showPricing) {
    return <Pricing user={session.user} onPlanSelected={handlePlanSelected} />;
  }

  return (
    <>
      <RecipeFinder
        user={session.user}
        subscription={subscription}
        onSignOut={handleSignOut}
        onOpenAccount={() => setShowAccount(true)}
        onUpgrade={() => setShowPricing(true)}
      />
      {showAccount && (
        <ManageAccount
          user={session.user}
          subscription={subscription}
          onClose={() => setShowAccount(false)}
          onSignOut={handleSignOut}
          onUpgrade={() => { setShowAccount(false); setShowPricing(true); }}
        />
      )}
    </>
  );
}
