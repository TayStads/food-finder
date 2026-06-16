import { useState } from 'react';
import { X, User, Lock, CreditCard, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const TABS = [
  { id: 'details', label: 'Personal details', Icon: User },
  { id: 'password', label: 'Password', Icon: Lock },
  { id: 'billing', label: 'Subscription', Icon: CreditCard },
  { id: 'danger', label: 'Delete account', Icon: Trash2 },
];

const PLAN_LABELS = {
  free: 'Free',
  '6month': '6-Month (R50/month)',
  '12month': '12-Month (R30/month)',
  annual: 'Annual (R250/year)',
};

export default function ManageAccount({ user, subscription, onClose, onSignOut, onUpgrade }) {
  const [tab, setTab] = useState('details');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const flash = (text, type = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const saveDetails = async () => {
    setLoading(true);
    const updates = {};
    if (name.trim() !== (user?.user_metadata?.full_name || '')) updates.data = { full_name: name.trim() };
    if (email.trim() !== user?.email) updates.email = email.trim();
    if (!Object.keys(updates).length) { setLoading(false); return; }
    const { error } = await supabase.auth.updateUser(updates);
    setLoading(false);
    if (error) flash(error.message, 'error');
    else flash(updates.email ? 'Check your new email address for a confirmation link.' : 'Details updated.');
  };

  const savePassword = async () => {
    if (newPassword !== confirmPassword) { flash('Passwords do not match.', 'error'); return; }
    if (newPassword.length < 6) { flash('Password must be at least 6 characters.', 'error'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) flash(error.message, 'error');
    else { flash('Password updated successfully.'); setNewPassword(''); setConfirmPassword(''); }
  };

  const cancelSubscription = async () => {
    if (!window.confirm('Cancel your subscription? You will keep access until the end of your billing period.')) return;
    setLoading(true);
    const { error } = await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('user_id', user.id);
    setLoading(false);
    if (error) flash(error.message, 'error');
    else flash('Subscription cancelled. Access continues until your billing period ends.');
  };

  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') { flash('Please type DELETE to confirm.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/.netlify/functions/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error();
      onSignOut();
    } catch {
      flash('Failed to delete account. Please contact support@foodfinder.app.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md bg-white h-full overflow-y-auto shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <h2 className="font-serif font-semibold text-stone-800">Manage account</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={20} /></button>
        </div>

        <div className="flex border-b border-stone-100 overflow-x-auto shrink-0">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => { setTab(id); setMsg({ text: '', type: '' }); }}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                tab === id ? 'border-yellow-400 text-stone-800' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        <div className="p-6 flex-1">
          {msg.text && (
            <p className={`text-sm mb-4 p-3 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
              {msg.text}
            </p>
          )}

          {tab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-600 mb-1 block">Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-600 mb-1 block">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800" />
                <p className="text-xs text-stone-400 mt-1">A confirmation link will be sent to your new email address.</p>
              </div>
              <button onClick={saveDetails} disabled={loading}
                className="w-full py-2 rounded-lg bg-yellow-400 text-stone-800 font-medium hover:bg-yellow-500 disabled:opacity-50">
                {loading ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          )}

          {tab === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-600 mb-1 block">New password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800" />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-600 mb-1 block">Confirm new password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-stone-800" />
              </div>
              <button onClick={savePassword} disabled={loading || !newPassword || !confirmPassword}
                className="w-full py-2 rounded-lg bg-yellow-400 text-stone-800 font-medium hover:bg-yellow-500 disabled:opacity-50">
                {loading ? 'Saving…' : 'Update password'}
              </button>
            </div>
          )}

          {tab === 'billing' && (
            <div className="space-y-4">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <div className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">Current plan</div>
                <div className="font-serif font-bold text-stone-800 text-xl">{PLAN_LABELS[subscription?.plan] ?? 'Free'}</div>
                {subscription?.status === 'trial' ? (
                  <div className="text-xs mt-1 font-medium text-blue-600">
                    Free trial active — ends {new Date(subscription.trial_ends_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                ) : (
                  <div className={`text-xs mt-1 font-medium ${subscription?.status === 'active' ? 'text-green-600' : 'text-stone-400'}`}>
                    {subscription?.status === 'cancelled' ? 'Cancelled — access until end of period' : 'Active'}
                  </div>
                )}
              </div>
              {subscription?.plan === 'free' ? (
                <button onClick={onUpgrade}
                  className="w-full py-2 rounded-lg bg-yellow-400 text-stone-800 font-medium hover:bg-yellow-500">
                  Upgrade plan
                </button>
              ) : subscription?.status === 'trial' ? (
                <button onClick={onUpgrade}
                  className="w-full py-2 rounded-lg bg-yellow-400 text-stone-800 font-medium hover:bg-yellow-500">
                  Complete payment to activate plan
                </button>
              ) : (
                <button onClick={cancelSubscription} disabled={loading || subscription?.status === 'cancelled'}
                  className="w-full py-2 rounded-lg border border-stone-200 text-stone-500 text-sm hover:border-red-200 hover:text-red-500 disabled:opacity-40 transition-colors">
                  {subscription?.status === 'cancelled' ? 'Subscription already cancelled' : 'Cancel subscription'}
                </button>
              )}
            </div>
          )}

          {tab === 'danger' && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm text-red-700 font-medium mb-1">This action is permanent</p>
                <p className="text-sm text-red-600 leading-relaxed">
                  All your data — including your account and custom recipes — will be permanently deleted. This cannot be undone.
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-stone-600 mb-1 block">
                  Type <span className="font-mono font-bold tracking-widest">DELETE</span> to confirm
                </label>
                <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                  placeholder="DELETE"
                  className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-300 text-stone-800" />
              </div>
              <button onClick={deleteAccount} disabled={loading || deleteConfirm !== 'DELETE'}
                className="w-full py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-40">
                {loading ? 'Deleting…' : 'Permanently delete my account'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
