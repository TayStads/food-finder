import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './Auth';
import Pricing from './Pricing';
import RecipeFinder from './RecipeFinder';
import ManageAccount from './ManageAccount';

export default function App() {
  const [session, setSession] = useState(undefined);
  const [userRecord, setUserRecord] = useState(undefined);
  const [showPricing, setShowPricing] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [trialExpired, setTrialExpired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') window.history.replaceState({}, '', '/');
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setUserRecord(null); return; }
    supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        const expired = data?.status === 'trial' && data.trial_ends_at && new Date(data.trial_ends_at) < new Date();
        setUserRecord(data ?? null);
        if (!data || expired) {
          setTrialExpired(!!expired);
          setShowPricing(true);
        }
      });
  }, [session]);

  const handlePlanSelected = async () => {
    if (!session) return;
    const { data } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
    setUserRecord(data);
    setShowPricing(false);
    setTrialExpired(false);
  };

  const handleSignOut = () => {
    setShowAccount(false);
    supabase.auth.signOut();
  };

  if (session === undefined || (session && userRecord === undefined)) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!session) return <Auth />;

  if (showPricing) {
    return (
      <Pricing
        user={session.user}
        userRecord={userRecord}
        onPlanSelected={handlePlanSelected}
        trialExpired={trialExpired}
      />
    );
  }

  return (
    <>
      <RecipeFinder
        user={session.user}
        tier={userRecord?.tier || 'free'}
        onSignOut={handleSignOut}
        onOpenAccount={() => setShowAccount(true)}
        onUpgrade={() => setShowPricing(true)}
      />
      {showAccount && (
        <ManageAccount
          user={session.user}
          userRecord={userRecord}
          onClose={() => setShowAccount(false)}
          onSignOut={handleSignOut}
          onUpgrade={() => { setShowAccount(false); setShowPricing(true); }}
        />
      )}
    </>
  );
}
