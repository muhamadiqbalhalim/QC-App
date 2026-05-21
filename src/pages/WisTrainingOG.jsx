import React, {
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

import { useTheme } from '../context/ThemeContext';

import { FORM_REGISTRY } from '../config/FormRegistry';

import { SEVERITY } from '../config/constants/severity';
import { TRAINING_STATUS } from '../config/constants/status';
import { STORAGE_KEYS } from '../config/constants/storageKeys';

export default function WisTrainingOG({
  user: propUser,
}) {
  const { darkMode } = useTheme();

  const navigate = useNavigate();

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
  const currentUser = useMemo(() => {
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
   * USER DATA
   * =========================================================
   */
  const completedTrainings =
    currentUser?.completedTrainings ||
    [];

  const isExecutive =
    currentUser?.role ===
      'Executive' ||
    currentUser?.employeeId?.startsWith(
      'EXEC'
    );

  /**
   * =========================================================
   * HELPERS
   * =========================================================
   */
  const formatDate = (date) => {
    if (!date) return 'N/A';

    return new Date(
      date
    ).toLocaleDateString('en-MY', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * =========================================================
   * STYLES
   * =========================================================
   */
  const styles = {
    page: darkMode
      ? 'bg-[#0F172A] text-white'
      : 'bg-[#F8FAFC] text-slate-900',

    card: darkMode
      ? `
        bg-white/5
        border-white/10
        hover:border-amber-500/20
        backdrop-blur-xl
      `
      : `
        bg-white
        border-slate-200
        hover:border-slate-300
      `,

    subText: darkMode
      ? 'text-slate-400'
      : 'text-slate-500',

    filterButton: darkMode
      ? 'text-slate-400 hover:text-white'
      : 'text-slate-500 hover:text-slate-900',
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
          const deadline =
            config.deadline
              ? new Date(
                  config.deadline
                )
              : null;

          const today = new Date();

          const isCompleted =
            completedTrainings.includes(
              id
            );

          let status =
            TRAINING_STATUS.NOT_TAKEN;

          if (isCompleted) {
            status =
              TRAINING_STATUS.TAKEN;
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
              config.title ||
              'Untitled Training',

            severity:
              config.severity ||
              SEVERITY.STANDARD,

            deadline:
              config.deadline ||
              'N/A',

            createdAt:
              config.createdAt ||
              '2026-01-01',

            status,

            isNew: (() => {
              const createdDate =
                new Date(
                  config.createdAt ||
                    '2026-01-01'
                );

              const diffDays =
                (today - createdDate) /
                (1000 *
                  60 *
                  60 *
                  24);

              return diffDays <= 7;
            })(),
          };
        })

        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );
    }, [completedTrainings]);

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
    TRAINING_STATUS.MISSED,
    TRAINING_STATUS.TAKEN,
    TRAINING_STATUS.NOT_TAKEN,
  ];

  /**
   * =========================================================
   * HELPERS
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

  const getStatusStyle = (
    status
  ) => {
    switch (status) {
      case TRAINING_STATUS.TAKEN:
        return `
          bg-emerald-500/10
          text-emerald-500
          border-emerald-500/20
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

  const getStatusIcon = (
    status
  ) => {
    switch (status) {
      case TRAINING_STATUS.TAKEN:
        return (
          <CheckCircle2
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
   * ACTIONS
   * =========================================================
   */
  const handleOpenTraining = (
    id
  ) => {
    navigate(`/registration/${id}`);
  };

  return (
    <div
      className={`
        min-h-screen
        p-6
        transition-colors
        duration-300
        relative
        overflow-hidden
        ${styles.page}
      `}
    >
      {/* BG FX */}
      {darkMode && (
        <>
          <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-900/10 blur-[120px] pointer-events-none z-0" />

          <div className="fixed bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-indigo-950/20 blur-[100px] pointer-events-none z-0" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">

          <div>

            <p className="text-xs uppercase tracking-[0.3em] text-amber-500 font-black mb-3">
              Training Management
            </p>

            <h1 className="text-4xl font-black">
              WIS Training
              <span className="text-amber-500">
                {' '}
                Registry
              </span>
            </h1>

            <p
              className={`text-sm mt-3 ${styles.subText}`}
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
              border border-white/10
              bg-white/5
              text-xs
              font-bold
              uppercase
              tracking-widest
              w-fit
            "
          >
            <ShieldAlert size={14} />

            {isExecutive
              ? 'Executive Access'
              : 'Operator Access'}
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-wrap items-center gap-3">

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-50">
            <Filter size={13} />
            Filter
          </div>

          <div className="flex flex-wrap gap-2">

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
                          border-white/10
                          ${styles.filterButton}
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

        {/* EMPTY */}
        {filteredTrainings.length ===
          0 && (
          <div
            className={`
              p-12
              rounded-3xl
              border
              text-center
              ${styles.card}
            `}
          >
            <p className="text-sm opacity-60">
              No trainings found under "
              {activeFilter}".
            </p>
          </div>
        )}

        {/* GRID */}
        {filteredTrainings.length >
          0 && (
          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              xl:grid-cols-3
              gap-6
            "
          >
            {filteredTrainings.map(
              (training) => (
                <div
                  key={training.id}
                  className={`
                    p-6
                    rounded-3xl
                    border
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-2xl
                    flex flex-col justify-between
                    ${styles.card}
                  `}
                >
                  {/* TOP */}
                  <div className="space-y-5">

                    {/* STATUS */}
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

                      <h3 className="text-base font-bold leading-relaxed min-h-[56px]">
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
                  <div className="mt-6 pt-5 border-t border-white/10 flex items-end justify-between gap-4">

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
                      TRAINING_STATUS.TAKEN
                        ? 'View Audit'
                        : 'Start Audit'}

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