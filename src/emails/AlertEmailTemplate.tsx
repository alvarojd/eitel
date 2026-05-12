import React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface AlertEmailTemplateProps {
  type: 'battery' | 'offline';
  devEui: string;
  name: string | null;
  battery: number | null;
  latitude: number | string | null;
  longitude: number | string | null;
  timeSinceLastMessage?: string; // used for offline alerts
}

export const AlertEmailTemplate = ({
  type,
  devEui,
  name,
  battery,
  latitude,
  longitude,
  timeSinceLastMessage,
}: AlertEmailTemplateProps) => {
  const isBatteryAlert = type === 'battery';
  const previewText = isBatteryAlert 
    ? `Alerta Crítica: Batería baja (${battery}%) en el sensor ${name || devEui}`
    : `Alerta Crítica: Sensor offline. No hay datos de ${name || devEui}`;

  const mapsLink = (latitude && longitude) 
    ? `https://www.google.com/maps?q=${latitude},${longitude}` 
    : null;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[465px]">
            <Section className="mt-[32px]">
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                <strong className={isBatteryAlert ? 'text-orange-500' : 'text-red-500'}>
                  {isBatteryAlert ? '⚠️ Alerta de Batería Baja' : '🔴 Alerta de Pérdida de Datos'}
                </strong>
              </Heading>
            </Section>
            
            <Text className="text-black text-[14px] leading-[24px]">
              El sistema ha detectado una anomalía crítica en el sensor <strong>{name || devEui}</strong>:
            </Text>
            
            <Section className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
              <Text className="text-black text-[14px] leading-[24px] m-0">
                <strong>DevEUI:</strong> {devEui}
              </Text>
              <Text className="text-black text-[14px] leading-[24px] m-0 mt-2">
                <strong>Alias:</strong> {name || 'N/A'}
              </Text>
              {isBatteryAlert && (
                <Text className="text-black text-[14px] leading-[24px] m-0 mt-2 text-orange-600">
                  <strong>Nivel de Batería:</strong> {battery ?? 'N/A'}%
                </Text>
              )}
              {!isBatteryAlert && timeSinceLastMessage && (
                <Text className="text-black text-[14px] leading-[24px] m-0 mt-2 text-red-600">
                  <strong>Último mensaje recibido hace:</strong> {timeSinceLastMessage}
                </Text>
              )}
            </Section>
            
            {mapsLink ? (
              <Section className="text-center mt-[32px] mb-[32px]">
                <Link
                  href={mapsLink}
                  className="bg-blue-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                >
                  Ver Ubicación en Google Maps
                </Link>
              </Section>
            ) : (
              <Text className="text-gray-500 text-[12px] italic mt-4 mb-4 text-center">
                (Coordenadas GPS no disponibles para este dispositivo)
              </Text>
            )}
            
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Este es un correo automático generado por el Hexasense IoT Dashboard. 
              Puedes gestionar estas alertas en el panel de control, sección "Ajustes".
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default AlertEmailTemplate;
