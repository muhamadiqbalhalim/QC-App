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
  ShieldAlert,
  XCircle,
  FileDown,
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
  useTheme,
} from '../context/ThemeContext';

import {
  FORM_REGISTRY,
} from '../config/FormRegistry';

import {
  STORAGE_KEYS,
} from '../config/constants/storageKeys';

import {
  ROLES,
} from '../config/constants/roles';

import {
  TRAINING_STATUS,
  RESULT_STATUS,
} from '../config/constants/status';

import DynamicFormEngine from '../components/dashboard/forms/engine/DynamicFormEngine';

import {
  exportAuditPdf,
} from '../utils/pdf/exportAuditPdf';

export default function WisFormRegistration() {

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const navigate =
    useNavigate();

  const { trainingId } =
    useParams();

  const { darkMode } =
    useTheme();

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
   * WORKFLOW STATUS
   * =========================================================
   */

  const [workflowData, setWorkflowData] =
    useState(null);

  /**
   * =========================================================
   * RESTORE ACTIVE TAB
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
   * SAVE ACTIVE TAB
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
   * FETCH WORKFLOW STATUS
   * =========================================================
   */

  const fetchWorkflowStatus =
    useCallback(async () => {

      if (
        !currentUser?.employeeId
      ) {

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

          setWorkflowData(
            snapshot.data()
          );

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

        staffNo:
          currentUser?.employeeId ||
          'N/A',

        department:
          currentUser?.department ||
          'N/A',

        role:
          currentUser?.role ||
          ROLES.STAFF,

        date: new Date()
          .toISOString()
          .split('T')[0],

        preTest: '',
        postTest: '',

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

  const [submitSuccess, setSubmitSuccess] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState('');

  /**
   * =========================================================
   * LIVE SCORE
   * =========================================================
   */

  const totalMark =
    useMemo(() => {

      let totalAnswers = 0;
      let totalPassed = 0;

      Object.values(
        formData.inspection || {}
      ).forEach((section) => {

        Object.values(
          section || {}
        ).forEach((row) => {

          Object.values(
            row || {}
          ).forEach((value) => {

            totalAnswers++;

            if (
              value === 1 ||
              value === '1' ||
              value === 'OK'
            ) {

              totalPassed++;

            }

          });

        });

      });

      if (totalAnswers === 0) {
        return 0;
      }

      return Math.round(
        (
          totalPassed /
          totalAnswers
        ) * 100
      );

    }, [formData.inspection]);

  /**
   * =========================================================
   * EXPORT PDF
   * =========================================================
   */

  const handleExportPdf =
    async () => {

      try {

        await exportAuditPdf({

          currentUser,

          trainingConfig,

          workflowData,

          formData,

          totalMark,

        });

      } catch (error) {

        console.error(
          'PDF export failed:',
          error
        );

      }

    };

  /**
   * =========================================================
   * HANDLE INSPECTION
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

        const passingScore =
          trainingConfig.passingScore || 80;

        const resultStatus =
          totalMark >= passingScore
            ? RESULT_STATUS.PASSED
            : RESULT_STATUS.PROBATION;

        await setDoc(
          progressRef,
          {

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

            trainingId,

            trainingTitle:
              trainingConfig.title,

            severity:
              trainingConfig.severity ||
              'Standard',

            finalScore:
              totalMark,

            passingScore,

            resultStatus,

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

            completedAt:
              new Date().toISOString(),

            createdAt:
              new Date().toISOString(),

            updatedAt:
              new Date().toISOString(),

          },
          {
            merge: true,
          }
        );

        localStorage.removeItem(
          draftKey
        );

        localStorage.removeItem(
          tabKey
        );

        setSubmitSuccess(true);

        fetchWorkflowStatus();

        setTimeout(() => {

          navigate('/dashboard');

        }, 1500);

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
   * STATUS BANNER
   * =========================================================
   */

  const renderWorkflowBanner =
    () => {

      if (!workflowData) {
        return null;
      }

      const status =
        workflowData.lifecycleStatus;

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
                  Your audit has been reviewed and approved.
                </p>

              </div>

            </div>

          </div>

        );

      }

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
                  Submission Rejected
                </h3>

                <p className="text-sm opacity-80">
                  Executive review requires correction or resubmission.
                </p>

              </div>

            </div>

          </div>

        );

      }

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
                  Waiting Executive Approval
                </h3>

                <p className="text-sm opacity-80">
                  Audit submitted successfully and pending executive review.
                </p>

              </div>

            </div>

          </div>

        );

      }

      if (
        workflowData.resultStatus ===
        RESULT_STATUS.PROBATION
      ) {

        return (

          <div className="p-5 rounded-3xl border border-orange-500/20 bg-orange-500/10 text-orange-400">

            <div className="flex items-start gap-4">

              <ShieldAlert size={22} />

              <div>

                <h3 className="font-black text-lg mb-2">
                  Probation Required
                </h3>

                <p className="text-sm opacity-80">
                  Final score below passing threshold.
                </p>

              </div>

            </div>

          </div>

        );

      }

      return null;

    };

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
      className={`
        max-w-7xl
        mx-auto
        p-6
        space-y-6
        ${
          darkMode
            ? 'text-white'
            : 'text-slate-900'
        }
      `}
    >

      {renderWorkflowBanner()}

      {/* TOP BAR */}
      <div className="flex items-center justify-between">

        <button
          onClick={() =>
            navigate('/training-og')
          }
          className="
            flex items-center gap-2
            text-xs
            font-black
            uppercase
            tracking-widest
            opacity-60
            hover:opacity-100
            transition-all
          "
        >

          <ArrowLeft size={14} />

          Back to Trainings

        </button>

        <div className="flex items-center gap-3">

          {/* EXPORT */}
          <button
            onClick={handleExportPdf}
            className="
              flex items-center gap-2
              px-5 py-3
              rounded-2xl
              border
              border-blue-500/20
              bg-blue-500/10
              hover:bg-blue-500/20
              text-blue-400
              text-xs
              font-black
              uppercase
              tracking-widest
              transition-all
            "
          >

            <FileDown size={16} />

            Export PDF

          </button>

          {/* SEVERITY */}
          <div
            className="
              px-4 py-2
              rounded-2xl
              border
              border-amber-500/20
              bg-amber-500/10
              text-amber-400
              text-xs
              font-black
              uppercase
              tracking-widest
            "
          >
            {trainingConfig.severity}
          </div>

        </div>

      </div>

      {/* HEADER */}
      <div
        className={`
          p-6
          rounded-3xl
          border
          ${
            darkMode
              ? `
                bg-white/5
                border-white/10
              `
              : `
                bg-white
                border-slate-200
              `
          }
        `}
      >

        <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-black mb-3">
          Training Audit
        </p>

        <h1 className="text-3xl font-black">
          {trainingConfig.title}
        </h1>

        <p className="text-sm opacity-60 mt-3 max-w-2xl">
          {trainingConfig.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-6">

          <div className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest opacity-70">
            {trainingConfig.code}
          </div>

          <div className="px-4 py-2 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest opacity-70">
            Passing Score:
            {' '}
            {trainingConfig.passingScore}%
          </div>

          <div className="px-4 py-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest">
            Live Score:
            {' '}
            {totalMark}%
          </div>

        </div>

      </div>

      {/* TABS */}
      {trainingConfig.tabs && (

        <div className="flex gap-3">

          {trainingConfig.tabs.map(
            (tab) => (

              <button
                key={tab}
                onClick={() =>
                  setActiveTab(tab)
                }
                className={`
                  px-6 py-3
                  rounded-2xl
                  text-sm
                  font-black
                  uppercase
                  tracking-widest
                  transition-all
                  ${
                    activeTab === tab
                      ? `
                        bg-amber-500
                        text-slate-950
                      `
                      : `
                        border
                        border-white/10
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

      {/* FORM */}
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

      {/* SUBMIT */}
      <div
        className={`
          p-6
          rounded-3xl
          border
          flex
          flex-col
          lg:flex-row
          gap-6
          justify-between
          lg:items-center
          ${
            darkMode
              ? `
                bg-white/5
                border-white/10
              `
              : `
                bg-white
                border-slate-200
              `
          }
        `}
      >

        <div className="space-y-3">

          <div>

            <p className="text-xs uppercase tracking-[0.3em] opacity-50 font-black mb-2">
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
              placeholder="2500"
              className="
                px-5 py-4
                rounded-2xl
                border
                border-white/10
                bg-transparent
                font-mono
                outline-none
                focus:border-amber-500/30
                min-w-[260px]
              "
            />

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
            flex items-center justify-center gap-3
            px-8 py-5
            rounded-2xl
            bg-amber-500
            hover:bg-amber-400
            disabled:opacity-50
            text-slate-950
            font-black
            uppercase
            tracking-widest
            transition-all
            min-w-[220px]
          "
        >

          {isSubmitting ? (
            <>
              <Loader2
                size={18}
                className="animate-spin"
              />
              Finalizing...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Finalize Audit
            </>
          )}

        </button>

      </div>

    </div>
  );
}