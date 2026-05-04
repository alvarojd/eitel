import { PgUserRepository } from '../database/repositories/PgUserRepository';
import { PgSensorRepository } from '../database/repositories/PgSensorRepository';
import { PgHeatmapRepository } from '../database/repositories/PgHeatmapRepository';
import { PgHistoryRepository } from '../database/repositories/PgHistoryRepository';
import { PgAuditRepository } from '../database/repositories/PgAuditRepository';
import { PgAnalyticsRepository } from '../database/repositories/PgAnalyticsRepository';
import { UserRepository } from '../../core/repositories/UserRepository';
import { SensorRepository } from '../../core/repositories/SensorRepository';
import { HeatmapRepository } from '../../core/repositories/HeatmapRepository';
import { HistoryRepository } from '../../core/repositories/HistoryRepository';
import { AuditRepository } from '../../core/repositories/AuditRepository';
import { AnalyticsRepository } from '../../core/repositories/AnalyticsRepository';

let _userRepository: UserRepository | null = null;
let _sensorRepository: SensorRepository | null = null;
let _heatmapRepository: HeatmapRepository | null = null;
let _historyRepository: HistoryRepository | null = null;
let _auditRepository: AuditRepository | null = null;
let _analyticsRepository: AnalyticsRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!_userRepository) {
    _userRepository = new PgUserRepository();
  }
  return _userRepository;
}

export function setUserRepository(repo: UserRepository): void {
  _userRepository = repo;
}

export function getSensorRepository(): SensorRepository {
  if (!_sensorRepository) {
    _sensorRepository = new PgSensorRepository();
  }
  return _sensorRepository;
}

export function setSensorRepository(repo: SensorRepository): void {
  _sensorRepository = repo;
}

export function getHeatmapRepository(): HeatmapRepository {
  if (!_heatmapRepository) {
    _heatmapRepository = new PgHeatmapRepository();
  }
  return _heatmapRepository;
}

export function setHeatmapRepository(repo: HeatmapRepository): void {
  _heatmapRepository = repo;
}

export function getHistoryRepository(): HistoryRepository {
  if (!_historyRepository) {
    _historyRepository = new PgHistoryRepository();
  }
  return _historyRepository;
}

export function setHistoryRepository(repo: HistoryRepository): void {
  _historyRepository = repo;
}

export function getAuditRepository(): AuditRepository {
  if (!_auditRepository) {
    _auditRepository = new PgAuditRepository();
  }
  return _auditRepository;
}

export function setAuditRepository(repo: AuditRepository): void {
  _auditRepository = repo;
}

export function getAnalyticsRepository(): AnalyticsRepository {
  if (!_analyticsRepository) {
    _analyticsRepository = new PgAnalyticsRepository();
  }
  return _analyticsRepository;
}

export function setAnalyticsRepository(repo: AnalyticsRepository): void {
  _analyticsRepository = repo;
}
