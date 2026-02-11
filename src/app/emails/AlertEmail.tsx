import { Html, Head, Preview, Body, Container, Heading, Text, Button } from '@react-email/components';

interface AlertEmailProps {
  name: string;
  metricName: string;
  change: number;
  currentValue: number;
  previousValue: number;
  dashboardUrl: string;
}

export default function AlertEmail({
  name,
  metricName,
  change,
  currentValue,
  previousValue,
  dashboardUrl,
}: AlertEmailProps) {
  const isIncrease = change > 0;
  const color = isIncrease ? '#ef4444' : '#22c55e';

  return (
    <Html>
      <Head />
      <Preview>Alert: {metricName} changed significantly</Preview>
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#0a0f2c', color: '#e0f2fe', margin: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '40px auto', padding: '32px 24px', background: '#111827', borderRadius: '16px', border: '1px solid #334155' }}>
          <Heading style={{ color, textAlign: 'center', margin: '0 0 32px', fontSize: '28px' }}>
            {isIncrease ? '⚠️ Increase Alert' : 'Decrease Alert'}
          </Heading>

          <Text style={{ fontSize: '16px', lineHeight: '1.6' }}>
            Hi {name || 'there'},
          </Text>

          <Text style={{ fontSize: '20px', lineHeight: '1.4', margin: '16px 0', fontWeight: 'bold' }}>
            {metricName} moved {change > 0 ? '+' : ''}{change.toFixed(1)}% today
          </Text>

          <div style={{ padding: '20px', background: '#1f2937', borderRadius: '12px', margin: '24px 0' }}>
            <Text style={{ margin: '0 0 12px', fontSize: '16px' }}>
              Current: <strong>{currentValue.toFixed(1)}</strong>
            </Text>
            <Text style={{ margin: '0 0 12px', fontSize: '16px' }}>
              Previous: <strong>{previousValue.toFixed(1)}</strong>
            </Text>
          </div>

          <Text style={{ fontSize: '16px', lineHeight: '1.6', margin: '24px 0' }}>
            Recommendation: {isIncrease && metricName.includes('Churn')
              ? 'Review recent customer activity. A targeted win-back campaign can recover lost users quickly.'
              : 'Check recent pricing, promotions or onboarding changes — small adjustments can help reverse this.'}
          </Text>

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
            View Details Now
          </Button>

          <Text style={{ fontSize: '14px', color: '#94a3b8', marginTop: '40px', textAlign: 'center' }}>
            GrowthEasy AI – Stay ahead of your metrics
          </Text>
        </Container>
      </Body>
    </Html>
  );
}