import { apiService as api } from '@/lib/api';
import { ENDPOINTS } from '@/constants';
import type { ApiResponse } from '@/types/api.types';
import type { Maneuver, ManeuverError } from '@/models/practice.model';
import { withErrorHandling } from '@/utils';

export const practiceService = {
  getManeuvers: withErrorHandling((licenseCategory: string) =>
    api.get<ApiResponse<Maneuver[]>>(ENDPOINTS.SIMULATION.MANEUVERS, {
      params: { licenseCategory },
    }),
  ),

  getManeuverById: withErrorHandling((id: string) =>
    api.get<ApiResponse<Maneuver>>(ENDPOINTS.SIMULATION.MANEUVER(id)),
  ),

  getManeuverErrors: withErrorHandling((licenseCategory: string) =>
    api.get<ApiResponse<ManeuverError[]>>(ENDPOINTS.SIMULATION.MANEUVER_ERRORS, {
      params: { licenseCategory },
    }),
  ),
};
