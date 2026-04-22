'use server'

import { determineStatus } from '../../core/use-cases/statusEngine';
import { PgHeatmapRepository } from '../database/repositories/PgHeatmapRepository';

const heatmapRepository = new PgHeatmapRepository();

export async function getHeatmapData() {
  try {
    const rows = await heatmapRepository.getHeatmapData();

    const heatmapMap = new Map<string, any>();

    for (const row of rows) {
      const devId = row.dev_eui || row.device_id;
      if (!heatmapMap.has(devId)) {
        heatmapMap.set(devId, {
          deviceId: devId,
          name: row.name || devId,
          data: []
        });
      }

      const deviceEntry = heatmapMap.get(devId);
      
      let estadoId = 0; 
      let hasData = false;

      if (row.read_count > 0) {
        hasData = true;
        estadoId = determineStatus({
          temperature: parseFloat(row.temperature) || 0,
          humidity: parseFloat(row.humidity) || 0,
          co2: parseFloat(row.co2) || 0
        });
      }

      deviceEntry.data.push({
        timestamp: row.timestamp,
        estadoId: estadoId,
        hasData: hasData,
        presence: row.presence === true
      });
    }

    return Array.from(heatmapMap.values());
  } catch (error) {
    console.error('Error in getHeatmapData:', error);
    return [];
  }
}
