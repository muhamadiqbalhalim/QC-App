/**
 * ======================================================
 * FORM REGISTRY
 * ======================================================
 *
 * CENTRALIZED TRAINING CONFIGURATION SYSTEM
 *
 * RESPONSIBILITIES:
 * - Register all training modules
 * - Configure inspection tabs
 * - Define severity level
 * - Assign datasets
 * - Configure dashboard metadata
 * - Power urgent training logic
 *
 * ======================================================
 */

/* ===================================================== */
/* DATA IMPORTS */
/* ===================================================== */

import t006cLHData from '../data/inspections/t006c/lh';
import t006cRHData from '../data/inspections/t006c/rh';

/* ===================================================== */
/* CONSTANTS */
/* ===================================================== */

import { ROLES } from './constants/roles';
import { SEVERITY } from './constants/severity';

/* ===================================================== */
/* FORM REGISTRY */
/* ===================================================== */

export const FORM_REGISTRY = {

  /**
   * ====================================================
   * T006C
   * ====================================================
   */
  t006c: {

    /**
     * Basic Metadata
     */
    id: 't006c',

    code: 'T006-C',

    title:
      'ARM ASSY, RR SUSPENSION',

    shortTitle:
      'Rear Suspension Arm',
        /**
   * WIS INFORMATION
   */

    model:
      'D27A',

    lineNo:
      '5-3',

    partNo:
      '48703-BZ360',

    partName:
      'ARM ASSY RR SUSPENSION',

    cycleTime:
      '128 sec/piece',

    page:
      '3/3',

    wisRevision:
      '2026',

    description:
      'Rear suspension arm assembly inspection and quality verification workflow for QC operational competency assessment.',

    /**
     * Category
     */
    category: 'Suspension',

    /**
     * Severity
     */
    severity: SEVERITY.CRITICAL,

    /**
     * Passing Rules
     */
    passingScore: 80,

    /**
     * Training Metadata
     */
    estimatedDuration:
      '25 Minutes',

    version: '2.1.0',

    status: 'ACTIVE',

    /**
     * Workflow Rules
     */
    hasApproval: true,

    /**
     * Tabs
     */
    tabs: [
      'LH',
      'RH',
    ],

    /**
     * Allowed Roles
     */
    allowedRoles: [
      ROLES.OPERATOR,
      ROLES.EXECUTIVE,
    ],

    /**
     * Dynamic Inspection Sources
     */
    dataSources: {

      LH: t006cLHData,

      RH: t006cRHData,

    },

    /**
     * Dashboard Metadata
     */
    createdAt: '2026-05-15',

    deadline: '2026-07-20',

    /**
     * UI Metadata
     */
    ui: {

      badgeColor: 'red',

      accentColor: 'amber',

    },

  },

};