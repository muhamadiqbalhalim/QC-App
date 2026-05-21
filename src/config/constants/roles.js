/**
 * =========================================================
 * ROLES
 * =========================================================
 * Simplified enterprise role system.
 *
 * CURRENT MVP:
 * - EXECUTIVE
 * - STAFF
 *
 * Future:
 * - can expand later if needed
 * =========================================================
 */

export const ROLES = {

  EXECUTIVE:
    'EXECUTIVE',

  STAFF:
    'STAFF',

};

/**
 * =========================================================
 * EXECUTIVE IDS
 * =========================================================
 * Temporary executive whitelist.
 *
 * CURRENT:
 * - 2500 = Executive
 *
 * Future:
 * - move to Firebase
 * - admin management
 * =========================================================
 */

export const EXECUTIVE_IDS = [
  '2500',
];

/**
 * =========================================================
 * ROLE LABELS
 * =========================================================
 */

export const ROLE_LABELS = {

  [ROLES.EXECUTIVE]:
    'Executive',

  [ROLES.STAFF]:
    'QC Staff',

};

/**
 * =========================================================
 * DETECT USER ROLE
 * =========================================================
 */

export const detectUserRole = (
  employeeId
) => {

  const normalizedId =
    String(employeeId).trim();

  return EXECUTIVE_IDS.includes(
    normalizedId
  )
    ? ROLES.EXECUTIVE
    : ROLES.STAFF;

};

/**
 * =========================================================
 * ROLE HELPERS
 * =========================================================
 */

export const isExecutive = (
  role
) =>
  role === ROLES.EXECUTIVE;

export const isStaff = (
  role
) =>
  role === ROLES.STAFF;

/**
 * =========================================================
 * EXECUTIVE USER CHECK
 * =========================================================
 */

export const isExecutiveUser = (
  employeeId
) => {

  return EXECUTIVE_IDS.includes(
    String(employeeId).trim()
  );

};

export default ROLES;