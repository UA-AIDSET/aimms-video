/** Scene 4 — patient image is a fixed hero anchor (no drift, no spin). */
export const SCENE4_PATIENT_MAX_SCALE = 1.03;

export function clampPatientScale(s: number): number {
  return Math.min(SCENE4_PATIENT_MAX_SCALE, Math.max(1, s));
}
