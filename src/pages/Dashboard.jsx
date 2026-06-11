import { useMemo, useEffect, useState, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import {
  User,
  Folder,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "../config/firebase";

import useSession from "../hooks/useSession";

import { ROLE_LABELS, isExecutive } from "../config/constants/roles";

import { TRAINING_STATUS } from "../config/constants/status";

import MetaCards from "../components/dashboard/MetaCards";

import RadarChartCard from "../components/dashboard/RadarChartCard";

import ExecutiveApprovalPanel from "../components/dashboard/executive/ExecutiveApprovalPanel";

import { Card, Badge } from "../components/ui";

export default function Dashboard({ user: propUser }) {
  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [progressData, setProgressData] = useState([]);
  const [companyTrainings, setCompanyTrainings] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const [executivePendingApprovals, setExecutivePendingApprovals] = useState(
    [],
  );

  const [loading, setLoading] = useState(true);

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */
  const { getSession } = useSession();

  const navigate = useNavigate();

  /**
   * =========================================================
   * CURRENT USER
   * =========================================================
   */

  const currentUser = useMemo(() => {
    return propUser && Object.keys(propUser).length > 0
      ? propUser
      : getSession() || {};
  }, [getSession, propUser]);

  /**
   * =========================================================
   * EXECUTIVE MODE
   * =========================================================
   */

  const executiveMode = isExecutive(currentUser.role);

  /**
   * =========================================================
   * FETCH DATA
   * =========================================================
   */

  const fetchDashboardData = useCallback(async () => {
    if (!currentUser?.employeeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userProgressQuery = query(
        collection(db, "user_progress"),
        where("employeeId", "==", currentUser.employeeId),
      );

const departmentSnapshot = await getDocs(
  query(
    collection(db, "trainings"),
    where(
      "allowedDepartments",
      "array-contains",
      currentUser.department
    )
  )
);

const allSnapshot = await getDocs(
  query(
    collection(db, "trainings"),
    where(
      "allowedDepartments",
      "array-contains",
      "ALL"
    )
  )
);

const privateSnapshot = await getDocs(
  query(
    collection(db, "trainings"),
    where(
      "invitedUsers",
      "array-contains",
      currentUser.id
    )
  )
);

const uniqueTrainings = new Map();

[
  ...departmentSnapshot.docs,
  ...allSnapshot.docs,
  ...privateSnapshot.docs,
].forEach((doc) => {
  uniqueTrainings.set(doc.id, {
    id: doc.id,
    ...doc.data(),
  });
});

const trainingList = Array.from(
  uniqueTrainings.values()
);

const attendanceSnapshot = await getDocs(
  query(
    collection(db, "training_attendance"),
    where(
      "staffId",
      "==",
      String(currentUser.employeeId)
    )
  )
);

const attendanceList =
  attendanceSnapshot.docs.map(
    (doc) => ({
      id: doc.id,
      ...doc.data(),
    })
  );

setAttendanceData(attendanceList);
setCompanyTrainings(trainingList);

if (executiveMode) {

  const submissionSnapshot = await getDocs(
    query(
      collection(db, "user_progress"),
      where(
        "approvedBy",
        "==",
        String(currentUser.employeeId)
      )
    )
  );

  const approvals =
    submissionSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (item) =>
          item.lifecycleStatus ===
          TRAINING_STATUS.SUBMITTED
      );

  setExecutivePendingApprovals(
    approvals
  );
}

    } catch (error) {
      console.error("Dashboard fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser, executiveMode]);

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

    const completedTrainings = useMemo(() => {
      return attendanceData;
    }, [attendanceData]);

    const attendedTrainingIds = new Set(
    attendanceData.map(
      (item) => item.trainingId
    )
  );
  /**
   * =========================================================
   * RADAR DATA
   * =========================================================
   */

  const radarSkills = useMemo(() => {
    const mappedSkills = {};

    completedTrainings.forEach((training) => {
      mappedSkills[training.trainingId] = training.finalScore || 0;
    });

    return mappedSkills;
  }, [completedTrainings]);

  /**
   * =========================================================
   * URGENT TRAININGS
   * =========================================================
   */

const liveUrgentTrainings = useMemo(() => {
  const today = new Date();

  return companyTrainings
    .map((training) => {
      const trainingDate = new Date(training.dateString);

      const diffDays = Math.ceil(
        (trainingDate - today) / (1000 * 60 * 60 * 24)
      );

      let urgency = "UPCOMING";

      if (diffDays < 0) {
        urgency = "OVERDUE";
      } else if (diffDays <= 3) {
        urgency = "URGENT";
      }

      return {
        id: training.id,
        title: training.name,
        date: training.dateString,
        location: training.where,
        urgency,
        diffDays,
      };
    })

    // HIDE OVERDUE
    .filter(
      (training) =>
        !attendedTrainingIds.has(training.id) &&
        training.diffDays >= 0 &&
        training.diffDays <= 7
    )

    .sort((a, b) => a.diffDays - b.diffDays)

    .slice(0, 5);
}, [companyTrainings]);


const trainingSummary = useMemo(() => {
  const today = new Date();

  return companyTrainings
    .filter(
      (training) =>
        !attendedTrainingIds.has(training.id)
    )
    .map((training) => {
      const trainingDate = new Date(
        training.dateString
      );

      const diffDays = Math.ceil(
        (trainingDate - today) /
          (1000 * 60 * 60 * 24)
      );

      return {
        ...training,
        diffDays,
      };
    });
}, [companyTrainings, attendanceData]);


    const pendingTrainings = trainingSummary.filter(
      (item) =>
        item.diffDays >= 0 &&
        item.diffDays <= 7
    );

  /**
   * =========================================================
   * APPROVE
   * =========================================================
   */

    const openReview = (submission) => {
      navigate(`/review/${submission.id}`);
    };

    const overdueCount = trainingSummary.filter(
      (item) => item.diffDays < 0
    ).length;

    const upcomingCount = trainingSummary.filter(
      (item) =>
        item.diffDays >= 0 &&
        item.diffDays <= 7
    ).length;
    /**
     * =========================================================
     * REJECT
     * =========================================================
     */

  /**
   * =========================================================
   * KPI CARDS
   * =========================================================
   */

    const kpiCards = [
      {
        icon: ClipboardCheck,
        label: "Completed",
        value: completedTrainings.length,
        variant: "default",
      },

      {
        icon: AlertTriangle,
        label: "Overdue",
        value: overdueCount,
        variant: "danger",
      },

      {
        icon: Folder,
        label: "Upcoming",
        value: upcomingCount,
        variant: "primary",
      },

      {
        icon: ShieldAlert,
        label: "Pending",
        value: pendingTrainings.length,
        variant: "warning",
      }
    ];

  /**
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div
        className="
            min-h-screen
            transition-all
            duration-500
            bg-[#F8FAFC]
            text-slate-900
          "
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

          <p className="text-sm opacity-60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        min-h-screen
        transition-all
        duration-500
        bg-[#F8FAFC]
        text-slate-900
      "
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
              <Sparkles size={16} className="text-amber-500" />

              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.15em]
                  text-amber-500
                  font-black
                "
              >
                {executiveMode ? "Executive Dashboard" : "QC Training System"}
              </p>
            </div>

            <h1
              className="
                text-2xl
                sm:text-4xl
                lg:text-5xl
                font-black
                leading-tight
                break-words
              "
            >
              Welcome Back,{" "}
              <span className="text-amber-500">
                {currentUser.name || "Operator"}
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
            <Badge variant="warning" size="lg">
              {ROLE_LABELS[currentUser.role]}
            </Badge>
          </div>
        </header>

        <section className="block sm:hidden">
          <Card>
            <div className="space-y-3">
              <div>
                <p className="text-xs opacity-50 font-bold">EMPLOYEE</p>

                <p className="font-black text-lg">{currentUser.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-50 font-bold">ID</p>

                  <p className="font-bold">{currentUser.employeeId}</p>
                </div>

                <div>
                  <p className="text-xs opacity-50 font-bold">DEPARTMENT</p>

                  <p className="font-bold">{currentUser.department}</p>
                </div>
              </div>
            </div>
          </Card>
        </section>

        <section
          className="
            hidden
            sm:grid
            grid-cols-2
            xl:grid-cols-3
            gap-4
            lg:gap-5
          "
        >
          <MetaCards
            icon={User}
            label="EMPLOYEE NAME"
            value={currentUser.name}
          />

          <MetaCards
            icon={ClipboardCheck}
            label="EMPLOYEE ID"
            value={currentUser.employeeId}
          />

          <MetaCards
            icon={Folder}
            label="DEPARTMENT"
            value={currentUser.department}
          />
        </section>

        {/* ================================================= */}
        {/* EXECUTIVE */}
        {/* ================================================= */}

        {executiveMode && (
          <>
            {/* SUMMARY */}
            <Card hover>
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
                    <ShieldCheck size={16} className="text-amber-500" />

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
                    {executivePendingApprovals.length}
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
                        ? "danger"
                        : "success"
                    }
                    size="lg"
                  >
                    {executivePendingApprovals.length > 0
                      ? "Action Required"
                      : "All Clear"}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* APPROVAL PANEL */}
            <ExecutiveApprovalPanel
              submissions={executivePendingApprovals}
              onApprove={openReview}
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
                const Icon = card.icon;

                return (
                  <Card
                    key={card.label}
                    hover
                    className={`
                      min-h-[100px]
                      lg:min-h-[150px]
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
                            text-2xl
                            sm:text-3xl
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
                className="
                  xl:col-span-2
                  overflow-hidden
                  min-h-[420px]
                  hidden
                  md:block
                "
              >
                {Object.keys(radarSkills).length > 0 ? (
                  <RadarChartCard skills={radarSkills} />
                ) : (
                  <div className="flex items-center justify-center h-[320px] text-slate-500">
                    No competency data available yet
                  </div>
                )}
              </Card>

              {/* PENDING */}
              <Card>
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-amber-500" />

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
                  {liveUrgentTrainings.map((training) => {
                    const urgencyStyle =
                      training.urgency === "OVERDUE"
                        ? {
                            bg: "bg-red-500/10",
                            text: "text-red-500",
                            border: "border-red-500/20",
                          }
                        : training.urgency === "URGENT"
                          ? {
                              bg: "bg-amber-500/10",
                              text: "text-amber-500",
                              border: "border-amber-500/20",
                            }
                          : {
                              bg: "bg-blue-500/10",
                              text: "text-blue-500",
                              border: "border-blue-500/20",
                            };

                    return (
                      <button
                        key={training.id}
                        onClick={() =>
                        navigate("/my-trainings")
                          
                          
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
                            border-slate-200
                            bg-slate-50
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
                                  ${urgencyStyle.bg}
                                  ${urgencyStyle.text}
                                  ${urgencyStyle.border}
                                `}
                              >
                                {training.urgency}
                              </span>

                              <p
                                className="
                                  text-xs
                                  mt-2
                                  opacity-60
                                "
                              >
                                {training.date}
                              </p>
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
                            <ArrowUpRight size={18} />
                          </div>
                        </div>
                      </button>
                    );
                  })}

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

                      <p className="text-sm">No urgent training pending.</p>
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
