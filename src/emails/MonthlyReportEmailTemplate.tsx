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
  rawPercentages: Record<number, number> | any;
  chartUrl: string;
}

const RECOMMENDATIONS: Record<number, { label: string, color: string, desc: string }> = {
  9: { label: 'Situación Ideal', color: '#10b981', desc: 'Mantenga sus hábitos actuales de ventilación periódica y climatización. Su vivienda se encuentra en un estado seguro y eficiente.' },
  8: { label: 'Aire Seco (Irritación)', color: '#f97316', desc: 'Coloque recipientes con agua o humidificadores sobre o cerca de los radiadores. Modere el uso de calefacciones por aire forzado y evite temperaturas excesivamente altas.' },
  7: { label: 'Frío Moderado (Pobreza Leve)', color: '#f97316', desc: 'Revise el aislamiento de cierres. Instale burletes autoadhesivos en los marcos de puertas y ventanas para evitar filtraciones de aire frío. Use ropa de abrigo adecuada en el hogar.' },
  6: { label: 'Aire Viciado (Confinamiento)', color: '#f97316', desc: 'Realice una ventilación breve abriendo las ventanas entre 5 y 10 minutos. Es suficiente para renovar el oxígeno sin llegar a enfriar o calentar estructuralmente los muros de la vivienda.' },
  5: { label: 'Riesgo Biológico (Moho)', color: '#f97316', desc: 'Ventile diariamente de 5 a 10 minutos, obligatoriamente tras cocinar o usar el baño. Evite secar ropa en el interior de la vivienda y separe los muebles unos centímetros de las paredes exteriores.' },
  4: { label: 'Atmósfera Nociva', color: '#ef4444', desc: 'Abra de forma inmediata las ventanas de estancias opuestas para generar ventilación cruzada durante un mínimo de 10 minutos para renovar el aire por completo.' },
  3: { label: 'Calor Extremo', color: '#ef4444', desc: 'Baje persianas y eche toldos durante las horas de sol. Ventile la vivienda únicamente de noche y madrugada (ventilación cruzada). Use ventiladores, manténgase hidratado y refrésquese con agua.' },
  2: { label: 'Frío Severo (Pobreza Energética)', color: '#ef4444', desc: 'Encienda la calefacción si dispone de ella. Si el gasto es inasumible, priorice calentar una única estancia ("habitación refugio"), baje persianas al anochecer para aislar y use ropa de abrigo por capas.' },
  1: { label: 'Desconectado', color: '#64748b', desc: 'El sensor ha estado apagado, desconectado o sin cobertura en este periodo.' },
  0: { label: 'Desconocido', color: '#64748b', desc: 'Datos insuficientes o no clasificados.' }
};

export const MonthlyReportEmailTemplate: React.FC<Readonly<MonthlyReportEmailTemplateProps>> = ({
  sensorName,
  devEui,
  totalHours,
  metrics,
  rawPercentages,
  chartUrl,
}) => {
  // Ordenar de mayor severidad a menor, ignorando los que tengan 0% o cercano
  const activeIds = Object.keys(rawPercentages)
    .map(Number)
    .filter(id => rawPercentages[id] >= 0.1 && id !== 0) // Hide Desconocido and 0%
    .sort((a, b) => b - a); // Order: 9 -> 1. Wait, actually 1 to 9 is offline to ideal. Let's order by percentage descending? No, fixed order is better.
  
  // Custom sort to group critical first (2,3,4), warning (5,6,7,8), ideal (9), offline (1)
  const sortOrder = [4, 3, 2, 5, 6, 7, 8, 9, 1];
  activeIds.sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b));

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
              <Column style={{ ...metricCol, width: '33.33%' }}>
                <Text style={metricValue}>{metrics.avgTemp.toFixed(1)}°C</Text>
                <Text style={metricLabel}>Temp. Media</Text>
              </Column>
              <Column style={{ ...metricCol, width: '33.33%' }}>
                <Text style={metricValue}>{metrics.avgHum.toFixed(1)}%</Text>
                <Text style={metricLabel}>Hum. Media</Text>
              </Column>
              <Column style={{ ...metricCol, width: '33.33%' }}>
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
            <Heading style={h2}>Detalle de Indicadores</Heading>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <tbody>
                {activeIds.map(id => {
                  const data = RECOMMENDATIONS[id];
                  const val = rawPercentages[id];
                  return (
                    <tr key={id} style={tableRow}>
                      <td style={{ ...tableCellLabel, width: '75%', paddingRight: '10px', paddingLeft: '8px' }}>
                        <span style={{ color: data.color, marginRight: '8px', fontSize: '16px' }}>●</span>
                        <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>{data.label}</span>
                      </td>
                      <td style={{ ...tableCellValue, width: '25%', paddingRight: '8px' }}>
                        <strong>{val.toFixed(1)}%</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Section>

          {activeIds.length > 0 && (
            <Section style={recommendationsSection}>
              <Heading style={h2}>Recomendaciones y Buenas Prácticas</Heading>
              {activeIds.filter(id => id !== 1 && id !== 0).map(id => {
                const data = RECOMMENDATIONS[id];
                return (
                  <div key={id} style={recommendationCard}>
                    <Text style={{ ...recommendationTitle, color: data.color }}>
                      {data.label}
                    </Text>
                    <Text style={recommendationText}>
                      {data.desc}
                    </Text>
                  </div>
                );
              })}
            </Section>
          )}
          
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
  padding: '20px 40px 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  maxWidth: '680px',
};

const h1 = {
  color: '#0f172a',
  fontSize: '24px',
  fontWeight: '700',
  margin: '30px 0 10px',
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
  margin: '0 0 10px',
  lineHeight: '1.5',
};

const metricsSection = {
  margin: '30px 0',
  padding: '20px 10px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
};

const metricCol = {
  textAlign: 'center' as const,
};

const metricValue = {
  fontSize: '20px',
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
  margin: '30px 0',
  textAlign: 'center' as const,
};

const image = {
  margin: '0 auto',
  display: 'block',
  maxWidth: '100%',
  height: 'auto',
};

const tableSection = {
  margin: '30px 0',
};

const tableRow = {
  borderBottom: '1px solid #e2e8f0',
};

const tableCellLabel = {
  margin: '0',
  fontSize: '14px',
  fontWeight: '600',
  color: '#334155',
  padding: '12px 0',
  lineHeight: '1.4',
};

const tableCellValue = {
  margin: '0',
  fontSize: '15px',
  color: '#0f172a',
  textAlign: 'right' as const,
  padding: '12px 0',
};

const recommendationsSection = {
  margin: '30px 0',
  padding: '24px',
  backgroundColor: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
};

const recommendationCard = {
  marginBottom: '16px',
};

const recommendationTitle = {
  fontSize: '14px',
  fontWeight: '700',
  margin: '0 0 4px',
};

const recommendationText = {
  fontSize: '13px',
  color: '#475569',
  margin: '0',
  lineHeight: '1.6',
};

const hr = {
  borderColor: '#e2e8f0',
  margin: '40px 0 20px',
};

const footer = {
  color: '#94a3b8',
  fontSize: '12px',
  margin: '0',
};

