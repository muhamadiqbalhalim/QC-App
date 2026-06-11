import {
  memo,
} from 'react';

import {
  ShieldCheck,
  Clock3,
  Users,
  CheckCircle2,
  FileText,
} from 'lucide-react';

/**
 * =========================================================
 * EXECUTIVE APPROVAL PANEL
 * =========================================================
 * Enterprise approval workflow panel.
 *
 * RESPONSIBILITIES:
 * - Show pending approvals
 * - Approve / reject actions
 * - Operator submission overview
 * - Executive workflow handling
 * =========================================================
 */

function ExecutiveApprovalPanel({

  submissions = [],

  onApprove,

}) {

  /**
   * =========================================================
   * EMPTY STATE
   * =========================================================
   */

  if (!submissions.length) {

    return (
      <section
        className="
          rounded-3xl
          border
          p-8
          bg-white
          border-slate-200
        "
      >

        <div className="text-center py-10">

          <CheckCircle2
            size={42}
            className="
              mx-auto
              mb-5
              text-emerald-500
            "
          />

          <h2
            className="
              text-2xl
              font-black
              mb-3
            "
          >
            No Pending Approvals
          </h2>

            <p
              className="
                text-sm
                text-slate-500
              "
            >
            All submitted audits
            have been reviewed.
          </p>

        </div>

      </section>

    );
  }

  return (
      <section
        className="
          rounded-3xl
          border
          p-8
          bg-white
          border-slate-200
        "
      >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <div className="flex items-center gap-2 mb-3">

            <ShieldCheck
              size={16}
              className="text-amber-500"
            />

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-amber-500
                font-black
              "
            >
              Executive Approval Center
            </p>

          </div>

          <h2
            className="
              text-3xl
              font-black
            "
          >
            Pending Operator Approvals
          </h2>

        </div>

        <div
          className="
            px-4
            py-2
            rounded-2xl
            bg-amber-500/10
            text-amber-400
            border
            border-amber-500/20
            text-sm
            font-black
          "
        >
          {submissions.length}
          {' '}
          Pending
        </div>

      </div>

      {/* =====================================================
          SUBMISSION LIST
      ===================================================== */}

      <div className="space-y-4">

        {submissions.map(
          (submission) => (

            <div
              key={submission.id}
              className="
                border
                rounded-3xl
                p-5
                transition-all
                duration-300
                hover:border-amber-500/20
                bg-white
                border-slate-200
              "
            >

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                {/* =================================================
                    LEFT CONTENT
                ================================================= */}

                <div className="space-y-4">

                  {/* USER */}
                  <div className="flex items-center gap-4">

                    <div
                      className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-amber-500/10
                        text-amber-500
                        flex
                        items-center
                        justify-center
                        shrink-0
                      "
                    >
                      <Users size={20} />
                    </div>

                    <div>

                      <h3
                        className="
                          text-lg
                          font-black
                        "
                      >
                        {submission.employeeName ||
                          'Unknown Operator'}
                      </h3>

                      <p
                        className="
                          text-xs
                          opacity-50
                          font-mono
                        "
                      >
                        Employee ID:
                        {' '}
                        {submission.employeeId}
                      </p>

                    </div>

                  </div>

                  {/* TAGS */}
                  <div className="flex flex-wrap items-center gap-3">

                    {/* TRAINING */}
                    <span
                      className="
                        px-3
                        py-1.5
                        rounded-full
                        bg-blue-500/10
                        text-blue-400
                        border
                        border-blue-500/20
                        text-xs
                        font-black
                        uppercase
                        tracking-widest
                      "
                    >
                      {submission.trainingId}
                    </span>

                    {/* SCORE */}
                    <span
                      className="
                        px-3
                        py-1.5
                        rounded-full
                        bg-emerald-500/10
                        text-emerald-400
                        border
                        border-emerald-500/20
                        text-xs
                        font-black
                      "
                    >
                      {submission.finalScore || 0}%
                    </span>

                    {/* STATUS */}
                    <span
                      className="
                        px-3
                        py-1.5
                        rounded-full
                        bg-amber-500/10
                        text-amber-400
                        border
                        border-amber-500/20
                        text-xs
                        font-black
                      "
                    >
                      SUBMITTED
                    </span>

                  </div>

                  {/* EXTRA INFO */}
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-4
                      text-sm
                      text-slate-500
                    "
            >
                    <div className="flex items-center gap-1">

                      <Clock3 size={12} />

                      <span>
                        {new Date(
                          submission.completedAt
                        ).toLocaleString() ||
                          'Recently submitted'}
                      </span>

                    </div>

                    <div className="flex items-center gap-1">

                      <FileText size={12} />

                      <span>
                        {submission.department ||
                          'QC Department'}
                      </span>

                    </div>

                  </div>

                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div
                  className="
                    flex
                    shrink-0
                    w-full
                    sm:w-auto
                  "
                >

                  {/* REVIEW */}
                  <button
                    onClick={() =>
                      onApprove?.(
                        submission
                      )
                    }
                    className="
                      w-full
                      sm:w-auto
                      flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      py-3
                      rounded-2xl
                      bg-emerald-500
                      hover:bg-emerald-400
                      text-black
                      text-sm
                      font-black
                      uppercase
                      tracking-widest
                      transition-all
                    "
                    >

                    <CheckCircle2
                      size={16}
                    />

                    Review

                  </button>

                </div>

              </div>

            </div>

          )
        )}

      </div>

    </section>
  );
}

export default memo(
  ExecutiveApprovalPanel
);
