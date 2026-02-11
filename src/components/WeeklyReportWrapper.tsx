'use client';

import { ReactNode } from 'react';
import WeeklyReport from '@/app/emails/WeeklyReport';

interface Props {
  name: string;
  churnChange: number;
  mrrChange: number;
  newCustomers: number;
  aiInsight: string;
  dashboardUrl: string;
}

export default function WeeklyReportWrapper(props: Props) {
  return <WeeklyReport {...props} />;
}