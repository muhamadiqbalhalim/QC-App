import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import {
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
} from 'lucide-react';

import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

import {
  db,
} from '../config/firebase';

import {
  FORM_REGISTRY,
} from '../config/FormRegistry';

import {
  STORAGE_KEYS,
} from '../config/constants/storageKeys';

import {
  TRAINING_STATUS,
} from '../config/constants/status';

import DynamicFormEngine from '../components/dashboard/forms/engine/DynamicFormEngine';

export default function WisFormRegistration() {

  const navigate =
    useNavigate();

  const { trainingId } =
    useParams();

  /**
   * =========================================================
   * TRAINING CONFIG
   * =========================================================
   */

  const trainingConfig =
    useMemo(
      () =>
        FORM_REGISTRY[
          trainingId
        ],
      [trainingId]
    );

  /**
   * =========================================================
   * CURRENT USER
   * =========================================================
   */

  const [currentUser] =
    useState(() => {

      try {

        return JSON.parse(
          localStorage.getItem(
            STORAGE_KEYS.SESSION
          ) || '{}'
        );

      } catch {

        return {};

      }

    });

  /**
   * =========================================================
   * STORAGE KEYS
   * =========================================================
   */

  const draftKey =
    `training_draft_${trainingId}_${currentUser?.employeeId}`;

  const tabKey =
    `training_tab_${trainingId}_${currentUser?.employeeId}`;

  /**
   * =========================================================
   * ACTIVE TAB
   * =========================================================
   */

  const [activeTab, setActiveTab] =
    useState('LH');

  /**
   * =========================================================
   * WORKFLOW DATA
   * =========================================================
   */

  const [workflowData, setWorkflowData] =
    useState(null);

  /**
   * =========================================================
   * LOAD SAVED TAB
   * =========================================================
   */

  useEffect(() => {

    const savedTab =
      localStorage.getItem(
        tabKey
      );

    if (
      savedTab &&
      trainingConfig?.tabs?.includes(
        savedTab
      )
    ) {

      setActiveTab(savedTab);

    }

  }, [
    tabKey,
    trainingConfig,
  ]);

  /**
   * =========================================================
   * SAVE TAB
   * =========================================================
   */

  useEffect(() => {

    localStorage.setItem(
      tabKey,
      activeTab
    );

  }, [
    activeTab,
    tabKey,
  ]);

  /**
   * =========================================================
   * FETCH WORKFLOW
   * =========================================================
   */

  const fetchWorkflowStatus =
    useCallback(async () => {

    if (
      !currentUser?.employeeId
    ) {

      setLoading(false);

      return;

    }

      try {

        const progressRef =
          doc(
            db,
            'user_progress',
            `${currentUser.employeeId}_${trainingId}`
          );

        const snapshot =
          await getDoc(
            progressRef
          );

        if (
          snapshot.exists()
        ) {

          const data =
            snapshot.data();

          setWorkflowData(
            data
          );

          /**
           * LOAD SUBMITTED ANSWERS
           */

          if (
            data.answers
          ) {

            setFormData((prev) => ({

              ...prev,

              inspection:
                data.answers,

            }));

          }

        }

      } catch (error) {

        console.error(
          'Workflow fetch failed:',
          error
        );

      }

    }, [
      currentUser,
      trainingId,
    ]);

  /**
   * =========================================================
   * INITIAL FETCH
   * =========================================================
   */

  useEffect(() => {

    fetchWorkflowStatus();

  }, [fetchWorkflowStatus]);

  /**
   * =========================================================
   * FORM DATA
   * =========================================================
   */

  const [formData, setFormData] =
    useState({

      meta: {

        name:
          currentUser?.name ||
          'N/A',

        OperatorNo:
          currentUser?.employeeId ||
          'N/A',

        department:
          currentUser?.department ||
          'N/A',

        role:
          currentUser?.role ||
          'OPERATOR',

        date: new Date()
          .toISOString()
          .split('T')[0],

      },

      inspection: {},

      approval: {
        execId: '',
      },

    });

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  /**
   * =========================================================
   * INSPECTION SUMMARY
   * =========================================================
   */

  const inspectionSummary =
    useMemo(() => {

      let total = 0;
      let passed = 0;
      let failed = 0;

      Object.values(
        formData.inspection || {}
      ).forEach((section) => {

        Object.values(
          section || {}
        ).forEach((row) => {

          Object.values(
            row || {}
          ).forEach((value) => {

            if (!value) {
              return;
            }

            total++;

            if (
              value === 'PASS'
            ) {

              passed++;

            }

            if (
              value === 'FAIL'
            ) {

              failed++;

            }

          });

        });

      });

      return {

        total,
        passed,
        failed,

        ready:
          total > 0 &&
          failed === 0,

      };

    }, [formData.inspection]);

  /**
   * =========================================================
   * INSPECTION CHANGE
   * =========================================================
   */

  const handleInspectionChange =
    (
      sectionId,
      rowId,
      fieldId,
      value
    ) => {

      setFormData((prev) => ({

        ...prev,

        inspection: {

          ...prev.inspection,

          [sectionId]: {

            ...prev.inspection?.[
              sectionId
            ],

            [rowId]: {

              ...prev.inspection?.[
                sectionId
              ]?.[
                rowId
              ],

              [fieldId]:
                value,

            },

          },

        },

      }));

    };

  /**
   * =========================================================
   * APPROVAL CHANGE
   * =========================================================
   */

  const handleApprovalChange =
    (event) => {

      setFormData((prev) => ({

        ...prev,

        approval: {

          execId:
            event.target.value,

        },

      }));

    };

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit =
    async () => {

      if (isSubmitting) {
        return;
      }

      setErrorMessage('');

      const executiveId =
        formData.approval.execId
          .trim();

      if (!executiveId) {

        setErrorMessage(
          'Executive ID is required.'
        );

        return;

      }

      setIsSubmitting(true);

      try {

        const progressRef =
          doc(
            db,
            'user_progress',
            `${currentUser.employeeId}_${trainingId}`
          );

        await setDoc(
          progressRef,
          {

            userId:
              currentUser?.id ||
              'N/A',

            employeeId:
              currentUser?.employeeId ||
              'N/A',

            employeeName:
              currentUser?.name ||
              'Unknown',

            department:
              currentUser?.department ||
              'N/A',

            role:
              currentUser?.role ||
              'OPERATOR',

            trainingId,

            trainingTitle:
              trainingConfig.title,

            severity:
              trainingConfig.severity ||
              'Standard',

            lifecycleStatus:
              TRAINING_STATUS.SUBMITTED,

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

            answers:
              formData.inspection,

            meta:
              formData.meta,

            inspectionSummary,

            completedAt:
              new Date().toISOString(),

            createdAt:
              workflowData?.createdAt ||
              new Date().toISOString(),

            updatedAt:
              new Date().toISOString(),

          },
          {
            merge: true,
          }
        );

        /**
         * CLEAR DRAFT
         */

        localStorage.removeItem(
          draftKey
        );

        localStorage.removeItem(
          tabKey
        );

        /**
         * REFRESH STATUS
         */

        fetchWorkflowStatus();

        /**
         * REDIRECT
         */

        setTimeout(() => {

          navigate(
            '/training-og'
          );

        }, 1200);

      } catch (error) {

        console.error(
          'Submission Error:',
          error
        );

        setErrorMessage(
          'Failed to submit audit.'
        );

      } finally {

        setIsSubmitting(false);

      }

    };

  /**
   * =========================================================
   * WORKFLOW BANNER
   * =========================================================
   */

  const renderWorkflowBanner =
    () => {

      if (!workflowData) {
        return null;
      }

      const status =
        workflowData.lifecycleStatus;

      /**
       * APPROVED
       */

      if (
        status ===
        TRAINING_STATUS.APPROVED
      ) {

        return (

          <div className="p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">

            <div className="flex items-start gap-4">

              <CheckCircle2 size={22} />

              <div>

                <h3 className="font-black text-lg mb-2">
                  Approved by Executive
                </h3>

                <p className="text-sm opacity-80">
                  This inspection audit has been approved.
                </p>

              </div>

            </div>

          </div>

        );

      }

      /**
       * REJECTED
       */

      if (
        status ===
        TRAINING_STATUS.REJECTED
      ) {

        return (

          <div className="p-5 rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400">

            <div className="flex items-start gap-4">

              <XCircle size={22} />

              <div>

                <h3 className="font-black text-lg mb-2">
                  Audit Rejected
                </h3>

                <p className="text-sm opacity-80">
                  Executive review requires correction or resubmission.
                </p>

              </div>

            </div>

          </div>

        );

      }

      /**
       * SUBMITTED
       */

      if (
        status ===
        TRAINING_STATUS.SUBMITTED
      ) {

        return (

          <div className="p-5 rounded-3xl border border-amber-500/20 bg-amber-500/10 text-amber-400">

            <div className="flex items-start gap-4">

              <Clock3 size={22} />

              <div>

                <h3 className="font-black text-lg mb-2">
                  Pending Executive Approval
                </h3>

                <p className="text-sm opacity-80">
                  Audit submitted successfully and waiting for executive review.
                </p>

              </div>

            </div>

          </div>

        );

      }

      return null;

    };

  /**
   * =========================================================
   * INVALID TRAINING
   * =========================================================
   */

  if (!trainingConfig) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
      <div
        className="
          min-h-screen
          w-full
          max-w-full
          mx-auto
          px-3
          py-4
          pb-32
          sm:px-5
          sm:py-5
          lg:px-8
          lg:py-8
          space-y-4
          sm:space-y-5
          bg-[#F8FAFC]
          text-slate-900
        "
      >

      {renderWorkflowBanner()}

      {/* ===================================================== */}
      {/* TOP BAR */}
      {/* ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <button
          onClick={() =>
            navigate('/training-og')
          }
          className="
            flex
            items-center
            gap-2
            text-sm
            font-bold
            opacity-60
            hover:opacity-100
            transition-all
          "
        >

          <ArrowLeft size={16} />

          Back to Trainings

        </button>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        >

          <div
            className="
              flex
              items-center
              justify-center
              px-4
              py-3
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-500/10
              text-amber-400
              text-sm
              font-bold
            "
          >
            {trainingConfig.severity}
          </div>

        </div>

      </div>

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div
        className="
          p-5
          sm:p-6
          rounded-3xl
          border
          bg-white
          border-slate-200
        "
      >

        <p className="text-sm text-amber-500 font-bold mb-3">
          Training Audit
        </p>

        <h1
          className="
            text-2xl
            sm:text-3xl
            lg:text-4xl
            font-black
            leading-tight
            break-words
          "
        >
          {trainingConfig.title}
        </h1>

        <p className="text-sm opacity-60 mt-3 max-w-2xl leading-7">
          {trainingConfig.description}
        </p>

        {/* ================================================= */}
        {/* STATUS */}
        {/* ================================================= */}

        <div className="flex flex-wrap items-center gap-3 mt-6">

          <div className="px-4 py-2 rounded-2xl border border-slate-300  text-xs font-bold opacity-70">
            {trainingConfig.code}
          </div>

          <div className="px-4 py-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-bold">
            Total:
            {' '}
            {inspectionSummary.total}
          </div>

          <div className="px-4 py-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
            PASS:
            {' '}
            {inspectionSummary.passed}
          </div>

          <div className="px-4 py-2 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold">
            FAIL:
            {' '}
            {inspectionSummary.failed}
          </div>

          <div
            className={`
              px-4
              py-2
              rounded-2xl
              border
              text-xs
              font-bold
              ${
                inspectionSummary.ready
                  ? `
                    border-emerald-500/20
                    bg-emerald-500/10
                    text-emerald-400
                  `
                  : `
                    border-amber-500/20
                    bg-amber-500/10
                    text-amber-400
                  `
              }
            `}
          >

            {inspectionSummary.ready
              ? 'READY FOR REVIEW'
              : 'REQUIRES REVIEW'}

          </div>

        </div>

      </div>

      {/* ===================================================== */}
      {/* TABS */}
      {/* ===================================================== */}

      {trainingConfig.tabs && (

        <div
          className="
            flex
            overflow-x-auto
            gap-3
            pb-2
            scrollbar-thin
          "
        >

          {trainingConfig.tabs.map(
            (tab) => (

              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`
                  min-w-[120px]
                  min-h-[52px]
                  px-6
                  rounded-2xl
                  text-sm
                  whitespace-nowrap
                  font-bold
                  transition-all
                  ${
                    activeTab === tab
                      ? `
                        bg-amber-500
                        text-slate-950
                      `
                      : `
                        border
                        border-slate-300
                        
                      `
                  }
                `}
              >
                {tab}
              </button>

            )
          )}

        </div>

      )}

      {/* ===================================================== */}
      {/* FORM */}
      {/* ===================================================== */}

      <DynamicFormEngine
        trainingId={trainingId}
        trainingConfig={trainingConfig}
        formData={formData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleInspectionChange={
          handleInspectionChange
        }
      />

      {/* ===================================================== */}
      {/* SUBMIT */}
      {/* ===================================================== */}

      <div
        className="
          sticky
          bottom-0
          z-40
          p-4
          sm:p-6
          rounded-t-3xl
          lg:rounded-3xl
          border
          flex
          flex-col
          lg:flex-row
          gap-6
          justify-between
          lg:items-center
          backdrop-blur-xl
          bg-white/95
          border-slate-200
        "
      >

        <div className="space-y-3 w-full">

          <div>

            <p className="text-sm font-bold mb-2">
              Executive Approval ID
            </p>

            <input
              type="text"
              value={
                formData.approval
                  .execId
              }
              onChange={
                handleApprovalChange
              }
              placeholder="Enter executive ID"
              className="
                w-full
                sm:min-w-[260px]
                px-5
                py-4
                rounded-2xl
                border
                border-slate-300
                
                bg-transparent
                outline-none
                focus:border-amber-500/30
              "
            />

            <p className="text-xs opacity-60 mt-2">
              Executive responsible for approval
            </p>

          </div>

          {errorMessage && (

            <p className="text-sm text-red-500 font-medium">
              {errorMessage}
            </p>

          )}

        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="
            w-full
            sm:w-auto
            sm:min-w-[220px]
            flex
            items-center
            justify-center
            gap-3
            px-8
            py-5
            rounded-2xl
            bg-amber-500
            hover:bg-amber-400
            active:scale-[0.98]
            disabled:opacity-50
            text-slate-950
            font-black
            uppercase
            tracking-wider
            transition-all
          "
        >

          {isSubmitting ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Submitting...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Submit Audit
            </>
          )}

        </button>

      </div>

    </div>
  );
}