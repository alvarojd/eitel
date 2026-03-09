import { describe, it, expect } from 'vitest';
import { filterSensors } from '../sensorFilters';
import { SensorData } from '../../types';

describe('sensorFilters', () => {
  const mockSensors: Partial<SensorData>[] = [
    { id: '1', estado_id: 2, name: 'S1', indicators: { lowBattery: false, longTermNoOccupancy: false } }, // Critico
    { id: '2', estado_id: 6, name: 'S2', indicators: { lowBattery: true, longTermNoOccupancy: false } },  // Riesgo + LowBat
    { id: '3', estado_id: 9, name: 'S3', indicators: { lowBattery: false, longTermNoOccupancy: true } },  // Ideal + Absence
    { id: '4', estado_id: 1, name: 'S4' }, // Desconectado
  ];

  it('should return all sensors when filter is "all"', () => {
    const result = filterSensors(mockSensors as SensorData[], 'all');
    expect(result).toHaveLength(4);
  });

  it('should filter by critico status', () => {
    const result = filterSensors(mockSensors as SensorData[], 'critico');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter by battery indicator', () => {
    const result = filterSensors(mockSensors as SensorData[], 'bateria_baja');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should filter by absence indicator', () => {
    const result = filterSensors(mockSensors as SensorData[], 'ausencia');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should filter by desconectado status', () => {
    const result = filterSensors(mockSensors as SensorData[], 'desconectado');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });
});
