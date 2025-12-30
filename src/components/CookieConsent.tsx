'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if consent cookie exists
    if (!document.cookie.includes('cookie_consent=')) {
      setShow(true);
    }
  }, []);

  const acceptCookies = () => {
    // Set cookie for 1 year
    document.cookie = 'cookie_consent=true; max-age=' + 60*60*24*365 + '; path=/; SameSite=Lax';
    setShow(false);
    // Reload to trigger any analytics/scripts that depend on consent
    window.location.reload();
  };

  const declineCookies = () => {
    document.cookie = 'cookie_consent=false; max-age=' + 60*60*24*365 + '; path=/; SameSite=Lax';
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#0a0f2c]/95 backdrop-blur-lg border-t-4 border-cyan-400">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-cyan-100 text-center md:text-left">
          <p className="text-xl font-bold mb-2">We use cookies</p>
          <p className="text-lg">
            This site uses essential cookies for functionality and analytics to improve your experience. 
            By continuing, you agree to our use of cookies. 
            <a href="/privacy" className="underline hover:text-cyan-300 ml-1">Learn more</a>
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={declineCookies}
            className="px-8 py-3 border-2 border-cyan-400 text-cyan-400 rounded-xl text-lg font-bold hover:bg-cyan-400/10 transition"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="px-8 py-3 bg-cyan-400 text-black rounded-xl text-lg font-bold hover:scale-105 transition shadow-lg shadow-cyan-400/50"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}