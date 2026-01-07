'use client';

import useMetrics from "@/hooks/useMetrics";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { metrics, isLoading } = useMetrics();
  const [deleting, setDeleting] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  const handleDisconnect = async (type: 'shopify' | 'ga4' | 'hubspot') => {
    if (!confirm(`Disconnect ${type.toUpperCase()}? Your data will stop syncing.`)) return;
    try {
      const res = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        alert(`${type.toUpperCase()} disconnected successfully`);
        router.refresh(); // Refresh to update metrics
      } else {
        alert('Failed to disconnect. Please try again.');
      }
    } catch (error) {
      alert('Error disconnecting. Check console for details.');
      console.error(error);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Cancel your subscription? This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      if (res.ok) {
        alert('Subscription cancelled successfully');
        router.refresh();
      } else {
        alert('Failed to cancel. Please try again.');
      }
    } catch (error) {
      alert('Error cancelling subscription.');
      console.error(error);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
      setEmailError('Please enter a valid email.');
      return;
    }
    try {
      const res = await fetch('/api/user/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });
      if (res.ok) {
        alert('Email changed successfully');
        setChangingEmail(false);
        setNewEmail('');
        router.refresh();
      } else {
        const data = await res.json();
        setEmailError(data.error || 'Failed to change email.');
      }
    } catch (error) {
      setEmailError('Error changing email.');
      console.error(error);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/user/export-data');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'growth-easy-data.json'; // Or CSV, etc.
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Failed to export data.');
      }
    } catch (error) {
      alert('Error exporting data.');
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Delete your account? This is permanent — all data will be lost.')) return;
    setDeleting(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        // Clear cookies like in logout
        document.cookie = 'access_token=; Max-Age=0; path=/';
        document.cookie = 'refresh_token=; Max-Age=0; path=/';
        document.cookie = 'csrf_token=; Max-Age=0; path=/';
        alert('Account deleted successfully');
        router.push('/');
      } else {
        alert('Failed to delete account.');
      }
    } catch (error) {
      alert('Error deleting account.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

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
            {metrics.shopify?.connected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected: {metrics.shopify.shop}</p>
                <button onClick={() => handleDisconnect('shopify')} className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={() => window.location.href = '/api/auth/shopify'} className="cyber-btn text-xl px-10 py-5">
                Connect Shopify
              </button>
            )}
          </div>

          {/* GA4 */}
          <div className="metric-card p-8 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Google Analytics (GA4)</h3>
            {metrics.ga4?.connected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected: Property {metrics.ga4.propertyId}</p>
                <button onClick={() => handleDisconnect('ga4')} className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={() => window.location.href = '/api/auth/ga4'} className="cyber-btn text-xl px-10 py-5">
                Connect GA4
              </button>
            )}
          </div>

          {/* HubSpot */}
          <div className="metric-card p-8 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">HubSpot</h3>
            {metrics.hubspot?.connected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected</p>
                <button onClick={() => handleDisconnect('hubspot')} className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600">
                  Disconnect
                </button>
              </>
            ) : (
              <button onClick={() => window.location.href = '/api/auth/hubspot'} className="cyber-btn text-xl px-10 py-5">
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