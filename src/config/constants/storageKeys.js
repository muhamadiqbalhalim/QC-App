/**
 * =========================================================
 * STORAGE KEYS
 * =========================================================
 */

export const STORAGE_KEYS = {

  SESSION:
    'qc_session',

  THEME:
    'qc_theme',

  TRAINING_PROGRESS:
    'qc_training_progress',

  DASHBOARD_CACHE:
    'qc_dashboard_cache',

  ACTIVE_TAB:
    'qc_active_tab',

  DRAFT:
    'qc_draft',

};

/**
 * =========================================================
 * CLEAR APP STORAGE
 * =========================================================
 */

export const clearAppStorage = () => {

  Object.values(
    STORAGE_KEYS
  ).forEach((key) => {

    localStorage.removeItem(
      key
    );

  });

};

/**
 * =========================================================
 * DYNAMIC HELPERS
 * =========================================================
 */

export const getDraftKey = (
  trainingId,
  userId
) =>
  `${STORAGE_KEYS.DRAFT}_${trainingId}_${userId}`;

export const getTabKey = (
  trainingId,
  userId
) =>
  `${STORAGE_KEYS.ACTIVE_TAB}_${trainingId}_${userId}`;