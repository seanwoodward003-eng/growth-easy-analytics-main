import { Suspense } from 'react';
import PricingClient from './PricingClient';
import { getRow } from '@/lib/db';  // ← make sure this import exists and works

// This page will be dynamically rendered on each request
// (good for live counters – remove or change to revalidate: 60 if you want caching)
export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  // Fetch total lifetime users
  const lifetimeResult = await getRow<{ count: number }>(
    'SELECT COUNT(*) as count FROM users WHERE subscription_status = "lifetime"',
    []
  );

  // Fetch early bird specifically
  const earlyResult = await getRow<{ count: number }>(
    'SELECT COUNT(*) as count FROM users WHERE subscription_status = "lifetime" AND plan_type = "early_bird"',
    []
  );

  const earlyBirdSold = earlyResult?.count ?? 0;
  const totalLifetimeSold = lifetimeResult?.count ?? 0;

  return (
    <PricingClient
      earlyBirdSold={earlyBirdSold}
      totalLifetimeSold={totalLifetimeSold}
    />
  );
}