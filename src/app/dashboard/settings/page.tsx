'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useMetrics from "@/hooks/useMetrics";

export default function SettingsPage() {
  const router = useRouter();
  const { 
    metrics, 
    isLoading, 
    shopifyConnected, 
    ga4Connected, 
    hubspotConnected,
    refresh 
  } = useMetrics();

  const [deleting, setDeleting] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleDisconnect = async (type: 'shopify' | 'ga4' | 'hubspot') => {
    console.log(`[DEBUG] Disconnect button clicked — type = ${type}`);

    if (!confirm(`Are you sure you want to disconnect ${type.toUpperCase()}? This will stop data syncing from this source.`)) {
      console.log('[DEBUG] User cancelled the confirmation dialog');
      return;
    }

    console.log('[DEBUG] User confirmed → starting disconnect attempt');

    setDeleting(true);

    try {
      console.log('[DEBUG] Preparing fetch to /api/integrations/disconnect');
      console.log('[DEBUG] Sending body:', JSON.stringify({ type }));

      const res = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      console.log('[DEBUG] Fetch finished');
      console.log('[DEBUG] Status:', res.status);
      console.log('[DEBUG] ok?', res.ok);
      console.log('[DEBUG] Content-Type:', res.headers.get('Content-Type'));

      const raw = await res.clone().text();
      console.log('[DEBUG] Raw server response (full):', raw);

      let data;
      try {
        data = await res.json();
        console.log('[DEBUG] Parsed JSON successfully:', data);
      } catch (jsonErr) {
        console.error('[DEBUG] JSON parse failed:', jsonErr instanceof Error ? jsonErr.message : String(jsonErr));
        data = { error: 'Invalid JSON from server' };
      }

      if (res.ok) {
        console.log(`[DEBUG] Success — ${type} disconnected`);
        alert(`${type.toUpperCase()} disconnected successfully`);
        refresh();
      } else {
        console.warn('[DEBUG] Server returned non-ok status');
        console.log('[DEBUG] Server error data:', data);
        alert(data?.error || `Failed to disconnect (${res.status})`);
      }
    } catch (error) {
      console.error('[DEBUG] Fetch / network error:', error);
      alert('Network error — check console for details');
    } finally {
      setDeleting(false);
      console.log('[DEBUG] handleDisconnect finished');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Cancel your subscription? You will lose access at the end of your billing period.')) return;

    try {
      const res = await fetch('/api/subscription/cancel', { 
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        alert('Subscription cancelled successfully');
        refresh();
      } else {
        alert('Failed to cancel subscription');
      }
    } catch (error) {
      alert('Error cancelling subscription');
      console.error(error);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    try {
      const res = await fetch('/api/user/change-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });

      if (res.ok) {
        alert('Email updated successfully');
        setNewEmail('');
        setChangingEmail(false);
        setEmailError('');
        refresh();
      } else {
        const data = await res.json();
        setEmailError(data.error || 'Failed to update email');
      }
    } catch (error) {
      setEmailError('Network error');
      console.error(error);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/user/export-data', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'growth-easy-data.json';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data');
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Permanently delete your account? This cannot be undone — all data will be lost.')) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/user/delete', { 
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        document.cookie = 'access_token=; Max-Age=0; path=/';
        document.cookie = 'refresh_token=; Max-Age=0; path=/';
        document.cookie = 'csrf_token=; Max-Age=0; path=/';
        alert('Account deleted');
        router.push('/');
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      alert('Error deleting account');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) return <div className="text-center text-4xl text-cyan-300 mt-40">Loading settings...</div>;

  return (
    <div className="min-h-screen px-6 py-20 md:px-12 lg:px-24">
      <h1 className="glow-title text-center text-7xl md:text-9xl font-black mb-20 text-cyan-400">
        Settings
      </h1>

      {/* Integrations */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 mb-12 text-center">Integrations</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Shopify */}
          <div className="metric-card p-8 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Shopify</h3>
            {shopifyConnected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected</p>
                <button 
                  onClick={() => handleDisconnect('shopify')} 
                  disabled={deleting}
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <button 
                onClick={() => router.push('/dashboard')} 
                className="cyber-btn text-xl px-10 py-5"
              >
                Connect Shopify
              </button>
            )}
          </div>

          {/* GA4 */}
          <div className="metric-card p-8 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Google Analytics (GA4)</h3>
            {ga4Connected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected</p>
                <button 
                  onClick={() => handleDisconnect('ga4')} 
                  disabled={deleting}
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <button 
                onClick={() => router.push('/dashboard')} 
                className="cyber-btn text-xl px-10 py-5"
              >
                Connect GA4
              </button>
            )}
          </div>

          {/* HubSpot */}
          <div className="metric-card p-8 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">HubSpot</h3>
            {hubspotConnected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected</p>
                <button 
                  onClick={() => handleDisconnect('hubspot')} 
                  disabled={deleting}
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600 disabled:opacity-50"
                >
                  {deleting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <button 
                onClick={() => router.push('/dashboard')} 
                className="cyber-btn text-xl px-10 py-5"
              >
                Connect HubSpot
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 mb-12 text-center">Subscription</h2>
        <div className="metric-card p-12 text-center">
          <p className="text-4xl text-cyan-300 mb-8">
            Current Plan: <span className="text-green-400 font-black">{metrics.subscription?.plan || 'Trial'}</span>
          </p>
          {metrics.subscription?.plan === 'Trial' && (
            <p className="text-xl text-cyan-200 mb-8">
              Trial ends in X days — upgrade to continue
            </p>
          )}
          <div className="flex justify-center gap-6">
            <button onClick={() => router.push('/pricing')} className="cyber-btn text-2xl px-10 py-5">
              Upgrade Plan
            </button>
            {metrics.subscription?.plan !== 'Lifetime' && (
              <button onClick={handleCancelSubscription} className="cyber-btn text-2xl px-10 py-5 bg-red-600/80 hover:bg-red-600">
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 mb-12 text-center">Account</h2>
        <div className="metric-card p-12">
          <p className="text-2xl text-cyan-300 mb-8">
            Email: {metrics.user?.email || 'loading...'}
          </p>
          <div className="flex justify-center gap-6">
            <button onClick={() => setChangingEmail(true)} className="cyber-btn text-xl px-8 py-4">
              Change Email
            </button>
          </div>
          {changingEmail && (
            <form onSubmit={handleChangeEmail} className="mt-8">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="New email address"
                className="w-full p-4 mb-4 bg-[#0a0f2c] border-2 border-cyan-400 text-cyan-200 rounded-xl"
              />
              {emailError && <p className="text-red-400 mb-4">{emailError}</p>}
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setChangingEmail(false)} className="cyber-btn text-xl px-8 py-4 bg-gray-600/80">
                  Cancel
                </button>
                <button type="submit" className="cyber-btn text-xl px-8 py-4">
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 mb-12 text-center">Data & Privacy</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="metric-card p-10 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Export Your Data</h3>
            <p className="text-xl text-cyan-200 mb-8">
              Download all your metrics and insights
            </p>
            <button onClick={handleExportData} className="cyber-btn text-xl px-10 py-5">
              Export Data
            </button>
          </div>

          <div className="metric-card p-10 text-center">
            <h3 className="text-3xl font-bold text-red-400 mb-6">Delete Account</h3>
            <p className="text-xl text-cyan-200 mb-8">
              Permanently delete your account and all data
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="cyber-btn text-xl px-10 py-5 bg-red-600/80 hover:bg-red-600 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}