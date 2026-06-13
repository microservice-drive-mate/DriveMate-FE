export type PracticeLicense = 'B1' | 'B2' | 'C';
export type PracticeCardType = 'circuit' | 'errors';

// Maps directly to the simulation-service `ManeuverCheckpoint` schema.
export interface ManeuverCheckpoint {
  id: string;
  title: string;
  instruction: string;
  penalty: string;
  displayOrder: number;
  x?: number | null;
  y?: number | null;
  visualColor?: string | null;
}

// Maps directly to the simulation-service `Maneuver` schema.
export interface Maneuver {
  id: string;
  title: string;
  description: string;
  licenseCategory: string;
  displayOrder: number;
  checkpoints: ManeuverCheckpoint[];
}

// Maps directly to the simulation-service `ManeuverError` schema.
export interface ManeuverError {
  id: string;
  licenseCategory: string;
  code: string;
  description: string;
  severity: string;
  pointsDeducted?: number | null;
  isFatal?: boolean;
  isGeneral?: boolean;
  isActive?: boolean;
  visualColor?: string | null;
  icon?: string | null;
}
