import React, { useMemo } from 'react';

import {
  ArrowLeftRight,
  ClipboardCheck,
  LayoutGrid,
  ShieldAlert,
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
 * DOES NOT HANDLE:
 * - Firebase
 * - Submission
 * - Authentication
 * - Session
 * - Routing
 *
 * ARCHITECTURE RULE:
 * Presentational-only component.
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
   * ACTIVE INSPECTION DATA
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
   * TOTAL INSPECTION COUNT
   * ======================================================
   */
  const totalInspectionRows =
    activeInspectionSection?.rows
      ?.length || 0;

  /**
   * ======================================================
   * CURRENT COMPLETION
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
   * EMPTY STATE
   * ======================================================
   */
  const renderEmptyState = () => {

    return (
      <div
        className="
          p-12
          rounded-3xl
          border
          border-dashed
          border-slate-300
          dark:border-slate-700
          text-center
        "
      >
        <div className="flex justify-center mb-5">

          <ClipboardCheck
            size={38}
            className="
              opacity-40
              text-amber-500
            "
          />

        </div>

        <h3 className="text-xl font-black mb-3">
          No Inspection Dataset
        </h3>

        <p className="text-sm opacity-60 max-w-md mx-auto leading-7">
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
    <div className="space-y-6">

      {/* ================================================== */}
      {/* ENGINE HEADER */}
      {/* ================================================== */}
      <div
        className="
          p-6
          rounded-3xl
          border
          border-slate-200
          dark:border-white/10
          bg-white
          dark:bg-white/5
          backdrop-blur-xl
        "
      >
        <div
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-6
          "
        >
          {/* LEFT */}
          <div>

            <div className="flex items-center gap-2 mb-3">

              <LayoutGrid
                size={16}
                className="text-amber-500"
              />

              <p
                className="
                  text-xs
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
                font-black
                leading-tight
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
                max-w-2xl
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

          {/* RIGHT */}
          <div
            className="
              grid
              grid-cols-2
              lg:grid-cols-4
              gap-4
            "
          >
            {/* TRAINING */}
            <div
              className="
                px-5
                py-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-w-[140px]
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-widest
                  opacity-50
                  mb-2
                  font-black
                "
              >
                Training ID
              </p>

              <p
                className="
                  font-mono
                  text-sm
                  font-black
                  text-amber-500
                "
              >
                {trainingId}
              </p>
            </div>

            {/* ACTIVE ZONE */}
            <div
              className="
                px-5
                py-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-w-[140px]
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-widest
                  opacity-50
                  mb-2
                  font-black
                "
              >
                Active Zone
              </p>

              <div className="flex items-center gap-2">

                <ArrowLeftRight
                  size={13}
                  className="
                    text-amber-500
                  "
                />

                <p
                  className="
                    text-sm
                    font-black
                  "
                >
                  {activeTab}
                </p>
              </div>
            </div>

            {/* SEVERITY */}
            <div
              className="
                px-5
                py-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-w-[140px]
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-widest
                  opacity-50
                  mb-2
                  font-black
                "
              >
                Severity
              </p>

              <div className="flex items-center gap-2">

                <ShieldAlert
                  size={13}
                  className="
                    text-red-500
                  "
                />

                <p
                  className="
                    text-sm
                    font-black
                  "
                >
                  {
                    trainingConfig?.severity
                  }
                </p>
              </div>
            </div>

            {/* PROGRESS */}
            <div
              className="
                px-5
                py-4
                rounded-2xl
                border
                border-slate-200
                dark:border-white/10
                bg-slate-50
                dark:bg-black/20
                min-w-[140px]
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-widest
                  opacity-50
                  mb-2
                  font-black
                "
              >
                Progress
              </p>

              <p
                className="
                  text-sm
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