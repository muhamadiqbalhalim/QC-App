/**
 * =========================================================
 * SEVERITY CONSTANTS
 * =========================================================
 */

export const SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

/**
 * =========================================================
 * SEVERITY ORDER
 * =========================================================
 */

export const SEVERITY_ORDER = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

/**
 * =========================================================
 * SEVERITY COLORS
 * =========================================================
 */

export const SEVERITY_COLORS = {

  Low: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
  },

  Medium: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20',
  },

  High: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20',
  },

  Critical: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
  },

};

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

export const getSeverityColor =
  (severity) =>
    SEVERITY_COLORS[severity] ||
    SEVERITY_COLORS.Low;

export default SEVERITY;