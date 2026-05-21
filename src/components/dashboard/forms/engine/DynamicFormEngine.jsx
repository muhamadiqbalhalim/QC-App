import React, {
  useMemo,
} from 'react';

import {
  ArrowLeftRight,
  ClipboardCheck,
  LayoutGrid,
  ShieldAlert,
  Activity,
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
}) {

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
            No inspection schema has been
            connected to this training
            module yet.
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
            py-3
            rounded-2xl
            border
            border-white/10
            bg-white/90
            dark:bg-[#09090B]/90
            backdrop-blur-xl
            shadow-lg
          "
        >

          {/* LEFT */}
          <div>

            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.25em]
                font-black
                text-amber-500
                mb-1
              "
            >
              Active Zone
            </p>

            <div className="flex items-center gap-2">

              <ArrowLeftRight
                size={14}
                className="text-amber-500"
              />

              <span
                className="
                  text-sm
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
                text-[10px]
                uppercase
                tracking-[0.25em]
                opacity-50
                font-black
                mb-1
              "
            >
              Progress
            </p>

            <p
              className="
                text-lg
                font-black
                text-emerald-500
              "
            >
              {completionPercentage}%
            </p>

          </div>

        </div>

      </div>

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
            2xl:flex-row
            2xl:items-start
            2xl:justify-between
            gap-6
          "
        >

          {/* ================================================= */}
          {/* LEFT */}
          {/* ================================================= */}

          <div className="min-w-0">

            <div className="flex items-center gap-2 mb-3">

              <LayoutGrid
                size={16}
                className="text-amber-500"
              />

              <p
                className="
                  text-[10px]
                  sm:text-xs
                  uppercase
                  tracking-[0.3em]
                  font-black
                  text-amber-500
                "
              >
                Dynamic Inspection Engine
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
                mt-4
                max-w-3xl
                leading-7
              "
            >
              Structured operational
              inspection workflow and
              competency validation
              system for manufacturing
              quality assurance.
            </p>

          </div>

          {/* ================================================= */}
          {/* RIGHT KPI */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-2
              md:grid-cols-4
              gap-3
              w-full
              2xl:w-auto
            "
          >

            {/* TRAINING */}
            <div
              className="
                p-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-h-[110px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-widest
                    opacity-50
                    mb-3
                    font-black
                  "
                >
                  Training ID
                </p>

                <p
                  className="
                    font-mono
                    text-sm
                    sm:text-base
                    font-black
                    text-amber-500
                    break-words
                  "
                >
                  {trainingId}
                </p>

              </div>

            </div>

            {/* ACTIVE */}
            <div
              className="
                p-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-h-[110px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-widest
                    opacity-50
                    mb-3
                    font-black
                  "
                >
                  Active Zone
                </p>

                <div className="flex items-center gap-2">

                  <ArrowLeftRight
                    size={14}
                    className="
                      text-amber-500
                    "
                  />

                  <p
                    className="
                      text-sm
                      sm:text-base
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
                min-h-[110px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-widest
                    opacity-50
                    mb-3
                    font-black
                  "
                >
                  Severity
                </p>

                <div className="flex items-center gap-2">

                  <ShieldAlert
                    size={14}
                    className="
                      text-red-500
                    "
                  />

                  <p
                    className="
                      text-sm
                      sm:text-base
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

            {/* PROGRESS */}
            <div
              className="
                p-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-h-[110px]
                flex
                flex-col
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-widest
                    opacity-50
                    mb-3
                    font-black
                  "
                >
                  Completion
                </p>

                <div className="flex items-center gap-2">

                  <Activity
                    size={14}
                    className="
                      text-emerald-500
                    "
                  />

                  <p
                    className="
                      text-sm
                      sm:text-base
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
                  </p>

                </div>

                {/* PROGRESS BAR */}
                <div
                  className="
                    mt-3
                    h-2
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

            </div>

          </div>

        </div>

      </div>

      {/* ================================================== */}
      {/* INSPECTION TABLE */}
      {/* ================================================== */}

      <InspectionTable
        section={
          activeInspectionSection
        }
        activeTab={activeTab}
        formData={formData}
        handleInputChange={
          handleInspectionChange
        }
      />

    </div>
  );
}