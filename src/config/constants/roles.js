/**
 * =========================================================
 * ROLES
 * =========================================================
 * Simplified enterprise role system.
 *
 * CURRENT MVP:
 * - EXECUTIVE
 * - Operator
 *
 * Future:
 * - can expand later if needed
 * =========================================================
 */

export const ROLES = {

  EXECUTIVE:
    'EXECUTIVE',

  OPERATOR:
    'OPERATOR',

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

  [ROLES.OPERATOR]:
    'QC Operator',

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
  String(employeeId ?? '')
    .trim();

  return EXECUTIVE_IDS.includes(
    normalizedId
  )
    ? ROLES.EXECUTIVE
    : ROLES.OPERATOR;

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

export const isOperator = (
  role
) =>
  role === ROLES.OPERATOR;

/**
 * =========================================================
 * EXECUTIVE USER CHECK
 * =========================================================
 */

export const isExecutiveUser = (
  employeeId
) => {

  return EXECUTIVE_IDS.includes(
  String(employeeId ?? '')
    .trim()
);

};
