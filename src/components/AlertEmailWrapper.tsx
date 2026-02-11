'use client';

import { ReactNode } from 'react';
import AlertEmail from '@/app/emails/AlertEmail';

interface Props {
  name: string;
  metricName: string;
  change: number;
  currentValue: number;
  previousValue: number;
  aiInsight: string;
  dashboardUrl: string;
}

export default function AlertEmailWrapper(props: Props) {
  return <AlertEmail {...props} />;
}