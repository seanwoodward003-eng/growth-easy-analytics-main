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
    if (!confirm(`Are you sure you want to disconnect ${type.toUpperCase()}? Your data from this source will stop syncing.`)) return;

    try {
      const res = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      if (res.ok) {
        alert(`${type.toUpperCase()} disconnected successfully`);
        refresh(); // Immediately update the UI
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to disconnect');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      alert('Network error — please try again');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Cancel your subscription? You will lose access at the end of your billing period.')) return;

    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
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
      const res = await fetch('/api/user/export-data');
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
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
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
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600"
                >
                  Disconnect
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
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600"
                >
                  Disconnect
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
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600"
                >
                  Disconnect
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

      {/* Subscription, Account, Data & Privacy sections remain the same */}
      {/* ... (keep your existing code for these sections) ... */}

    </div>
  );
}