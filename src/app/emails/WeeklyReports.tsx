import { Html, Head, Preview, Body, Container, Heading, Text, Hr, Button } from '@react-email/components';

interface WeeklyReportProps {
  name: string;
  churnChange: number;
  mrrChange: number;
  newCustomers: number;
  dashboardUrl: string;
}

export default function WeeklyReport({
  name,
  churnChange,
  mrrChange,
  newCustomers,
  dashboardUrl,
}: WeeklyReportProps) {
  return (
    <Html>
      <Head />
      <Preview>Your Weekly GrowthEasy Report</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#0a0f2c', color: '#e0f2fe', margin: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '40px auto', padding: '32px 24px', background: '#111827', borderRadius: '16px', border: '1px solid #334155' }}>
          <Heading style={{ color: '#22d3ee', textAlign: 'center', margin: '0 0 32px', fontSize: '28px' }}>
            Weekly Growth Report
          </Heading>

          <Text style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
            Hi {name || 'there'},
          </Text>

          <Text style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '24px' }}>
            Here's a snapshot of how your store performed this week:
          </Text>

          <div style={{ margin: '24px 0', padding: '20px', background: '#1f2937', borderRadius: '12px' }}>
            <Text style={{ margin: '0 0 12px', fontWeight: 'bold', color: '#a5b4fc', fontSize: '18px' }}>
              Key Changes
            </Text>
            <Text style={{ margin: '8px 0' }}>
              • Churn rate: {churnChange > 0 ? '+' : ''}{churnChange.toFixed(1)}%
            </Text>
            <Text style={{ margin: '8px 0' }}>
              • MRR: {mrrChange > 0 ? '+' : ''}{mrrChange.toFixed(1)}%
            </Text>
            <Text style={{ margin: '8px 0' }}>
              • New customers: +{newCustomers}
            </Text>
          </div>

          <Text style={{ fontSize: '16px', lineHeight: '1.6', margin: '24px 0' }}>
            <strong>Quick insight:</strong> Watch churn closely — if it's rising, a win-back campaign for inactive users can help recover lost revenue quickly.
          </Text>

          <Hr style={{ borderColor: '#334155', margin: '32px 0' }} />

          <Button
            href={dashboardUrl}
            style={{
              backgroundColor: '#22d3ee',
              color: '#0f172a',
              padding: '14px 36px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              display: 'inline-block',
            }}
          >
            View Full Dashboard
          </Button>

          <Text style={{ fontSize: '14px', color: '#94a3b8', marginTop: '40px', textAlign: 'center' }}>
            GrowthEasy AI – Helping you grow faster every week
          </Text>
        </Container>
      </Body>
    </Html>
  );
}