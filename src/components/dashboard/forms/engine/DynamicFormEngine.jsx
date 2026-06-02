import React, {
  useMemo,
} from 'react';

import {
  ArrowLeftRight,
  ClipboardCheck,
  ShieldAlert,
  Activity,
  Eye,
  CheckCircle2,
} from 'lucide-react';

import InspectionTable from '../shared/InspectionTable';

/**
 * ======================================================
 * DynamicFormEngine
 * ======================================================
 *
 * RESPONSIBILITIES:
 * - Render inspection engine UI
 * - Render dynamic inspection dataset
 * - Render active inspection zone
 * - Forward inspection updates upward
 *
 * PRESENTATIONAL ONLY
 * ======================================================
 */

export default function DynamicFormEngine({
  trainingId,
  trainingConfig,
  formData,
  handleInspectionChange,
  activeTab,
  readOnly = false,
}) {

  /**
   * ======================================================
   * EXECUTIVE REVIEW MODE
   * ======================================================
   */

  const executiveReviewMode =
    readOnly;

  /**
   * ======================================================
   * ACTIVE DATASET
   * ======================================================
   */

  const activeInspectionSection =
    useMemo(() => {

      if (
        !trainingConfig?.dataSources
      ) {

        return null;

      }

      return (
        trainingConfig.dataSources[
          activeTab
        ] || null
      );

    }, [
      activeTab,
      trainingConfig,
    ]);

  /**
   * ======================================================
   * TOTAL ROWS
   * ======================================================
   */

  const totalInspectionRows =
    activeInspectionSection?.rows
      ?.length || 0;

  /**
   * ======================================================
   * COMPLETION
   * ======================================================
   */

  const completedInspections =
    useMemo(() => {

      const currentSection =
        formData?.inspection?.[
          activeTab
        ] || {};

      let completed = 0;

      Object.values(
        currentSection
      ).forEach((row) => {

        const values =
          Object.values(row);

        const hasAnswer =
          values.some(
            (value) =>
              value !== '' &&
              value !== undefined &&
              value !== null
          );

        if (hasAnswer) {

          completed += 1;

        }

      });

      return completed;

    }, [
      formData,
      activeTab,
    ]);

  /**
   * ======================================================
   * COMPLETION %
   * ======================================================
   */

  const completionPercentage =
    totalInspectionRows > 0
      ? Math.round(
          (
            completedInspections /
            totalInspectionRows
          ) * 100
        )
      : 0;

  /**
   * ======================================================
   * EMPTY STATE
   * ======================================================
   */

  const renderEmptyState =
    () => {

      return (
        <div
          className="
            p-8
            sm:p-12
            rounded-3xl
            border
            border-dashed
            border-slate-300
            dark:border-slate-700
            text-center
            bg-white
            dark:bg-white/5
          "
        >

          <div className="flex justify-center mb-5">

            <ClipboardCheck
              size={40}
              className="
                opacity-40
                text-amber-500
              "
            />

          </div>

          <h3
            className="
              text-xl
              sm:text-2xl
              font-black
              mb-3
            "
          >
            No Inspection Dataset
          </h3>

          <p
            className="
              text-sm
              opacity-60
              max-w-md
              mx-auto
              leading-7
            "
          >
            No inspection dataset has
            been configured for this
            training module yet.
          </p>

        </div>
      );
    };

  /**
   * ======================================================
   * INVALID DATASET
   * ======================================================
   */

  if (!activeInspectionSection) {

    return renderEmptyState();

  }

  return (
    <div
      className="
        space-y-5
        sm:space-y-6
      "
    >

      {/* ================================================== */}
      {/* MOBILE STICKY SUMMARY */}
      {/* ================================================== */}

      {!executiveReviewMode && (

        <div
          className="
            sticky
            top-[72px]
            z-20
            lg:hidden
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              px-4
              py-4
              rounded-2xl
              border
              border-slate-200
              dark:border-white/10
              bg-white/95
              dark:bg-[#09090B]/95
              backdrop-blur-xl
              shadow-lg
            "
          >

            {/* LEFT */}
            <div>

              <p
                className="
                  text-xs
                  font-semibold
                  opacity-60
                  mb-1
                "
              >
                Current Section
              </p>

              <div className="flex items-center gap-2">

                <ArrowLeftRight
                  size={16}
                  className="text-amber-500"
                />

                <span
                  className="
                    text-base
                    font-black
                  "
                >
                  {activeTab}
                </span>

              </div>

            </div>

            {/* RIGHT */}
            <div className="text-right">

              <p
                className="
                  text-xs
                  font-semibold
                  opacity-60
                  mb-1
                "
              >
                Progress
              </p>

              <p
                className="
                  text-xl
                  font-black
                  text-emerald-500
                "
              >
                {completionPercentage}%
              </p>

            </div>

          </div>

        </div>

      )}

      {/* ================================================== */}
      {/* ENGINE HEADER */}
      {/* ================================================== */}

      <div
        className="
          p-5
          sm:p-6
          rounded-3xl
          border
          border-slate-200
          dark:border-white/10
          bg-white
          dark:bg-white/5
          backdrop-blur-xl
          shadow-sm
        "
      >

        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-start
            xl:justify-between
            gap-6
          "
        >

          {/* WIS INFORMATION */}

          <div
            className="
              p-5
              sm:p-6
              rounded-3xl
              border
              border-slate-200
              dark:border-white/10
              bg-white
              dark:bg-white/5
              shadow-sm
            "
          >

            <div className="mb-5">

              <p
                className="
                  text-sm
                  font-bold
                  text-amber-500
                  mb-2
                "
              >
                WIS INFORMATION
              </p>

              <h3
                className="
                  text-xl
                  font-black
                "
              >
                {trainingConfig?.title}
              </h3>

            </div>

            <div
              className="
                grid
                grid-cols-2
                lg:grid-cols-4
                gap-4
              "
            >

              <InfoCard
                label="Model"
                value={trainingConfig?.model}
              />

              <InfoCard
                label="Part No"
                value={trainingConfig?.partNo}
              />

              <InfoCard
                label="Line"
                value={trainingConfig?.lineNo}
              />

              <InfoCard
                label="Cycle Time"
                value={trainingConfig?.cycleTime}
              />

            </div>

          </div>

          {/* ================================================= */}
          {/* LEFT */}
          {/* ================================================= */}

          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-2 mb-3">

              {executiveReviewMode ? (

                <Eye
                  size={16}
                  className="text-blue-500"
                />

              ) : (

                <ClipboardCheck
                  size={16}
                  className="text-amber-500"
                />

              )}

              <p
                className="
                  text-sm
                  font-bold
                  text-amber-500
                "
              >
                {
                  executiveReviewMode
                    ? 'Executive Review'
                    : 'Inspection Section'
                }
              </p>

            </div>

            <h2
              className="
                text-2xl
                sm:text-3xl
                font-black
                leading-tight
                break-words
              "
            >
              {
                activeInspectionSection.title
              }
            </h2>

            <p
              className="
                text-sm
                opacity-60
                mt-3
                leading-7
                max-w-2xl
              "
            >
              {
                executiveReviewMode
                  ? `
                    Review and validate submitted inspection results before approval.
                  `
                  : `
                    Complete all inspection points for this section before submission.
                  `
              }
            </p>

            {/* REVIEW MODE BADGE */}
            {executiveReviewMode && (

              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  px-4
                  py-2
                  rounded-2xl
                  bg-blue-500/10
                  text-blue-500
                  border
                  border-blue-500/20
                  text-xs
                  font-bold
                  mt-4
                "
              >

                Executive Review Mode

              </div>

            )}

          </div>

          {/* ================================================= */}
          {/* RIGHT KPI */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-2
              gap-3
              w-full
              xl:w-auto
              xl:min-w-[320px]
            "
          >

            {/* ACTIVE ZONE */}
            <div
              className="
                p-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-h-[90px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    opacity-50
                    mb-3
                  "
                >
                  Active Zone
                </p>

                <div className="flex items-center gap-2">

                  <ArrowLeftRight
                    size={15}
                    className="
                      text-amber-500
                    "
                  />

                  <p
                    className="
                      text-base
                      font-black
                    "
                  >
                    {activeTab}
                  </p>

                </div>

              </div>

            </div>

            {/* SEVERITY */}
            <div
              className="
                p-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-h-[90px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    opacity-50
                    mb-3
                  "
                >
                  Severity
                </p>

                <div className="flex items-center gap-2">

                  <ShieldAlert
                    size={15}
                    className="
                      text-red-500
                    "
                  />

                  <p
                    className="
                      text-base
                      font-black
                    "
                  >
                    {
                      trainingConfig?.severity
                    }
                  </p>

                </div>

              </div>

            </div>

            {/* COMPLETION */}
            {!executiveReviewMode && (

              <div
                className="
                  col-span-2
                  p-4
                  rounded-2xl
                  border
                  border-slate-200
                  dark:border-white/10
                  bg-slate-50
                  dark:bg-black/20
                  min-h-[90px]
                "
              >

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        opacity-50
                        mb-2
                      "
                    >
                      Inspection Progress
                    </p>

                    <div className="flex items-center gap-2">

                      <Activity
                        size={15}
                        className="
                          text-emerald-500
                        "
                      />

                      <p
                        className="
                          text-base
                          font-black
                          text-emerald-500
                        "
                      >
                        {
                          completedInspections
                        }
                        /
                        {
                          totalInspectionRows
                        }
                        {' '}
                        completed
                      </p>

                    </div>

                  </div>

                  <div
                    className="
                      text-right
                    "
                  >

                    <p
                      className="
                        text-2xl
                        font-black
                        text-emerald-500
                      "
                    >
                      {
                        completionPercentage
                      }
                      %
                    </p>

                  </div>

                </div>

                {/* PROGRESS BAR */}
                <div
                  className="
                    mt-4
                    h-2.5
                    rounded-full
                    overflow-hidden
                    bg-slate-200
                    dark:bg-slate-800
                  "
                >

                  <div
                    className="
                      h-full
                      rounded-full
                      bg-emerald-500
                      transition-all
                      duration-500
                    "
                    style={{
                      width:
                        `${completionPercentage}%`,
                    }}
                  />

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* COMPLETED STATE */}
      {/* ================================================== */}

      {!executiveReviewMode &&
        completionPercentage === 100 && (

        <div
          className="
            p-5
            rounded-3xl
            border
            border-emerald-500/20
            bg-emerald-500/10
            text-emerald-500
          "
        >

          <div className="flex items-start gap-4">

            <CheckCircle2
              size={22}
              className="shrink-0"
            />

            <div>

              <h3
                className="
                  text-lg
                  font-black
                  mb-2
                "
              >
                Inspection Completed
              </h3>

              <p className="text-sm opacity-80">

                All inspection points for
                this section have been completed.
                You may continue to the next
                section or submit for executive review.

              </p>

            </div>

          </div>

        </div>

      )}

      {/* ================================================== */}
      {/* INSPECTION TABLE */}
      {/* ================================================== */}

      <InspectionTable
        section={
          activeInspectionSection
        }
        readOnly={readOnly}
        activeTab={activeTab}
        formData={formData}
        handleInputChange={
          handleInspectionChange
        }
      />

    </div>
  );
}

function InfoCard({
  label,
  value,
}) {

  return (

    <div
      className="
        p-4
        rounded-2xl
        border
        border-slate-200
        dark:border-white/10
      "
    >

      <p
        className="
          text-xs
          font-semibold
          opacity-50
          mb-2
        "
      >
        {label}
      </p>

      <p
        className="
          text-base
          font-black
        "
      >
        {value || '-'}
      </p>

    </div>

  );

}