/**
 * =========================================================
 * TRAINING WORKFLOW STATUS
 * =========================================================
 */

export const TRAINING_STATUS = {

  NOT_STARTED:
    'NOT_STARTED',

  IN_PROGRESS:
    'IN_PROGRESS',

  SUBMITTED:
    'SUBMITTED',

  APPROVED:
    'APPROVED',

  REJECTED:
    'REJECTED',

};

/**
 * =========================================================
 * RESULT STATUS
 * =========================================================
 */

export const RESULT_STATUS = {

  PASSED:
    'PASSED',

  PROBATION:
    'PROBATION',

  FAILED:
    'FAILED',

};

/**
 * =========================================================
 * STATUS LABELS
 * =========================================================
 */

export const STATUS_LABELS = {

  NOT_STARTED:
    'Not Started',

  IN_PROGRESS:
    'In Progress',

  SUBMITTED:
    'Submitted',

  APPROVED:
    'Approved',

  REJECTED:
    'Rejected',

  PASSED:
    'Passed',

  PROBATION:
    'Probation',

  FAILED:
    'Failed',

};

/**
 * =========================================================
 * STATUS COLORS
 * =========================================================
 */

export const STATUS_COLORS = {

  NOT_STARTED: {
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  },

  IN_PROGRESS: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
  },

  SUBMITTED: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },

  APPROVED: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },

  REJECTED: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },

  PASSED: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },

  PROBATION: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },

  FAILED: {
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    border: 'border-red-500/20',
  },

};

export default TRAINING_STATUS;