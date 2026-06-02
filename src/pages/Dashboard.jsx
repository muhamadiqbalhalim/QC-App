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
  CheckCircle2,
  ClipboardCheck,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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

import {
  Card,
  Button,
  Badge,
} from '../components/ui';

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

  const [
    executivePendingApprovals,
    setExecutivePendingApprovals,
  ] = useState([]);

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
    propUser &&
    Object.keys(propUser).length > 0
      ? propUser
      : getSession() || {};

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
   * FETCH DATA
   * =========================================================
   */

const fetchDashboardData = useCallback(
  async () => {

  if (
    !currentUser?.employeeId
  ) {
    setLoading(false);
    return;
  }

      try {

        setLoading(true);

        /**
         * USER PROGRESS
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
         * EXECUTIVE APPROVALS
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

    }, 
    [currentUser, executiveMode]
  );

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
   * RADAR DATA
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
   * AVG SCORE
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
   * APPROVE
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
   * REJECT
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
        'Completed',

      value:
        completedTrainings.length,

      variant:
        'default',
    },

    {
      icon:
        Activity,

      label:
        'Completion',

      value:
        `${completionPercentage}%`,

      variant:
        'primary',
    },

    {
      icon:
        Award,

      label:
        'Avg Score',

      value:
        `${averageSkillScore}%`,

      variant:
        'success',
    },

    {
      icon:
        ShieldAlert,

      label:
        'Pending',

      value:
        liveUrgentTrainings.length,

      variant:
        'danger',
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
          min-h-[70vh]
          flex
          items-center
          justify-center
          px-6
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
        ${styles.page}
      `}
    >

      <main
        className="
          px-4
          py-5
          sm:px-5
          sm:py-6
          lg:px-8
          lg:py-8
          space-y-5
          sm:space-y-6
          lg:space-y-8
        "
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          {/* LEFT */}
          <div className="min-w-0">

            <div className="flex items-center gap-2 mb-3">

              <Sparkles
                size={16}
                className="text-amber-500"
              />

              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  text-amber-500
                  font-black
                "
              >
                {executiveMode
                  ? 'Executive Dashboard'
                  : 'QC Training System'}
              </p>

            </div>

            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-black
                leading-tight
                break-words
              "
            >

              Welcome,
              {' '}

              <span className="text-amber-500">

                {currentUser.name ||
                  'Operator'}

              </span>

            </h1>

          </div>

          {/* RIGHT */}
          <div
            className="
              flex
              items-center
              gap-3
              flex-wrap
            "
          >

            <Badge
              variant="warning"
              size="lg"
            >

              {
                ROLE_LABELS[
                  currentUser.role
                ]
              }

            </Badge>

            <Button
              variant="secondary"
              size="md"
              onClick={toggleTheme}
              icon={
                darkMode
                  ? Sun
                  : Moon
              }
            >

              {darkMode
                ? 'Light'
                : 'Dark'}

            </Button>

          </div>

        </header>

        {/* ================================================= */}
        {/* META */}
        {/* ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-3
            gap-4
            lg:gap-5
          "
        >

          <MetaCards
            icon={User}
            label="EMPLOYEE NAME"
            value={currentUser.name}
            darkMode={darkMode}
          />

          <MetaCards
            icon={Award}
            label="EMPLOYEE ID"
            value={currentUser.employeeId}
            darkMode={darkMode}
          />

          <MetaCards
            icon={Folder}
            label="DEPARTMENT"
            value={currentUser.department}
            darkMode={darkMode}
          />

        </section>

        {/* ================================================= */}
        {/* EXECUTIVE */}
        {/* ================================================= */}

        {executiveMode && (

          <>

            {/* SUMMARY */}
            <Card
              darkMode={darkMode}
              hover
            >

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-5
                "
              >

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
                        tracking-[0.15em]
                        text-amber-500
                        font-black
                      "
                    >
                      Pending Reviews
                    </p>

                  </div>

                  <h2
                    className="
                      text-5xl
                      font-black
                    "
                  >
                    {
                      executivePendingApprovals.length
                    }
                  </h2>

                  <p className="text-sm opacity-60 mt-3">
                    Awaiting executive validation
                  </p>

                </div>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                  "
                >

                  <Badge
                    variant={
                      executivePendingApprovals.length > 0
                        ? 'danger'
                        : 'success'
                    }
                    size="lg"
                  >

                    {
                      executivePendingApprovals.length > 0
                        ? 'Action Required'
                        : 'All Clear'
                    }

                  </Badge>

                </div>

              </div>

            </Card>

            {/* APPROVAL PANEL */}
            <ExecutiveApprovalPanel
              submissions={
                executivePendingApprovals
              }
              darkMode={darkMode}
              onApprove={handleApprove}
              onReject={handleReject}
            />

          </>

        )}

        {/* ================================================= */}
        {/* OPERATOR */}
        {/* ================================================= */}

        {!executiveMode && (

          <>

            {/* KPI */}
            <section
              className="
                grid
                grid-cols-2
                xl:grid-cols-4
                gap-3
                sm:gap-4
                lg:gap-5
              "
            >

              {kpiCards.map((card) => {

                const Icon =
                  card.icon;

                return (

                  <Card
                    key={card.label}
                    darkMode={darkMode}
                    hover
                    className={`
                      min-h-[150px]
                      relative
                      overflow-hidden
                    `}
                  >

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                        relative
                        z-10
                      "
                    >

                      <div className="min-w-0">

                        <p
                          className="
                            text-xs
                            uppercase
                            tracking-[0.15em]
                            opacity-50
                            font-black
                          "
                        >
                          {card.label}
                        </p>

                        <h2
                          className="
                            mt-5
                            text-3xl
                            lg:text-4xl
                            font-black
                            break-words
                          "
                        >
                          {card.value}
                        </h2>

                      </div>

                      <div
                        className="
                          p-3
                          rounded-2xl
                          bg-amber-500/10
                          text-amber-500
                          shrink-0
                        "
                      >

                        <Icon size={22} />

                      </div>

                    </div>

                  </Card>

                );

              })}

            </section>

            {/* MAIN CONTENT */}
            <section
              className="
                grid
                grid-cols-1
                xl:grid-cols-3
                gap-4
                lg:gap-5
              "
            >

              {/* RADAR */}
              <Card
                darkMode={darkMode}
                className="
                  xl:col-span-2
                  overflow-hidden
                "
              >

                <RadarChartCard
                  skills={radarSkills}
                  darkMode={darkMode}
                />

              </Card>

              {/* PENDING */}
              <Card
                darkMode={darkMode}
              >

                <div className="mb-5">

                  <div className="flex items-center gap-2 mb-3">

                    <AlertTriangle
                      size={16}
                      className="text-amber-500"
                    />

                    <p
                      className="
                        text-xs
                        uppercase
                        tracking-[0.15em]
                        text-amber-500
                        font-black
                      "
                    >
                      Pending Trainings
                    </p>

                  </div>

                  <h2
                    className="
                      text-2xl
                      font-black
                    "
                  >
                    Action Required
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

                        <button
                          key={training.id}
                          onClick={() =>
                            navigate(
                              `/registration/${training.id}`
                            )
                          }
                          className={`
                            w-full
                            text-left
                            p-4
                            rounded-2xl
                            border
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:border-amber-500/30
                            ${
                              darkMode
                                ? `
                                  border-zinc-800
                                  bg-zinc-950/40
                                `
                                : `
                                  border-slate-200
                                  bg-slate-50
                                `
                            }
                          `}
                        >

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              gap-4
                            "
                          >

                            <div className="min-w-0">

                              <p
                                className="
                                  font-bold
                                  text-sm
                                  sm:text-base
                                  break-words
                                  leading-6
                                "
                              >
                                {training.title}
                              </p>

                              <div className="mt-3">

                                <span
                                  className={`
                                    inline-flex
                                    items-center
                                    rounded-full
                                    border
                                    px-3
                                    py-1.5
                                    text-[11px]
                                    uppercase
                                    font-black
                                    tracking-wide
                                    ${severityColor.bg}
                                    ${severityColor.text}
                                    ${severityColor.border}
                                  `}
                                >
                                  {
                                    training.severity
                                  }
                                </span>

                              </div>

                            </div>

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                                shrink-0
                                text-amber-500
                                font-black
                                text-sm
                              "
                            >

                              Start

                              <ArrowUpRight
                                size={18}
                              />

                            </div>

                          </div>

                        </button>

                      );

                    }
                  )}

                  {!liveUrgentTrainings.length && (

                    <div
                      className="
                        text-center
                        py-10
                        opacity-70
                      "
                    >

                      <CheckCircle2
                        size={36}
                        className="
                          mx-auto
                          mb-4
                          text-emerald-500
                        "
                      />

                      <h3
                        className="
                          font-black
                          text-lg
                          mb-2
                        "
                      >
                        All Trainings Completed
                      </h3>

                      <p className="text-sm">
                        No urgent training pending.
                      </p>

                    </div>

                  )}

                </div>

              </Card>

            </section>

          </>

        )}

      </main>

    </div>

  );

}