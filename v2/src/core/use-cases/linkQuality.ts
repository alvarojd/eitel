// src/core/use-cases/linkQuality.ts

export enum LinkQualityLevel {
  EXCELENTE = 'EXCELENTE',
  BUENA = 'BUENA',
  REGULAR = 'REGULAR',
  CRITICA = 'CRITICA'
}

export interface LinkQuality {
  score: number; // 0-100
  level: LinkQualityLevel;
}

export function calculateLinkQuality(rssi: number, snr: number = 0): LinkQuality {
  // RSSI Score: Mapear de -120 dBm (0%) a -60 dBm (100%)
  let rssiScore = ((rssi - (-120)) / (-60 - (-120))) * 100;
  rssiScore = Math.max(0, Math.min(100, rssiScore));

  // SNR Score: Mapear de -10 dB (0%) a +10 dB (100%)
  let snrScore = ((snr - (-10)) / (10 - (-10))) * 100;
  snrScore = Math.max(0, Math.min(100, snrScore));

  // Fórmula: Calidad Final = (RSSI_Score * 0.6) + (SNR_Score * 0.4)
  const finalScore = Math.round((rssiScore * 0.6) + (snrScore * 0.4));

  // Categorizar
  if (finalScore >= 80) {
    return { score: finalScore, level: LinkQualityLevel.EXCELENTE };
  } else if (finalScore >= 60) {
    return { score: finalScore, level: LinkQualityLevel.BUENA };
  } else if (finalScore >= 40) {
    return { score: finalScore, level: LinkQualityLevel.REGULAR };
  } else {
    return { score: finalScore, level: LinkQualityLevel.CRITICA };
  }
}
