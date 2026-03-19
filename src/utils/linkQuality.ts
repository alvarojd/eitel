export interface LinkQuality {
  score: number; // 0-100
  label: string;
  color: string;
  textColor: string;
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
    return { score: finalScore, label: 'Excelente', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  } else if (finalScore >= 60) {
    return { score: finalScore, label: 'Buena', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
  } else if (finalScore >= 40) {
    return { score: finalScore, label: 'Regular', color: 'bg-orange-500', textColor: 'text-orange-500' };
  } else {
    return { score: finalScore, label: 'Crítica', color: 'bg-rose-500', textColor: 'text-rose-500' };
  }
}
