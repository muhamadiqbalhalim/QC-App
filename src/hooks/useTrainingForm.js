import {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import {
  db,
} from '../config/firebase';

import {
  doc,
  runTransaction,
} from 'firebase/firestore';

import {
  TRAINING_STATUS,
  RESULT_STATUS,
} from '../config/constants/status';

/**
 * =========================================================
 * TRAINING FORM HOOK
 * =========================================================
 * RESPONSIBILITIES:
 * - Submit audit
 * - Auto save draft
 * - Restore draft
 * - Clear draft
 * - Workflow lifecycle
 * - Executive approval flow
 * =========================================================
 */

export function useTrainingForm(
  trainingId,
  currentUser
) {

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [draftLoaded, setDraftLoaded] =
    useState(false);

  /**
   * =========================================================
   * DRAFT STORAGE KEY
   * =========================================================
   */

  const draftKey = useMemo(() => {

    return `qc_draft_${trainingId}_${currentUser?.employeeId || 'guest'}`;

  }, [
    trainingId,
    currentUser,
  ]);

  /**
   * =========================================================
   * SAVE DRAFT
   * =========================================================
   */

  const saveDraft = useCallback(
    (
      formData,
      activeTab
    ) => {

      try {

        const payload = {

          formData,

          activeTab,

          updatedAt:
            new Date().toISOString(),

        };

        localStorage.setItem(
          draftKey,
          JSON.stringify(payload)
        );

      } catch (error) {

        console.error(
          'Failed to save draft:',
          error
        );

      }

    },
    [draftKey]
  );

  /**
   * =========================================================
   * LOAD DRAFT
   * =========================================================
   */

  const loadDraft = useCallback(() => {

    try {

      const rawDraft =
        localStorage.getItem(
          draftKey
        );

      if (!rawDraft) {

        return null;

      }

      return JSON.parse(
        rawDraft
      );

    } catch (error) {

      console.error(
        'Failed to load draft:',
        error
      );

      return null;

    }

  }, [draftKey]);

  /**
   * =========================================================
   * CLEAR DRAFT
   * =========================================================
   */

  const clearDraft = useCallback(() => {

    try {

      localStorage.removeItem(
        draftKey
      );

      setDraftLoaded(false);

    } catch (error) {

      console.error(
        'Failed to clear draft:',
        error
      );

    }

  }, [draftKey]);

  /**
   * =========================================================
   * AUTO RESTORE FLAG
   * =========================================================
   */

  useEffect(() => {

    const draft =
      loadDraft();

    setDraftLoaded(
      !!draft
    );

  }, [loadDraft]);

  /**
   * =========================================================
   * SUBMIT AUDIT
   * =========================================================
   */

  const submitAudit = useCallback(
    async (
      formData,
      trainingMeta,
      totalMark
    ) => {

      /**
       * PREVENT DOUBLE SUBMIT
       */

      if (isSubmitting) {
        return;
      }

      /**
       * EXEC VALIDATION
       */

      const executiveId =
        formData?.approval?.execId
          ?.trim();

      if (!executiveId) {

        throw new Error(
          'Executive ID is required.'
        );

      }

      setIsSubmitting(true);

      try {

        await runTransaction(
          db,
          async (transaction) => {

            /**
             * =================================================
             * DOCUMENT REFERENCE
             * =================================================
             */

            const progressRef = doc(
              db,
              'user_progress',
              `${currentUser.employeeId}_${trainingId}`
            );

            /**
             * =================================================
             * RESULT STATUS
             * =================================================
             */

            const passingScore =
              trainingMeta?.passingScore ||
              80;

            const resultStatus =
              totalMark >= passingScore
                ? RESULT_STATUS.PASSED
                : RESULT_STATUS.PROBATION;

            /**
             * =================================================
             * SAVE WORKFLOW DATA
             * =================================================
             */

            transaction.set(
              progressRef,
              {

                /**
                 * SYSTEM
                 */

                schemaVersion: 1,

                lifecycleStatus:
                  TRAINING_STATUS.SUBMITTED,

                /**
                 * USER
                 */

                userId:
                  currentUser.id,

                employeeId:
                  currentUser.employeeId,

                employeeName:
                  currentUser.name,

                department:
                  currentUser.department,

                role:
                  currentUser.role,

                /**
                 * TRAINING
                 */

                trainingId,

                trainingTitle:
                  trainingMeta?.title ||
                  trainingId,

                severity:
                  trainingMeta?.severity ||
                  'Standard',

                /**
                 * RESULT
                 */

                finalScore:
                  totalMark,

                passingScore,

                resultStatus,

                /**
                 * EXECUTIVE FLOW
                 */

                approvedBy:
                  executiveId,

                approvedAt:
                  null,

                approvedByExecutive:
                  null,

                rejectedAt:
                  null,

                rejectionReason:
                  null,

                /**
                 * TIMESTAMPS
                 */

                completedAt:
                  new Date().toISOString(),

                createdAt:
                  new Date().toISOString(),

                updatedAt:
                  new Date().toISOString(),

                /**
                 * FORM DATA
                 */

                answers:
                  formData.inspection || {},

                meta:
                  formData.meta || {},

              },
              {
                merge: true,
              }
            );

          }
        );

        /**
         * =====================================================
         * CLEAR DRAFT AFTER SUCCESS
         * =====================================================
         */

        clearDraft();

        return true;

      } catch (error) {

        console.error(
          'Submission failed:',
          error
        );

        throw error;

      } finally {

        setIsSubmitting(false);

      }

    },
    [
      clearDraft,
      currentUser,
      trainingId,
      isSubmitting,
    ]
  );

  return {

    /**
     * Submission
     */

    submitAudit,
    isSubmitting,

    /**
     * Draft System
     */

    saveDraft,
    loadDraft,
    clearDraft,
    draftLoaded,

  };
}