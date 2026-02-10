'use client';

import { useState, useEffect } from 'react';
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

  // Email states
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Export state
  const [exporting, setExporting] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [changeEmailError, setChangeEmailError] = useState('');

  // Shopify connect state (still collected but button disabled)
  const [shopDomain, setShopDomain] = useState('');
  const [connectError, setConnectError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  // Load email
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await fetch('/api/user/email', { credentials: 'include' });
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        const data = await res.json();
        setUserEmail(data.email || 'Not available');
      } catch (err) {
        console.error('Email fetch error:', err);
        setEmailError('Could not load email');
        setUserEmail('Error');
      } finally {
        setEmailLoading(false);
      }
    };
    fetchEmail();
  }, []);

  const handleDisconnect = async (type: 'shopify' | 'ga4' | 'hubspot') => {
    if (!confirm(`Are you sure you want to disconnect ${type.toUpperCase()}? This will stop data syncing from this source.`)) {
      return;
    }

    setDeleting(true);

    try {
      const res = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(`${type.toUpperCase()} disconnected successfully`);
        refresh();
      } else {
        alert(data?.error || `Failed to disconnect (${res.status})`);
      }
    } catch (error) {
      alert('Network error — check console for details');
      console.error(error);
    } finally {
      setDeleting(false);
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
      setChangeEmailError('Please enter a valid email address');
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
        setChangeEmailError('');
        // Refresh email
        const newRes = await fetch('/api/user/email', { credentials: 'include' });
        const data = await newRes.json();
        setUserEmail(data.email || 'Not available');
      } else {
        const data = await res.json();
        setChangeEmailError(data.error || 'Failed to update email');
      }
    } catch (error) {
      setChangeEmailError('Network error');
      console.error(error);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/user/export-data', {
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Export failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'growth-easy-data.json';

      a.click();

      URL.revokeObjectURL(url);
      a.remove();

      alert('Export successful! Check your downloads.');
    } catch (error: any) {
      console.error('Export error:', error);
      alert(error.message || 'Failed to export data — try again');
    } finally {
      setExporting(false);
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
        const clearCookie = (name: string) => {
          document.cookie = `${name}=; Max-Age=0; path=/; secure=${process.env.NODE_ENV === 'production' ? 'Secure' : ''}; samesite=strict`;
        };

        clearCookie('access_token');
        clearCookie('refresh_token');
        clearCookie('csrf_token');
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

  // Disabled connect handler (just shows message)
  const handleShopifyConnectDisabled = () => {
    alert('Shopify connection is currently disabled. This feature will be available soon.');
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
          {/* Shopify - Disabled */}
          <div className="metric-card p-8 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Shopify</h3>
            {shopifyConnected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected</p>
                <button 
                  onClick={() => handleDisconnect('shopify')} 
                  disabled={deleting}
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 w-full"
                >
                  {deleting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-4 opacity-60">
                <input
                  type="text"
                  placeholder="your-store.myshopify.com"
                  value={shopDomain}
                  onChange={(e) => setShopDomain(e.target.value.trim())}
                  disabled={true}
                  className="px-6 py-4 bg-black/30 border-4 border-gray-600 rounded-full text-gray-400 placeholder-gray-500 text-xl cursor-not-allowed"
                />
                <button
                  onClick={handleShopifyConnectDisabled}
                  disabled={true}
                  title="Feature disabled - coming soon"
                  className="cyber-btn text-xl px-10 py-5 w-full opacity-50 cursor-not-allowed bg-gray-700"
                >
                  Connect Shopify (Disabled)
                </button>
                {connectError && <p className="text-red-400 text-lg">{connectError}</p>}
              </div>
            )}
          </div>

          {/* GA4 - Disabled */}
          <div className="metric-card p-8 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Google Analytics (GA4)</h3>
            {ga4Connected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected</p>
                <button 
                  onClick={() => handleDisconnect('ga4')} 
                  disabled={deleting}
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 w-full"
                >
                  {deleting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <button 
                disabled={true}
                title="Feature disabled - coming soon"
                className="cyber-btn text-xl px-10 py-5 w-full opacity-50 cursor-not-allowed bg-gray-700"
              >
                Connect GA4 (Disabled)
              </button>
            )}
          </div>

          {/* HubSpot - Disabled */}
          <div className="metric-card p-8 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">HubSpot</h3>
            {hubspotConnected ? (
              <>
                <p className="text-xl text-green-400 mb-4">Connected</p>
                <button 
                  onClick={() => handleDisconnect('hubspot')} 
                  disabled={deleting}
                  className="cyber-btn text-xl px-8 py-4 bg-red-600/80 hover:bg-red-600 disabled:opacity-50 w-full"
                >
                  {deleting ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <button 
                disabled={true}
                title="Feature disabled - coming soon"
                className="cyber-btn text-xl px-10 py-5 w-full opacity-50 cursor-not-allowed bg-gray-700"
              >
                Connect HubSpot (Disabled)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscription - unchanged */}
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

      {/* Account – unchanged */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 mb-12 text-center">Account</h2>
        <div className="metric-card p-12">
          <div className="text-2xl text-cyan-300 mb-8 flex flex-col gap-2">
            <span className="font-bold">Email:</span>
            <span className="break-words overflow-hidden text-ellipsis max-w-full text-lg md:text-2xl leading-snug bg-black/30 p-3 rounded-xl border border-cyan-500/30">
              {emailLoading ? 'loading...' : emailError ? emailError : userEmail || 'Not available'}
            </span>
          </div>
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
              {changeEmailError && <p className="text-red-400 mb-4">{changeEmailError}</p>}
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

      {/* Data & Privacy - unchanged */}
      <div className="max-w-5xl mx-auto mb-20">
        <h2 className="text-5xl font-black text-cyan-400 mb-12 text-center">Data & Privacy</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="metric-card p-10 text-center">
            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Export Your Data</h3>
            <p className="text-xl text-cyan-200 mb-8">
              Download all your metrics and insights
            </p>
            <button 
              onClick={handleExportData} 
              disabled={exporting}
              className={`cyber-btn text-xl px-10 py-5 ${exporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {exporting ? 'Exporting...' : 'Export Data'}
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