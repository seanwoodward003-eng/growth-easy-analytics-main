// lib/stripe.ts (or wherever your Stripe client is initialized)
// Server-side only - do NOT import this in client components

import Stripe from 'stripe';

if (!process.env.STRIPE_API_KEY) {
  throw new Error('STRIPE_API_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_API_KEY, {
  apiVersion: '2025-06-30.basil', // This matches the type expected by recent stripe versions
  // Optional: add typescript: true if you want stricter types in responses
  // typescript: true,
});