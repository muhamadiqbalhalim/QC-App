import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import {
  History,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  XCircle,
  FileDown,
  ShieldCheck,
  CalendarDays,
  ClipboardCheck,
} from 'lucide-react';

import {
  db,
} from '../config/firebase';

import useSession from '../hooks/useSession';

import {
  FORM_REGISTRY,
} from '../config/FormRegistry';

import {
  TRAINING_STATUS,
} from '../config/constants/status';

import {
  exportAuditPdf,
} from '../utils/pdf/exportAuditPdf';

export default function TrainingHistory() {

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [historyData, setHistoryData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const navigate =
    useNavigate();

  const { getSession } =
    useSession();

  /**
   * =========================================================
   * CURRENT USER
   * =========================================================
   */

  const currentUser =
    getSession();

  /**
   * =========================================================
   * FETCH HISTORY
   * =========================================================
   */

  useEffect(() => {

    const fetchHistory =
      async () => {

        try {
          if (
            !currentUser?.employeeId
          ) {

            setLoading(false);

            return;

          }

          setLoading(true);

          const historyQuery =
            query(
              collection(
                db,
                'user_progress'
              ),
              where(
                'employeeId',
                '==',
                currentUser.employeeId
              )
            );

          const historySnapshot =
            await getDocs(
              historyQuery
            );

          const history =
            historySnapshot.docs.map(
              (document) => ({

                id: document.id,

                ...document.data(),

              })
            );

          history.sort(
            (a, b) =>
              new Date(
                b.updatedAt ||
                b.createdAt
              ) -
              new Date(
                a.updatedAt ||
                a.createdAt
              )
          );

          setHistoryData(
            history
          );

        } catch (error) {

          console.error(
            'History fetch failed:',
            error
          );

        } finally {

          setLoading(false);

        }

      };

    fetchHistory();

  }, [currentUser]);

  /**
   * =========================================================
   * STATUS CONFIG
   * =========================================================
   */

  const getStatusConfig =
    (status) => {

      switch (status) {

        case TRAINING_STATUS.APPROVED:

          return {

            icon:
              CheckCircle2,

            color: `
              text-emerald-500
              bg-emerald-500/10
              border-emerald-500/20
            `,

            label:
              'Approved',

          };

        case TRAINING_STATUS.REJECTED:

          return {

            icon:
              XCircle,

            color: `
              text-red-500
              bg-red-500/10
              border-red-500/20
            `,

            label:
              'Rejected',

          };

        case TRAINING_STATUS.SUBMITTED:

          return {

            icon:
              Clock3,

            color: `
              text-amber-500
              bg-amber-500/10
              border-amber-500/20
            `,

            label:
              'Pending Approval',

          };

        default:

          return {

            icon:
              ClipboardCheck,

            color: `
              text-slate-500
              bg-slate-500/10
              border-slate-500/20
            `,

            label:
              'Draft',

          };

      }

    };

  /**
   * =========================================================
   * SUMMARY
   * =========================================================
   */

  const summary =
    useMemo(() => {

      return {

        total:
          historyData.length,

        approved:
          historyData.filter(
            (item) =>
              item.lifecycleStatus ===
              TRAINING_STATUS.APPROVED
          ).length,

        pending:
          historyData.filter(
            (item) =>
              item.lifecycleStatus ===
              TRAINING_STATUS.SUBMITTED
          ).length,

      };

    }, [historyData]);

  /**
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {

    return (
      <div
        className={`
          min-h-[70vh]
          flex
          items-center
          justify-center
          bg-[#F8FAFC]
          text-slate-900
        `}
      >

        <div className="text-center">

          <div
            className="
              w-14
              h-14
              border-4
              border-amber-500/20
              border-t-amber-500
              rounded-full
              animate-spin
              mx-auto
              mb-5
            "
          />

          <p className="text-sm opacity-60">
            Loading history...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div
      className={`
        min-h-screen
        px-4
        py-5
        sm:px-5
        sm:py-6
        md:px-6
        md:py-8
        lg:p-8
        space-y-5
        sm:space-y-6
        lg:space-y-8
        bg-[#F8FAFC]
        text-slate-900
      `}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section
        className="
          flex
          flex-col
          gap-5
          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >

        <div>

          <div className="flex items-center gap-2 mb-3">

            <History
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
              Audit Traceability
            </p>

          </div>

          <h1
            className="
              text-3xl
              sm:text-4xl
              lg:text-5xl
              font-black
              leading-tight
            "
          >
            Training History
          </h1>

          <p
            className="
              mt-4
              text-sm
              opacity-60
              max-w-2xl
              leading-7
            "
          >
            Review completed audits,
            lifecycle approvals, and
            historical QC competency
            records.
          </p>

        </div>

      </section>

      {/* =====================================================
          SUMMARY CARDS
      ===================================================== */}

        <section
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-3
            sm:gap-4
            lg:gap-6
          "
        >

        {[
          {
            label:
              'Total',

            value:
              summary.total,
          },

          {
            label:
              'Approved',

            value:
              summary.approved,
          },

          {
            label:
              'Pending',

            value:
              summary.pending,
          },

        ].map((item) => (

          <div
            key={item.label}
            className={`
              rounded-3xl
              border
              p-4
              sm:p-5
              lg:p-6
              bg-white
              border-slate-200
            `}
          >

            <p
              className="
                text-[10px]
                sm:text-xs
                uppercase
                tracking-[0.25em]
                opacity-50
                font-black
              "
            >
              {item.label}
            </p>

            <h2
              className="
                mt-4
                text-2xl
                sm:text-3xl
                font-black
              "
            >
              {item.value}
            </h2>

          </div>

        ))}

      </section>

      {/* =====================================================
          HISTORY LIST
      ===================================================== */}

      <section className="space-y-4">

        {historyData.map(
          (training) => {

            const status =
              getStatusConfig(
                training.lifecycleStatus
              );

            const StatusIcon =
              status.icon;

            const trainingConfig =
              FORM_REGISTRY[
                training.trainingId
              ];

            return (

              <div
                key={training.id}
                className={`
                  rounded-3xl
                  border
                  p-5
                  sm:p-6
                  transition-all
                  duration-300
                  bg-white
                  border-slate-200
                `}
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
                  <div className="min-w-0">

                    <div className="flex items-center gap-3 mb-4">

                      <span
                        className={`
                          px-3
                          py-2
                          rounded-2xl
                          border
                          text-xs
                          font-black
                          uppercase
                          tracking-widest
                          flex
                          items-center
                          gap-2
                          ${status.color}
                        `}
                      >

                        <StatusIcon
                          size={14}
                        />

                        {status.label}

                      </span>

                    </div>

                    <h2
                      className="
                        text-xl
                        sm:text-2xl
                        font-black
                        break-words
                      "
                    >
                      {
                        trainingConfig?.title ||
                        training.trainingId
                      }
                    </h2>

                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-4
                        mt-4
                        text-sm
                        opacity-60
                      "
                    >

                      <div className="flex items-center gap-2">

                        <CalendarDays
                          size={14}
                        />

                        <span>
                          {new Date(
                            training.updatedAt ||
                            training.createdAt
                          ).toLocaleDateString()}
                        </span>

                      </div>

                      <div className="flex items-center gap-2">

                        <ShieldCheck
                          size={14}
                        />

                        <span>
                          Approved by:
                          {' '}
                          {
                            training.approvedBy ||
                            '-'
                          }
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div
                    className="
                      flex
                      flex-col
                      sm:flex-row
                      gap-3
                      xl:items-center
                    "
                  >

                    {/* SCORE */}
                    <div
                      className="
                        px-5
                        py-4
                        rounded-2xl
                        border
                        border-emerald-500/20
                        bg-emerald-500/10
                        text-center
                      "
                    >

                      <p
                        className="
                          text-[10px]
                          uppercase
                          tracking-[0.25em]
                          font-black
                          text-emerald-500
                          mb-2
                        "
                      >
                        Final Score
                      </p>

                      <p
                        className="
                          text-2xl
                          font-black
                          text-emerald-500
                        "
                      >
                        {
                          training.finalScore || 0
                        }%
                      </p>

                    </div>

                    {/* ACTIONS */}
                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        gap-3
                        w-full
                        sm:w-auto
                      "
                    >

                      <button
                        onClick={() =>
                          exportAuditPdf({
                            currentUser: {
                              name:
                                training.employeeName ||
                                currentUser?.name,

                              employeeId:
                                training.employeeId ||
                                currentUser?.employeeId,

                              department:
                                training.department ||
                                currentUser?.department,
                            },

                            trainingConfig,

                            workflowData:
                              training,

                            formData:
                              training.formData || {},

                            totalMark:
                              training.totalMark ||
                              training.finalScore ||
                              0,
                          })
                        }
                        className="
                          w-full
                          sm:w-auto
                          flex
                          items-center
                          justify-center
                          gap-2
                          px-5
                          py-4
                          rounded-2xl
                          border
                          border-slate-200
                          font-bold
                          text-sm
                          hover:border-amber-500
                          hover:text-amber-500
                          transition-all
                        "
                      >

                        <FileDown
                          size={16}
                        />

                        PDF

                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/registration/${training.trainingId}`
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
                          py-4
                          rounded-2xl
                          bg-amber-500
                          text-black
                          font-black
                          text-sm
                          hover:scale-[1.02]
                          transition-all
                        "
                      >

                        Continue

                        <ArrowUpRight
                          size={16}
                        />

                      </button>

                    </div>

                  </div>

                </div>

              </div>

            );

          }
        )}

        {!historyData.length && (

          <div
            className={`
              rounded-3xl
              border
              p-10
              text-center
              bg-white
              border-slate-200
            `}
          >

            <History
              size={36}
              className="
                mx-auto
                mb-5
                text-amber-500
                opacity-70
              "
            />

            <h2
              className="
                text-2xl
                font-black
                mb-3
              "
            >
              No Training History
            </h2>

            <p className="text-sm opacity-60">
              Completed training audits
              will appear here.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}
