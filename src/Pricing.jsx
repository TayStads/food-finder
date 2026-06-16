import { useState } from 'react';
import { Check, X, ChefHat } from 'lucide-react';
import { supabase } from './supabaseClient';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 'R0',
    period: 'forever',
    features: ['15 built-in recipes', 'Ingredient-based matching', 'Step-by-step cooking guide'],
    excluded: ['Personal recipe repository', 'Recipe sharing'],
    cta: 'Get started free',
    highlight: false,
  },
  {
    id: '6month',
    name: '6-Month',
    price: 'R35',
    period: '/month',
    note: 'R210 total · 6 monthly payments',
    features: ['15 built-in recipes', 'Ingredient-based matching', 'Step-by-step cooking guide', 'Personal recipe repository', 'Recipe sharing'],
    cta: 'Start 6-month plan',
    highlight: false,
  },
  {
    id: '12month',
    name: '12-Month',
    price: 'R20',
    period: '/month',
    note: 'R240 total · 12 monthly payments',
    features: ['15 built-in recipes', 'Ingredient-based matching', 'Step-by-step cooking guide', 'Personal recipe repository', 'Recipe sharing'],
    cta: 'Start 12-month plan',
    highlight: false,
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 'R199',
    period: '/year',
    note: 'Once-off payment · save R41 vs 12-month',
    features: ['15 built-in recipes', 'Ingredient-based matching', 'Step-by-step cooking guide', 'Personal recipe repository', 'Recipe sharing'],
    cta: 'Get best value',
    highlight: true,
    badge: 'Best value',
  },
];

export default function Pricing({ user, onPlanSelected }) {
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState('');

  const selectPlan = async (plan) => {
    setLoading(plan.id);
    setError('');

    if (plan.id === 'free') {
      const { error } = await supabase
        .from('subscriptions')
        .insert({ user_id: user.id, plan: 'free', status: 'active' });
      if (error) { setError('Something went wrong. Please try again.'); setLoading(null); return; }
      onPlanSelected('free');
      return;
    }

    try {
      const res = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, userId: user.id, email: user.email, name: user.user_metadata?.full_name || '' }),
      });
      if (!res.ok) throw new Error();
      const { formUrl, fields } = await res.json();
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = formUrl;
      Object.entries(fields).forEach(([k, v]) => {
        const input = document.createElement('input');
        input.type = 'hidden'; input.name = k; input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError('Unable to set up payment. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="text-xs font-semibold tracking-widest text-yellow-600 uppercase mb-2">Food Finder</div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-400 text-stone-800 mb-3">
            <ChefHat size={24} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-800">Choose your plan</h1>
          <p className="text-stone-500 mt-2 text-sm">Paid plans unlock your personal recipe repository and recipe sharing.</p>
        </div>

        {error && <p className="text-center text-red-500 mb-6 text-sm">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl p-6 flex flex-col ${
                plan.highlight ? 'bg-yellow-400 shadow-lg' : 'bg-white border border-stone-200'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                  {plan.badge}
                </span>
              )}

              <div className="mb-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">{plan.name}</div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-stone-800">{plan.price}</span>
                  <span className="text-sm text-stone-500 mb-1">{plan.period}</span>
                </div>
                {plan.note && <p className="text-xs text-stone-500 mt-1">{plan.note}</p>}
              </div>

              <ul className="space-y-2 mb-6 flex-1 text-sm text-stone-700">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check size={13} className="mt-0.5 shrink-0 text-green-600" />
                    {f}
                  </li>
                ))}
                {plan.excluded?.map(f => (
                  <li key={f} className="flex items-start gap-2 text-stone-300">
                    <X size={13} className="mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => selectPlan(plan)}
                disabled={loading !== null}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 ${
                  plan.highlight
                    ? 'bg-stone-800 text-white hover:bg-stone-700'
                    : 'bg-yellow-400 text-stone-800 hover:bg-yellow-500'
                }`}
              >
                {loading === plan.id ? 'Please wait…' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Secure payments processed by PayFast · Manage or cancel your plan anytime
        </p>
      </div>
    </div>
  );
}
