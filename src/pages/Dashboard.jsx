import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  User,
  Award,
  Folder,
  Sun,
  Moon,
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Activity,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore';

import {
  db,
} from '../config/firebase';

import {
  useTheme,
} from '../context/ThemeContext';

import useSession from '../hooks/useSession';

import {
  FORM_REGISTRY,
} from '../config/FormRegistry';

import {
  ROLE_LABELS,
  isExecutive,
} from '../config/constants/roles';

import {
  SEVERITY,
  getSeverityColor,
} from '../config/constants/severity';

import {
  TRAINING_STATUS,
} from '../config/constants/status';

import MetaCards from '../components/dashboard/MetaCards';

import RadarChartCard from '../components/dashboard/RadarChartCard';

import ExecutiveApprovalPanel from '../components/dashboard/executive/ExecutiveApprovalPanel';

export default function Dashboard({
  user: propUser,
}) {

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [progressData, setProgressData] =
    useState([]);

  const [executivePendingApprovals, setExecutivePendingApprovals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const {
    darkMode,
    toggleTheme,
  } = useTheme();

  const {
    getSession,
  } = useSession();

  const navigate =
    useNavigate();

  /**
   * =========================================================
   * CURRENT USER
   * =========================================================
   */

  const currentUser =
    useMemo(() => {

      if (
        propUser &&
        Object.keys(propUser).length > 0
      ) {

        return propUser;

      }

      return getSession() || {};

    }, [
      propUser,
      getSession,
    ]);

  /**
   * =========================================================
   * EXECUTIVE MODE
   * =========================================================
   */

  const executiveMode =
    isExecutive(
      currentUser.role
    );

  /**
   * =========================================================
   * FETCH USER PROGRESS
   * =========================================================
   */

  const fetchDashboardData =
    useCallback(async () => {

      if (
        !currentUser?.employeeId
      ) {

        return;

      }

      try {

        setLoading(true);

        /**
         * =============================================
         * STAFF DATA
         * =============================================
         */

        const userProgressQuery =
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

        const userProgressSnapshot =
          await getDocs(
            userProgressQuery
          );

        const userProgress =
          userProgressSnapshot.docs.map(
            (document) => ({

              id: document.id,

              ...document.data(),

            })
          );

        setProgressData(
          userProgress
        );

        /**
         * =============================================
         * EXECUTIVE DATA
         * =============================================
         */

        if (executiveMode) {

          const approvalQuery =
            query(
              collection(
                db,
                'user_progress'
              ),
              where(
                'approvedBy',
                '==',
                currentUser.employeeId
              ),
              where(
                'lifecycleStatus',
                '==',
                TRAINING_STATUS.SUBMITTED
              )
            );

          const approvalSnapshot =
            await getDocs(
              approvalQuery
            );

          const approvals =
            approvalSnapshot.docs.map(
              (document) => ({

                id: document.id,

                ...document.data(),

              })
            );

          setExecutivePendingApprovals(
            approvals
          );

        }

      } catch (error) {

        console.error(
          'Dashboard fetch failed:',
          error
        );

      } finally {

        setLoading(false);

      }

    }, [
      currentUser,
      executiveMode,
    ]);

  /**
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {

    fetchDashboardData();

  }, [fetchDashboardData]);

  /**
   * =========================================================
   * COMPLETED TRAININGS
   * =========================================================
   */

  const completedTrainings =
    useMemo(() => {

      return progressData.filter(
        (item) =>
          item.lifecycleStatus ===
          TRAINING_STATUS.APPROVED
      );

    }, [progressData]);

  /**
   * =========================================================
   * TOTAL TRAININGS
   * =========================================================
   */

  const totalTrainings =
    Object.keys(
      FORM_REGISTRY
    ).length;

  /**
   * =========================================================
   * COMPLETION %
   * =========================================================
   */

  const completionPercentage =
    totalTrainings > 0
      ? Math.round(
          (
            completedTrainings.length /
            totalTrainings
          ) * 100
        )
      : 0;

  /**
   * =========================================================
   * RADAR CHART DATA
   * =========================================================
   */

  const radarSkills =
    useMemo(() => {

      const mappedSkills = {};

      completedTrainings.forEach(
        (training) => {

          mappedSkills[
            training.trainingId
          ] =
            training.finalScore || 0;

        }
      );

      return mappedSkills;

    }, [completedTrainings]);

  /**
   * =========================================================
   * AVERAGE SCORE
   * =========================================================
   */

  const averageSkillScore =
    useMemo(() => {

      if (
        !completedTrainings.length
      ) {

        return 0;

      }

      const total =
        completedTrainings.reduce(
          (accumulator, item) =>
            accumulator +
            Number(
              item.finalScore || 0
            ),
          0
        );

      return Math.round(
        total /
        completedTrainings.length
      );

    }, [completedTrainings]);

  /**
   * =========================================================
   * URGENT TRAININGS
   * =========================================================
   */

  const liveUrgentTrainings =
    useMemo(() => {

      const completedIds =
        completedTrainings.map(
          (training) =>
            training.trainingId
        );

      return Object.entries(
        FORM_REGISTRY
      )

        .filter(
          ([
            trainingId,
            trainingConfig,
          ]) => {

            const isNotCompleted =
              !completedIds.includes(
                trainingId
              );

            const isHighPriority =
              trainingConfig.severity ===
                SEVERITY.CRITICAL ||
              trainingConfig.severity ===
                SEVERITY.HIGH;

            return (
              isNotCompleted &&
              isHighPriority
            );

          }
        )

        .map(
          ([
            trainingId,
            trainingConfig,
          ]) => ({

            id: trainingId,

            title:
              trainingConfig.title,

            severity:
              trainingConfig.severity,

          })
        );

    }, [completedTrainings]);

  /**
   * =========================================================
   * APPROVE SUBMISSION
   * =========================================================
   */

  const handleApprove =
    async (submission) => {

      try {

        const progressRef =
          doc(
            db,
            'user_progress',
            submission.id
          );

        await updateDoc(
          progressRef,
          {

            lifecycleStatus:
              TRAINING_STATUS.APPROVED,

            approvedAt:
              new Date().toISOString(),

            approvedByExecutive:
              currentUser.employeeId,

            updatedAt:
              new Date().toISOString(),

          }
        );

        fetchDashboardData();

      } catch (error) {

        console.error(
          'Approval failed:',
          error
        );

      }

    };

  /**
   * =========================================================
   * REJECT SUBMISSION
   * =========================================================
   */

  const handleReject =
    async (submission) => {

      try {

        const progressRef =
          doc(
            db,
            'user_progress',
            submission.id
          );

        await updateDoc(
          progressRef,
          {

            lifecycleStatus:
              TRAINING_STATUS.REJECTED,

            rejectedAt:
              new Date().toISOString(),

            approvedByExecutive:
              currentUser.employeeId,

            updatedAt:
              new Date().toISOString(),

          }
        );

        fetchDashboardData();

      } catch (error) {

        console.error(
          'Rejection failed:',
          error
        );

      }

    };

  /**
   * =========================================================
   * KPI CARDS
   * =========================================================
   */

  const kpiCards = [

    {
      icon:
        ClipboardCheck,

      label:
        'Completed Trainings',

      value:
        completedTrainings.length,
    },

    {
      icon:
        Activity,

      label:
        'Completion Rate',

      value:
        `${completionPercentage}%`,
    },

    {
      icon:
        Award,

      label:
        'Average Score',

      value:
        `${averageSkillScore}%`,
    },

    executiveMode
      ? {
          icon:
            ShieldCheck,

          label:
            'Pending Approvals',

          value:
            executivePendingApprovals.length,
        }
      : {
          icon:
            ShieldAlert,

          label:
            'Critical Pending',

          value:
            liveUrgentTrainings.length,
        },

  ];

  /**
   * =========================================================
   * STYLES
   * =========================================================
   */

  const styles = {

    page: darkMode
      ? 'bg-[#09090B] text-white'
      : 'bg-[#F8FAFC] text-slate-900',

    card: darkMode
      ? `
        bg-zinc-900/80
        border-zinc-800
      `
      : `
        bg-white
        border-slate-200
      `,

    subText: darkMode
      ? 'text-zinc-400'
      : 'text-slate-500',

    toggleButton: darkMode
      ? `
        bg-zinc-900
        border-zinc-800
        text-amber-400
      `
      : `
        bg-white
        border-slate-200
        text-slate-600
      `,

  };

  /**
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {

    return (
      <div
        className={`
          min-h-screen
          flex
          items-center
          justify-center
          ${styles.page}
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
            Loading dashboard...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div
      className={`
        min-h-screen
        transition-all
        duration-500
        relative
        overflow-hidden
        ${styles.page}
      `}
    >

      {/* BACKGROUND */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">

        <div
          className={`
            absolute
            top-[-15%]
            left-[-10%]
            w-[25rem]
            h-[25rem]
            rounded-full
            blur-[100px]
            opacity-10
            ${
              darkMode
                ? 'bg-blue-700'
                : 'bg-blue-300'
            }
          `}
        />

      </div>

      {/* CONTENT */}
      <main
        className="
          relative
          z-10
          p-6
          md:p-8
          space-y-8
        "
      >

        {/* HEADER */}
        <header
          className="
            flex
            flex-col
            xl:flex-row
            xl:items-center
            xl:justify-between
            gap-6
          "
        >

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-amber-500
                font-black
                mb-3
              "
            >
              {executiveMode
                ? 'Executive Control Center'
                : 'QC Training Dashboard'}
            </p>

            <h1
              className="
                text-4xl
                md:text-5xl
                font-black
                leading-tight
              "
            >
              Welcome back,
              <br />

              <span className="text-amber-500">
                {currentUser.name ||
                  'Staff'}
              </span>
            </h1>

          </div>

          <div className="flex items-center gap-4">

            <div
              className={`
                px-5
                py-3
                rounded-2xl
                border
                text-sm
                font-bold
                ${styles.card}
              `}
            >
              {
                ROLE_LABELS[
                  currentUser.role
                ]
              }
            </div>

            <button
              onClick={toggleTheme}
              className={`
                flex
                items-center
                gap-2
                px-5
                py-3
                rounded-2xl
                border
                text-sm
                font-bold
                transition-all
                ${styles.toggleButton}
              `}
            >

              {darkMode ? (
                <>
                  <Sun size={16} />
                  Light
                </>
              ) : (
                <>
                  <Moon size={16} />
                  Dark
                </>
              )}

            </button>

          </div>

        </header>

        {/* META */}
        <section
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >

          <MetaCards
            icon={User}
            label="EMPLOYEE NAME"
            value={
              currentUser.name
            }
            darkMode={darkMode}
          />

          <MetaCards
            icon={Award}
            label="EMPLOYEE ID"
            value={
              currentUser.employeeId
            }
            darkMode={darkMode}
          />

          <MetaCards
            icon={Folder}
            label="DEPARTMENT"
            value={
              currentUser.department
            }
            darkMode={darkMode}
          />

        </section>

        {/* KPI */}
        <section
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-6
          "
        >

          {kpiCards.map(
            (card) => {

              const Icon =
                card.icon;

              return (

                <div
                  key={card.label}
                  className={`
                    rounded-3xl
                    border
                    p-6
                    ${styles.card}
                  `}
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-[0.25em]
                          opacity-50
                          font-black
                        "
                      >
                        {card.label}
                      </p>

                      <h2
                        className="
                          mt-4
                          text-4xl
                          font-black
                        "
                      >
                        {card.value}
                      </h2>

                    </div>

                    <div
                      className="
                        p-4
                        rounded-2xl
                        bg-amber-500/10
                        text-amber-500
                      "
                    >
                      <Icon size={22} />
                    </div>

                  </div>

                </div>

              );
            }
          )}

        </section>

        {/* EXECUTIVE PANEL */}
        {executiveMode && (

          <ExecutiveApprovalPanel
            submissions={
              executivePendingApprovals
            }
            darkMode={darkMode}
            onApprove={
              handleApprove
            }
            onReject={
              handleReject
            }
          />

        )}

        {/* MAIN GRID */}
        <section
          className="
            grid
            grid-cols-1
            xl:grid-cols-3
            gap-6
          "
        >

          {/* RADAR */}
          <div
            className={`
              xl:col-span-2
              rounded-3xl
              border
              p-6
              ${styles.card}
            `}
          >

            <RadarChartCard
              skills={
                radarSkills
              }
              darkMode={darkMode}
            />

          </div>

          {/* TRAININGS */}
          <div
            className={`
              rounded-3xl
              border
              p-6
              ${styles.card}
            `}
          >

            <div className="mb-6">

              <div className="flex items-center gap-2 mb-3">

                <AlertTriangle
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
                  Action Required
                </p>

              </div>

              <h2
                className="
                  text-2xl
                  font-black
                "
              >
                Pending Trainings
              </h2>

            </div>

            <div className="space-y-4">

              {liveUrgentTrainings.map(
                (training) => {

                  const severityColor =
                    getSeverityColor(
                      training.severity
                    );

                  return (

                    <div
                      key={training.id}
                      className={`
                        p-4
                        rounded-2xl
                        border
                        ${styles.card}
                      `}
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="font-bold text-sm">
                            {training.title}
                          </p>

                          <div className="flex items-center gap-2 mt-2">

                            <span
                              className={`
                                text-[10px]
                                px-2
                                py-1
                                rounded-full
                                uppercase
                                tracking-widest
                                font-bold
                                border
                                ${severityColor.bg}
                                ${severityColor.text}
                                ${severityColor.border}
                              `}
                            >
                              {training.severity}
                            </span>

                          </div>

                        </div>

                        <button
                          onClick={() =>
                            navigate(
                              `/registration/${training.id}`
                            )
                          }
                          className="
                            p-2.5
                            rounded-xl
                            hover:text-amber-500
                            transition-all
                          "
                        >
                          <ArrowUpRight
                            size={16}
                          />
                        </button>

                      </div>

                    </div>

                  );
                }
              )}

              {!liveUrgentTrainings.length && (

                <div className="text-center py-10 opacity-60">

                  <CheckCircle2
                    size={32}
                    className="
                      mx-auto
                      mb-4
                      text-emerald-500
                    "
                  />

                  <p className="text-sm">
                    No urgent trainings.
                  </p>

                </div>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}