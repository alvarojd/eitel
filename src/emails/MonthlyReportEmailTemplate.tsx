import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
  Img,
  Hr,
} from '@react-email/components';

interface MonthlyReportEmailTemplateProps {
  sensorName: string;
  devEui: string;
  totalHours: number;
  metrics: {
    avgTemp: number;
    avgHum: number;
    avgCo2: number;
  };
  percentages: {
    ideal: number;
    warning: number;
    critical: number;
    offline: number;
  };
  chartUrl: string;
}

export const MonthlyReportEmailTemplate: React.FC<Readonly<MonthlyReportEmailTemplateProps>> = ({
  sensorName,
  devEui,
  totalHours,
  metrics,
  percentages,
  chartUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>Informe Mensual de Sensor: {sensorName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Informe Mensual: {sensorName}</Heading>
          <Text style={text}>
            ID del Dispositivo: {devEui}
          </Text>
          <Text style={text}>
            Se han evaluado un total de {totalHours} horas durante el último mes.
          </Text>

          <Section style={metricsSection}>
            <Row>
              <Column style={metricCol}>
                <Text style={metricValue}>{metrics.avgTemp.toFixed(1)}°C</Text>
                <Text style={metricLabel}>Temp. Media</Text>
              </Column>
              <Column style={metricCol}>
                <Text style={metricValue}>{metrics.avgHum.toFixed(1)}%</Text>
                <Text style={metricLabel}>Hum. Media</Text>
              </Column>
              <Column style={metricCol}>
                <Text style={metricValue}>{metrics.avgCo2.toFixed(0)} ppm</Text>
                <Text style={metricLabel}>CO2 Medio</Text>
              </Column>
            </Row>
          </Section>

          <Section style={chartSection}>
            <Heading style={h2}>Distribución de Estados</Heading>
            <Img src={chartUrl} width="400" height="200" alt="Gráfica de estados" style={image} />
          </Section>

          <Section style={tableSection}>
            <Heading style={h2}>Resumen de Porcentajes</Heading>
            <Row style={tableRow}>
              <Column><Text style={tableCellLabel}><span style={{color: '#10b981'}}>●</span> Ideal</Text></Column>
              <Column><Text style={tableCellValue}>{percentages.ideal.toFixed(1)}%</Text></Column>
            </Row>
            <Row style={tableRow}>
              <Column><Text style={tableCellLabel}><span style={{color: '#f97316'}}>●</span> Riesgo / Aviso</Text></Column>
              <Column><Text style={tableCellValue}>{percentages.warning.toFixed(1)}%</Text></Column>
            </Row>
            <Row style={tableRow}>
              <Column><Text style={tableCellLabel}><span style={{color: '#ef4444'}}>●</span> Crítico</Text></Column>
              <Column><Text style={tableCellValue}>{percentages.critical.toFixed(1)}%</Text></Column>
            </Row>
            <Row style={tableRow}>
              <Column><Text style={tableCellLabel}><span style={{color: '#64748b'}}>●</span> Desconectado</Text></Column>
              <Column><Text style={tableCellValue}>{percentages.offline.toFixed(1)}%</Text></Column>
            </Row>
          </Section>
          
          <Hr style={hr} />
          <Text style={footer}>
            Este es un correo automático generado por Hexasense IoT Dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
};

const h1 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '30px 40px 10px',
  padding: '0',
};

const h2 = {
  color: '#334155',
  fontSize: '18px',
  fontWeight: '600',
  marginTop: '20px',
  marginBottom: '10px',
};

const text = {
  color: '#475569',
  fontSize: '14px',
  margin: '0 40px 10px',
};

const metricsSection = {
  margin: '30px 40px',
  padding: '20px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
};

const metricCol = {
  textAlign: 'center' as const,
};

const metricValue = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#0ea5e9',
  margin: '0',
};

const metricLabel = {
  fontSize: '12px',
  color: '#64748b',
  margin: '5px 0 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const chartSection = {
  margin: '30px 40px',
  textAlign: 'center' as const,
};

const image = {
  margin: '0 auto',
  display: 'block',
};

const tableSection = {
  margin: '30px 40px',
};

const tableRow = {
  borderBottom: '1px solid #e2e8f0',
  padding: '10px 0',
};

const tableCellLabel = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155',
};

const tableCellValue = {
  margin: '0',
  fontSize: '14px',
  color: '#475569',
  textAlign: 'right' as const,
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '40px 40px 20px',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0 40px',
};
