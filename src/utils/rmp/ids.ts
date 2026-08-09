export const GMU_SCHOOL_LEGACY_ID = 352;
export const GMU_SCHOOL_RELAY_ID = schoolNodeId(GMU_SCHOOL_LEGACY_ID);

export function schoolNodeId(legacyId: number): string {
  return btoa(`School-${legacyId}`);
}

export function teacherNodeId(legacyId: number): string {
  return btoa(`Teacher-${legacyId}`);
}
