import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  ShieldAlert,
  Calendar,
  Filter,
  Clock3,
  ShieldCheck,
  CircleAlert,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import { FORM_REGISTRY } from '../config/FormRegistry';

import { SEVERITY } from '../config/constants/severity';

import {
  TRAINING_STATUS,
} from '../config/constants/status';

import {
  STORAGE_KEYS,
} from '../config/constants/storageKeys';

export default function WisTrainingOG({
  user: propUser,
}) {

  const navigate =
    useNavigate();

  /**
   * =========================================================
   * FILTER
   * =========================================================
   */
  const [activeFilter, setActiveFilter] =
    useState(TRAINING_STATUS.ALL);

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

      return JSON.parse(
        localStorage.getItem(
          STORAGE_KEYS.SESSION
        ) || '{}'
      );

    }, [propUser]);

  /**
   * =========================================================
   * PROGRESS STATE
   * =========================================================
   */
  const [progressMap, setProgressMap] =
    useState({});

  const [loadingProgress, setLoadingProgress] =
    useState(true);

  /**
   * =========================================================
   * LOAD FIREBASE PROGRESS
   * =========================================================
   */
  useEffect(() => {

    const loadProgress =
      async () => {

        if (
          !currentUser?.employeeId
        ) {

          setLoadingProgress(false);
          return;

        }

        try {

          const progressQuery =
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

          const snapshot =
            await getDocs(
              progressQuery
            );

          const map = {};

          snapshot.forEach((doc) => {

            const data =
              doc.data();

            map[
              data.trainingId
            ] = data;

          });

          setProgressMap(map);

        } catch (error) {

          console.error(
            'Failed loading progress:',
            error
          );

        } finally {

          setLoadingProgress(false);

        }

      };

    loadProgress();

  }, [currentUser]);

  /**
   * =========================================================
   * EXECUTIVE CHECK
   * =========================================================
   */
  const isExecutive =
    currentUser?.role ===
    'EXECUTIVE';

  /**
   * =========================================================
   * DATE FORMATTER
   * =========================================================
   */
  const formatDate = (date) => {

    if (!date) {
      return 'N/A';
    }

    return new Date(
      date
    ).toLocaleDateString(
      'en-MY',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  /**
   * =========================================================
   * PROCESS TRAININGS
   * =========================================================
   */
  const processedTrainings =
    useMemo(() => {

      return Object.entries(
        FORM_REGISTRY
      )
        .map(([id, config]) => {

          const progress =
            progressMap[id];

          const deadline =
            config.deadline
              ? new Date(
                  config.deadline
                )
              : null;

          const today =
            new Date();

          let status =
            TRAINING_STATUS.NOT_STARTED;

          if (progress) {

            status =
              progress.lifecycleStatus ||
              TRAINING_STATUS.SUBMITTED;

          } else if (
            deadline &&
            today > deadline
          ) {

            status =
              TRAINING_STATUS.MISSED;

          }

          return {

            id,

            title:
              config.title,

            severity:
              config.severity,

            deadline:
              config.deadline,

            createdAt:
              config.createdAt,

            status,

            progress,

            isNew: (() => {

              const createdDate =
                new Date(
                  config.createdAt
                );

              const diffDays =
                (today - createdDate) /
                (
                  1000 *
                  60 *
                  60 *
                  24
                );

              return diffDays <= 7;

            })(),

          };

        })

        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
        );

    }, [progressMap]);

  /**
   * =========================================================
   * FILTERED TRAININGS
   * =========================================================
   */
  const filteredTrainings =
    useMemo(() => {

      if (
        activeFilter ===
        TRAINING_STATUS.ALL
      ) {

        return processedTrainings;

      }

      return processedTrainings.filter(
        (training) =>
          training.status ===
          activeFilter
      );

    }, [
      activeFilter,
      processedTrainings,
    ]);

  /**
   * =========================================================
   * FILTER TABS
   * =========================================================
   */
  const filterTabs = [

    TRAINING_STATUS.ALL,

    TRAINING_STATUS.NOT_STARTED,

    TRAINING_STATUS.SUBMITTED,

    TRAINING_STATUS.APPROVED,

    TRAINING_STATUS.REJECTED,

    TRAINING_STATUS.MISSED,

  ];

  /**
   * =========================================================
   * STATUS STYLE
   * =========================================================
   */
  const getStatusStyle = (
    status
  ) => {

    switch (status) {

      case TRAINING_STATUS.SUBMITTED:
        return `
          bg-amber-500/10
          text-amber-500
          border-amber-500/20
        `;

      case TRAINING_STATUS.APPROVED:
        return `
          bg-emerald-500/10
          text-emerald-500
          border-emerald-500/20
        `;

      case TRAINING_STATUS.REJECTED:
        return `
          bg-red-500/10
          text-red-500
          border-red-500/20
        `;

      case TRAINING_STATUS.MISSED:
        return `
          bg-red-500/10
          text-red-500
          border-red-500/20
        `;

      default:
        return `
          bg-blue-500/10
          text-blue-500
          border-blue-500/20
        `;
    }
  };

  /**
   * =========================================================
   * STATUS ICON
   * =========================================================
   */
  const getStatusIcon = (
    status
  ) => {

    switch (status) {

      case TRAINING_STATUS.SUBMITTED:
        return (
          <Clock3
            size={12}
            className="shrink-0"
          />
        );

      case TRAINING_STATUS.APPROVED:
        return (
          <CheckCircle2
            size={12}
            className="shrink-0"
          />
        );

      case TRAINING_STATUS.REJECTED:
        return (
          <CircleAlert
            size={12}
            className="shrink-0"
          />
        );

      case TRAINING_STATUS.MISSED:
        return (
          <CircleAlert
            size={12}
            className="shrink-0"
          />
        );

      default:
        return (
          <Clock3
            size={12}
            className="shrink-0"
          />
        );
    }
  };

  /**
   * =========================================================
   * SEVERITY STYLE
   * =========================================================
   */
  const getSeverityStyle = (
    severity
  ) => {

    switch (severity) {

      case SEVERITY.CRITICAL:
        return `
          bg-red-500/10
          text-red-500
          border-red-500/20
        `;

      case SEVERITY.HIGH:
        return `
          bg-amber-500/10
          text-amber-500
          border-amber-500/20
        `;

      default:
        return `
          bg-blue-500/10
          text-blue-500
          border-blue-500/20
        `;
    }
  };

  /**
   * =========================================================
   * ACTIONS
   * =========================================================
   */
  const handleOpenTraining = (
    id
  ) => {

    navigate(
      `/registration/${id}`
    );

  };

  return (
    <div
      className={`
        min-h-screen
        px-4
        py-5
        sm:px-6
        sm:py-6
        lg:px-8
        lg:py-8
        transition-colors
        duration-300
        relative
        overflow-x-hidden
        bg-[#F8FAFC]
        text-slate-900
      `}
    >

      <div
        className="
          relative
          z-10
          max-w-7xl
          mx-auto
          space-y-6
        "
      >

        {/* HEADER */}
        <div
          className="
            flex
            flex-col
            lg:flex-row
            justify-between
            lg:items-center
            gap-6
          "
        >

          <div>

            <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-black mb-3">
              Training Management
            </p>

            <h1
              className="
                text-3xl
                sm:text-4xl
                font-black
                leading-tight
              "
            >
              WIS Training
              <span className="text-amber-500">
                {' '}
                Registry
              </span>
            </h1>

            <p
              className={`
                text-sm
                mt-3
                text-slate-500
              `}
            >
              Operational competency &
              compliance management
              platform.
            </p>

          </div>

          <div
            className="
              flex items-center gap-2
              px-4 py-3
              rounded-2xl
              border
              text-xs
              font-bold
              uppercase
              tracking-widest
              w-fit
              border-slate-300
            "
          >

            <ShieldAlert size={14} />

            {isExecutive
              ? 'Executive Access'
              : 'Operator Access'}

          </div>

        </div>

        {/* FILTERS */}
        <div
          className="
            flex
            flex-col
            gap-3
          "
        >

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50">

            <Filter size={13} />

            Filter

          </div>

          <div
            className="
              flex
              overflow-x-auto
              gap-2
              pb-2
            "
          >

            {filterTabs.map((tab) => {

              const isActive =
                activeFilter === tab;

              return (

                <button
                  key={tab}
                  onClick={() =>
                    setActiveFilter(tab)
                  }
                  className={`
                    whitespace-nowrap
                    px-4 py-2.5
                    rounded-2xl
                    border
                    text-[11px]
                    font-black
                    uppercase
                    tracking-widest
                    transition-all
                    ${
                      isActive
                        ? `
                          bg-amber-500
                          text-slate-950
                          border-transparent
                        `
                        : `
                        text-slate-500
                        hover:text-slate-900
                        border-slate-300
                      `
                    }
                  `}
                >
                  {tab}
                </button>

              );

            })}

          </div>

        </div>

        {/* LOADING */}
        {loadingProgress && (

          <div
            className={`
              p-12
              rounded-3xl
              border
              text-center
              bg-white
              border-slate-200
            `}
          >

            <p className="text-sm opacity-60">
              Loading training progress...
            </p>

          </div>

        )}

        {/* EMPTY */}
        {!loadingProgress &&
          filteredTrainings.length === 0 && (

          <div
            className={`
              p-12
              rounded-3xl
              border
              text-center
              bg-white
              border-slate-200
            `}
          >

            <p className="text-sm opacity-60">
              No trainings found under "
              {activeFilter}".
            </p>

          </div>

        )}

        {/* GRID */}
        {!loadingProgress &&
          filteredTrainings.length > 0 && (

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-5
              sm:gap-6
            "
          >

            {filteredTrainings.map(
              (training) => (

                <div
                  key={training.id}
                  className={`
                    p-5
                    sm:p-6
                    rounded-3xl
                    border
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-2xl
                    flex flex-col justify-between
                    bg-white
                    border-slate-200
                  `}
                >

                  {/* TOP */}
                  <div className="space-y-5">

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-2 flex-wrap">

                        <span className="font-mono text-xs opacity-50">
                          {training.id}
                        </span>

                        {training.isNew && (

                          <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/20">
                            New
                          </span>

                        )}

                      </div>

                      <div
                        className={`
                          flex items-center gap-1.5
                          px-2.5 py-1
                          rounded-full border
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-widest
                          ${getStatusStyle(
                            training.status
                          )}
                        `}
                      >

                        {getStatusIcon(
                          training.status
                        )}

                        {training.status}

                      </div>

                    </div>

                    {/* TITLE */}
                    <div>

                      <h3
                        className="
                          text-base
                          font-bold
                          leading-relaxed
                          min-h-[56px]
                        "
                      >
                        {training.title}
                      </h3>

                    </div>

                    {/* SEVERITY */}
                    <div>

                      <span
                        className={`
                          inline-flex items-center gap-1.5
                          px-2.5 py-1
                          rounded-full border
                          text-[10px]
                          font-bold
                          uppercase
                          tracking-widest
                          ${getSeverityStyle(
                            training.severity
                          )}
                        `}
                      >

                        <ShieldCheck size={11} />

                        {training.severity}

                      </span>

                    </div>

                  </div>

                  {/* FOOTER */}
                  <div
                    className="
                      mt-6
                      pt-5
                      border-t
                      border-slate-200
                      flex items-end justify-between
                      gap-4
                    "
                  >

                    <div className="space-y-1">

                      <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold flex items-center gap-1.5">

                        <Calendar size={10} />

                        Deadline

                      </p>

                      <p
                        className={`
                          text-xs
                          font-mono
                          font-bold
                          ${
                            training.status ===
                            TRAINING_STATUS.MISSED
                              ? 'text-red-500'
                              : 'opacity-80'
                          }
                        `}
                      >

                        {formatDate(
                          training.deadline
                        )}

                      </p>

                    </div>

                    <button
                      onClick={() =>
                        handleOpenTraining(
                          training.id
                        )
                      }
                      className="
                        flex items-center gap-2
                        px-5 py-3
                        rounded-2xl
                        text-[11px]
                        font-black
                        uppercase
                        tracking-widest
                        transition-all
                        bg-amber-500
                        hover:bg-amber-400
                        text-slate-950
                        shadow-lg
                        shadow-amber-500/20
                      "
                    >

                      {training.status ===
                      TRAINING_STATUS.NOT_STARTED
                        ? 'Start Audit'

                        : training.status ===
                          TRAINING_STATUS.SUBMITTED
                        ? 'View Submission'

                        : training.status ===
                          TRAINING_STATUS.APPROVED
                        ? 'View Report'

                        : training.status ===
                          TRAINING_STATUS.REJECTED
                        ? 'Retake Audit'

                        : 'Open'}

                      <ArrowUpRight
                        size={13}
                      />

                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}