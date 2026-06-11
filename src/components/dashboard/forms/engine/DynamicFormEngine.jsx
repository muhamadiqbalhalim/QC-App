import {
  useMemo,
} from 'react';

import {
  ClipboardCheck,
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
  trainingConfig,
  formData,
  handleInspectionChange,
  activeTab,
  readOnly = false,
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
