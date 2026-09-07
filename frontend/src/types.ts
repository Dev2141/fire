export type ScreenTab = 'map' | 'episodes' | 'facilities' | 'analytics' | 'review' | 'auth';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN';

export type UrgencyTier = 
  | 'TIER 1 - IMMEDIATE' 
  | 'TIER 2 - PRIORITY' 
  | 'TIER 3 - MONITOR' 
  | 'ROUTINE';

export type AnomalyClassification = 
  | 'INDUSTRIAL_LIKELY'
  | 'FOREST_FIRE_LIKELY'
  | 'INDUSTRIAL_ACTIVITY'
  | 'UNCERTAIN'
  | 'COAL_FIRE_SMOLDERING'
  | 'SENSOR_GLINT';

export interface ThermalEpisode {
  id: string; // e.g. "EP-2026-04821"
  title: string; // "Bastar Dense Canopy Corridor, CG"
  districtState: string; // "Jagdalpur Div, CG"
  coordinates: {
    lat: number;
    lng: number;
    latStr: string;
    lngStr: string;
  };
  sensorPlatform: string; // "VIIRS SNPP 375m"
  firstDetectedUtc: string; // "11:14:02 UTC"
  timelineAge: string; // "Active 4h (3h 41m ago)"
  relativeTime: string; // "3h 41m ago"
  radiantHeatMw: number; // 78.4
  frpPeakMw: number;
  mlInference: string; // "UNCERTAIN (?)"
  confidence: number; // 44.5
  riskLevel: RiskLevel;
  urgencyTier: UrgencyTier;
  ppacProximityKm: number; // 8.4
  isCanopyBreach?: boolean;
  status: 'AWAITING VERIFICATION' | 'CONFIRMED' | 'RECLASSIFIED' | 'REJECTED_GLINT';
  groundTruthClassification?: string;
  notes?: string;
  directAlertSent?: boolean;
  
  // Detailed imagery & metadata
  topoData?: {
    frontAdvance: string; // "18 km/h WSW ADVANCE"
    perimeter: string; // "Perimeter: 14.2 km Active Front"
    elevation: string; // "Elev. 2450m Peak"
    landCoverMatrix: string; // "82% Dense Sal Forest"
    flameFrontWidth: string; // "Avg 120m Intensity Belt"
    imageUrl: string;
  };
  thermalData?: {
    temperatureRange: string; // "SLSTR TIR // 35°C - 900°C"
    contrast: string; // "+48.2 K Above Baseline"
    facilityBufferCheck: string; // "8.4 km (Clear of Refinery)"
    imageUrl: string;
  };
  lulcData?: {
    dominantClass: string;
    cropsPct: number;
    treesPct: number;
    urbanPct: number;
    rangelandPct: number;
  };
}

export interface IndustrialFacility {
  id: string; // "PPAC-REF-009-SEC4"
  name: string; // "Reliance Jamnagar Refinery Complex — Sector 4 Flaring Infrastructure"
  shortName: string; // "Reliance Jamnagar Refinery Complex — Sector 4"
  category: 'Refineries' | 'Thermal' | 'Steel' | 'Coal' | 'LNG';
  stateZone: string; // "Gujarat, West Zone"
  district: string; // "Jamnagar, Gujarat"
  coordinates: {
    lat: number;
    lng: number;
    latStr: string;
    lngStr: string;
  };
  bufferRadiusKm: number; // 4.8
  status: 'EXCEEDANCE' | 'NOMINAL' | 'SCHEDULED' | 'PERSISTENT';
  linkedEpisodesCount: number;
  baselineOperatingMw: number;
  peakFrp12mMw: number;
  nominalFrpCapMw: number;
  registeredStacks: string; // "14 Active / 2 Stby"
  bufferOverlaps: string; // "0 Wildfire"
  satelliteFeed: {
    orbitPass: string;
    fov: string;
    target: string;
    coreTemp: string;
    sensor: string;
    calibration: string;
    imageUrl: string;
  };
  cctvFeed: {
    title: string;
    exceedanceStatus: string;
    flameVelocity: string;
    stackHeight: string;
    analytics: string;
    plumeDispersion: string;
    imageUrl: string;
  };
  monthlyFRP: { month: string; value: number; limit: number }[];
  recentDetections: {
    id: string;
    timestampUtc: string;
    frpMw: number;
    sensor: string;
    classification: string;
    analystStatus: string;
    flagged?: boolean;
  }[];
}

export interface AnalystUser {
  name: string;
  callsign: string;
  idNumber: string;
  email: string;
  role: string;
  clearanceLevel: string;
  isAuthenticated: boolean;
}

