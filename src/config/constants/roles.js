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

export const EXECUTIVES = {
  '2500': {
    name: 'Executive QC',
    role: 'EXECUTIVE',
  },
};

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

return EXECUTIVES[normalizedId]
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

  const normalizedId =
    String(employeeId ?? '')
      .trim();

  return !!EXECUTIVES[normalizedId];

};

export const getExecutiveName = (
  employeeId
) => {

  const normalizedId =
    String(employeeId ?? '')
      .trim();

  return (
    EXECUTIVES[normalizedId]?.name ||
    'Unknown Executive'
  );

};
