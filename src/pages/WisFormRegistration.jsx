import { useEffect, useMemo, useState, useCallback } from "react";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { doc, setDoc, getDoc } from "firebase/firestore";

import { db } from "../config/firebase";

import { FORM_REGISTRY } from "../config/FormRegistry";

import { STORAGE_KEYS } from "../config/constants/storageKeys";

import { TRAINING_STATUS } from "../config/constants/status";

import { isExecutiveUser, getExecutiveName } from "../config/constants/roles";

import DynamicFormEngine from "../components/dashboard/forms/engine/DynamicFormEngine";

export default function WisFormRegistration() {
  const navigate = useNavigate();

  const { trainingId } = useParams();

  /**
   * =========================================================
   * TRAINING CONFIG
   * =========================================================
   */

  const trainingConfig = useMemo(() => FORM_REGISTRY[trainingId], [trainingId]);

  /**
   * =========================================================
   * CURRENT USER
   * =========================================================
   */

  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || "{}");
    } catch {
      return {};
    }
  });

  /**
   * =========================================================
   * STORAGE KEYS
   * =========================================================
   */

  const draftKey = `training_draft_${trainingId}_${currentUser?.employeeId}`;

  const tabKey = `training_tab_${trainingId}_${currentUser?.employeeId}`;

  /**
   * =========================================================
   * ACTIVE TAB
   * =========================================================
   */

  const [activeTab, setActiveTab] = useState("LH");

  /**
   * =========================================================
   * WORKFLOW DATA
   * =========================================================
   */

  const [workflowData, setWorkflowData] = useState(null);

  /**
   * =========================================================
   * FORM DATA
   * =========================================================
   */

  const [formData, setFormData] = useState({
    meta: {
      name: currentUser?.name || "N/A",

      employeeId: currentUser?.employeeId || "N/A",

      department: currentUser?.department || "N/A",

      role: currentUser?.role || "OPERATOR",

      date: new Date().toISOString().split("T")[0],
    },

    inspection: {},

    approval: {
      execId: "",
    },
  });

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const [validExecutive, setValidExecutive] = useState(false);

  /**
   * =========================================================
   * LOAD SAVED TAB
   * =========================================================
   */

  useEffect(() => {
    const savedTab = localStorage.getItem(tabKey);

    if (savedTab && trainingConfig?.tabs?.includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, [tabKey, trainingConfig]);

  /**
   * =========================================================
   * SAVE TAB
   * =========================================================
   */

  useEffect(() => {
    localStorage.setItem(tabKey, activeTab);
  }, [activeTab, tabKey]);

  /**
   * =========================================================
   * FETCH WORKFLOW
   * =========================================================
   */

  const fetchWorkflowStatus = useCallback(async () => {
    if (!currentUser?.employeeId) {
      return;
    }

    try {
      const progressRef = doc(
        db,
        "user_progress",
        `${currentUser.employeeId}_${trainingId}`,
      );

      const snapshot = await getDoc(progressRef);

      if (snapshot.exists()) {
        const data = snapshot.data();

        setWorkflowData(data);

        /**
         * LOAD SUBMITTED ANSWERS
         */

        if (data.answers) {
          setFormData((prev) => ({
            ...prev,

            inspection: data.answers,

            approval: {
              execId: data.approvedBy || "",
            },
          }));

          setValidExecutive(isExecutiveUser(data.approvedBy || ""));
        }
      }
    } catch (error) {
      console.error("Workflow fetch failed:", error);
    }
  }, [currentUser, trainingId]);

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
   * INSPECTION SUMMARY
   * =========================================================
   */
  const isInspectionComplete = useMemo(() => {
    const dataSources = trainingConfig?.dataSources || {};

    for (const section of Object.values(dataSources)) {
      for (const row of section.rows || []) {
        const answers = formData.inspection?.[section.id]?.[row.id];

        if (!answers) {
          return false;
        }

        for (const input of section.inputs || []) {
          const value = answers[input.id];

          if (value !== "PASS" && value !== "FAIL") {
            return false;
          }
        }
      }
    }

    return true;
  }, [formData.inspection, trainingConfig]);

  const inspectionSummary = useMemo(() => {
    let total = 0;
    let passed = 0;
    let failed = 0;

    Object.values(formData.inspection || {}).forEach((section) => {
      Object.values(section || {}).forEach((row) => {
        Object.values(row || {}).forEach((value) => {
          if (!value) {
            return;
          }

          total++;

          if (value === "PASS") {
            passed++;
          }

          if (value === "FAIL") {
            failed++;
          }
        });
      });
    });

    return {
      total,
      passed,
      failed,

      ready: isInspectionComplete,
    };
  }, [
    formData.inspection,
    isInspectionComplete,
  ]);

  const isReadOnly =
    workflowData?.lifecycleStatus === TRAINING_STATUS.APPROVED ||
    workflowData?.lifecycleStatus === TRAINING_STATUS.SUBMITTED;

  /**
   * =========================================================
   * INSPECTION CHANGE
   * =========================================================
   */

  const handleInspectionChange = (sectionId, rowId, fieldId, value) => {
    setFormData((prev) => ({
      ...prev,

      inspection: {
        ...prev.inspection,

        [sectionId]: {
          ...prev.inspection?.[sectionId],

          [rowId]: {
            ...prev.inspection?.[sectionId]?.[rowId],

            [fieldId]: value,
          },
        },
      },
    }));
  };

  /**
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    setErrorMessage("");

    const executiveId = formData.approval.execId.trim();

    if (!executiveId) {
      setErrorMessage("Executive ID is required.");

      return;
    }

    if (!isExecutiveUser(executiveId)) {
      setErrorMessage("Invalid Executive ID.");

      return;
    }

    if (!isInspectionComplete) {
      setErrorMessage(
        "Please complete all inspection items before submission.",
      );

      return;
    }
    setIsSubmitting(true);

    try {
      const progressRef = doc(
        db,
        "user_progress",
        `${currentUser.employeeId}_${trainingId}`,
      );

      await setDoc(
        progressRef,
        {
          userId: currentUser?.id || "N/A",

          employeeId: currentUser?.employeeId || "N/A",

          employeeName: currentUser?.name || "Unknown",

          department: currentUser?.department || "N/A",

          role: currentUser?.role || "OPERATOR",

          trainingId,

          trainingTitle: trainingConfig.title,

          severity: trainingConfig.severity || "Standard",

          lifecycleStatus: TRAINING_STATUS.SUBMITTED,

          approvedBy: executiveId,

          approvedByName: getExecutiveName(executiveId),

          approvedAt: null,

          approvedByExecutive: null,

          rejectedAt: null,

          rejectionReason: null,

          answers: formData.inspection,

          formData,

          meta: formData.meta,

          inspectionSummary,

          completedAt: new Date().toISOString(),

          createdAt: workflowData?.createdAt || new Date().toISOString(),

          updatedAt: new Date().toISOString(),
        },
        {
          merge: true,
        },
      );

      /**
       * CLEAR DRAFT
       */

      localStorage.removeItem(draftKey);

      localStorage.removeItem(tabKey);

      /**
       * REFRESH STATUS
       */

      fetchWorkflowStatus();

      /**
       * REDIRECT
       */

      setTimeout(() => {
        navigate("/inspection-forms");
      }, 1200);
    } catch (error) {
      console.error("Submission Error:", error);

      setErrorMessage("Failed to submit audit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * =========================================================
   * WORKFLOW BANNER
   * =========================================================
   */

  const renderWorkflowBanner = () => {
    if (!workflowData) {
      return null;
    }

    const status = workflowData.lifecycleStatus;

    /**
     * APPROVED
     */

    if (status === TRAINING_STATUS.APPROVED) {
      return (
        <div className="p-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
          <div className="flex items-start gap-4">
            <CheckCircle2 size={22} />

            <div>
              <h3 className="font-black text-lg mb-2">Approved by Executive</h3>

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

    if (status === TRAINING_STATUS.REJECTED) {
      return (
        <div className="p-5 rounded-3xl border border-red-500/20 bg-red-500/10 text-red-400">
          <div className="flex items-start gap-4">
            <XCircle size={22} />

            <div>
              <h3 className="font-black text-lg mb-2">Audit Rejected</h3>

              <div className="space-y-2">
                <p className="text-sm opacity-80">
                  Executive review requires correction or resubmission.
                </p>

                {workflowData?.rejectionReason && (
                  <div
                    className="
                      mt-3
                      p-3
                      rounded-xl
                      bg-red-500/10
                      border
                      border-red-500/20
                    "
                  >
                    <p className="text-xs font-bold mb-1">Rejection Reason</p>

                    <p className="text-sm">{workflowData.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    /**
     * SUBMITTED
     */

    if (status === TRAINING_STATUS.SUBMITTED) {
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
    return <Navigate to="/dashboard" replace />;
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
          onClick={() => navigate("/inspection-forms")}
          className="
            inline-flex
            items-center
            gap-2
            px-4
            py-2
            rounded-xl
            border
            border-slate-200
            bg-white
            text-sm
            font-semibold
            hover:bg-slate-50
            transition-all
          "
        >
          <ArrowLeft size={16} />
          Back to My Inspection Forms
        </button>

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
          "
        ></div>
      </div>

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div
        className="
          p-4
          sm:p-5
          rounded-3xl
          border
          bg-white
          border-slate-200
        "
      >
        <p className="text-sm text-amber-500 font-bold mb-3">Training Audit</p>

        <h1
          className="
            text-xl
            sm:text-2xl
            lg:text-3xl
            font-black
            leading-tight
            break-words
          "
        >
          {trainingConfig.code} • {trainingConfig.title}
        </h1>

        {/* ================================================= */}
        {/* STATUS */}
        {/* ================================================= */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <div
            className={`
              px-4
              py-2
              rounded-2xl
              text-xs
              font-bold
              ${
                workflowData?.lifecycleStatus === TRAINING_STATUS.APPROVED
                  ? "bg-emerald-100 text-emerald-700"
                  : workflowData?.lifecycleStatus === TRAINING_STATUS.REJECTED
                    ? "bg-red-100 text-red-700"
                    : workflowData?.lifecycleStatus ===
                        TRAINING_STATUS.SUBMITTED
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-700"
              }
            `}
          >
            {workflowData?.lifecycleStatus === TRAINING_STATUS.APPROVED
              ? "✅ APPROVED"
              : workflowData?.lifecycleStatus === TRAINING_STATUS.REJECTED
                ? "❌ REJECTED"
                : workflowData?.lifecycleStatus === TRAINING_STATUS.SUBMITTED
                  ? "⏳ SUBMITTED"
                  : "📝 DRAFT"}
          </div>
        </div>
        <div className="border-t border-slate-200 mt-5 pt-5">
          <div className="mt-5 grid grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className=" p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[11px] uppercase opacity-50">Operator</p>
              <p className="font-bold">{formData.meta.name}</p>
            </div>

            <div className=" p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[11px] uppercase opacity-50">Employee ID</p>
              <p className="font-bold">{formData.meta.employeeId}</p>
            </div>

            <div className=" p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[11px] uppercase opacity-50">Department</p>
              <p className="font-bold">{formData.meta.department}</p>
            </div>

            <div className=" p-3 rounded-xl border border-slate-200 bg-slate-50">
              <p className="text-[11px] uppercase opacity-50">
                Inspection Date
              </p>
              <p className="font-bold">{formData.meta.date}</p>
            </div>
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
          {trainingConfig.tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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
          ))}
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
        handleInspectionChange={handleInspectionChange}
        readOnly={isReadOnly}
      />

      {workflowData?.executiveAssessment && (
        <div className="p-6 rounded-3xl border bg-white border-slate-200">
          <h3 className="font-black text-lg mb-4">
            Executive Assessment & Evaluation
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase opacity-50">Pre-Test</p>
              <p className="font-bold">
                {workflowData.executiveAssessment.preTest}
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase opacity-50">Post-Test</p>
              <p className="font-bold">
                {workflowData.executiveAssessment.postTest}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs opacity-60 mb-2">Remarks</p>
            <p>{workflowData.executiveAssessment.remark}</p>
          </div>

          <div className="mt-5 pt-4 border-t">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
              <p className="text-sm mt-2">
                Reviewed By:
                {" "}
                {workflowData.executiveAssessment?.reviewedByName}
              </p>

              <p className="text-sm">
                Date:
                {" "}
                {workflowData.executiveAssessment?.reviewedAt
                  ? new Date(
                      workflowData.executiveAssessment.reviewedAt
                    ).toLocaleString()
                  : "-"
                }
              </p>
              </div>

              <div>
                <p className="text-xs opacity-60">Reviewed Date</p>

                <p className="font-bold">
                  {workflowData.executiveAssessment?.reviewedAt
                    ? new Date(workflowData.executiveAssessment?.reviewedAt).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* SUBMIT */}
      {/* ===================================================== */}

      {!(
        workflowData?.lifecycleStatus === TRAINING_STATUS.APPROVED ||
        workflowData?.lifecycleStatus === TRAINING_STATUS.SUBMITTED
      ) && (
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
                Select Executive Reviewer
              </p>

              <select
                value={formData.approval.execId}
                onChange={(e) => {
                  const value = e.target.value;

                  setFormData((prev) => ({
                    ...prev,
                    approval: {
                      execId: value,
                    },
                  }));

                  setValidExecutive(isExecutiveUser(value));
                }}
                className="
                w-full
                sm:min-w-[260px]
                px-5
                py-4
                rounded-2xl
                border
                border-slate-300
                bg-white
                appearance-none
                cursor-pointer
              "
              >
                <option value="">Select Executive</option>

                <option value="2500">2500 - MUHAMAD IQBAL</option>
              </select>

              <p className="text-xs opacity-60 mt-2">
                Executive responsible for approval
              </p>
              {formData.approval.execId && (
                <p
                  className={`
                text-xs
                mt-2
                font-medium
                ${validExecutive ? "text-emerald-600" : "text-red-500"}
              `}
                >
                  {validExecutive
                    ? "✓ Executive Found"
                    : "✕ Executive ID not found"}
                </p>
              )}

              {!isInspectionComplete && (
                <p className="text-xs text-amber-600 mt-2">
                  Complete all inspection items before submission.
                </p>
              )}
            </div>

            {errorMessage && (
              <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !validExecutive || !isInspectionComplete}
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
                <Loader2 size={18} className="animate-spin" />
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
      )}
    </div>
  );
}
