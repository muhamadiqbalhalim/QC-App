import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { ClipboardCheck, ArrowUpRight, FileText } from "lucide-react";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../config/firebase";

import { STORAGE_KEYS } from "../config/constants/storageKeys";

import { FORM_REGISTRY } from "../config/FormRegistry";

export default function MyInspectionForms() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");

  const [progressMap, setProgressMap] = useState({});

  const currentUser = useMemo(
    () => JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || "{}"),
    [],
  );

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const snapshot = await getDocs(
          query(
            collection(db, "user_progress"),
            where("employeeId", "==", currentUser.employeeId),
          ),
        );

        const map = {};

        snapshot.forEach((doc) => {
          const data = doc.data();

          const formId = data.trainingId;

          map[formId] = data;
        });

        setProgressMap(map);
      } catch (error) {
        console.error(error);
      }
    };

    if (currentUser?.employeeId) {
      loadProgress();
    }
  }, [currentUser]);

  const inspectionForms = useMemo(() => {
    return Object.entries(FORM_REGISTRY).map(([id, form]) => ({
      id,

      title: form.title || id,

      severity: form.severity || "NORMAL",

      deadline: form.deadline || "-",
    }));
  }, []);

  const filteredForms = inspectionForms
    .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aStatus = progressMap[a.id]?.lifecycleStatus || "NOT_STARTED";

      const bStatus = progressMap[b.id]?.lifecycleStatus || "NOT_STARTED";

      const order = {
        NOT_STARTED: 1,

        REJECTED: 2,

        SUBMITTED: 3,

        APPROVED: 4,
      };

      return order[aStatus] - order[bStatus];
    });

  const handleOpenForm = (formId) => {
    navigate(`/registration/${formId}`);
  };

  return (
    <div
      className="
        min-h-screen
        bg-[#F8FAFC]
        px-4
        md:px-6
        py-6
      "
    >
    <div
    className="
        w-full
        space-y-8
    "
    >
        {/* HEADER */}

        <div>
          <p
            className="
              text-sm
              uppercase
              tracking-[0.3em]
              text-amber-500
              font-black
              mb-3
            "
          >
            Inspection Management
          </p>

          <h1
            className="
                text-2xl
                sm:text-2xl
                md:text-5xl
                font-black
                leading-tight
            "
          >
            My Inspection Forms
          </h1>

          <p
            className="
              mt-2
              text-slate-500
            "
          >
            Complete and submit your assigned QC inspection forms.
          </p>
        </div>

        {/* STATS */}

        <div
          className="
                grid
                grid-cols-1
                md:grid-cols-3
                gap-6
                "
        >
          <div
            className="
            bg-white
            border
            rounded-3xl
            p-6
            shadow-sm
            hover:shadow-xl
            hover:-translate-y-1
            transition-all
            duration-300
            "
          >
            <p className="text-sm text-slate-500">Total Forms</p>

            <h2
              className="
                text-2xl md:text-4xl
                font-black
                mt-2
              "
            >
              {inspectionForms.length}
            </h2>
          </div>

          <div
            className="
            bg-white
            border
            rounded-3xl
            p-6
            shadow-sm
            hover:shadow-xl
            hover:-translate-y-1
            transition-all
            duration-300
            "
          >
            <p className="text-sm text-slate-500">Employee ID</p>

            <h2
              className="
                text-2xl
                font-black
                mt-2
              "
            >
              {currentUser?.employeeId}
            </h2>
          </div>

          <div
            className="
            bg-white
            border
            rounded-3xl
            p-6
            shadow-sm
            hover:shadow-xl
            hover:-translate-y-1
            transition-all
            duration-300
            "
          >
            <p className="text-sm text-slate-500">Department</p>

            <h2
              className="
                text-2xl
                font-black
                mt-2
              "
            >
              {currentUser?.department}
            </h2>
          </div>
        </div>

        <div
          className="
            bg-white
            border
            rounded-3xl
            p-4
            shadow-sm
        "
        >
          <input
            type="text"
            placeholder="Search inspection form..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
                    w-full
                    text-sm
                    bg-transparent
                    outline-none
                    placeholder:text-slate-400
                    "
          />
        </div>

        {/* FORM LIST */}

        <div>
          <div
            className="
              flex
              items-center
              gap-3
              mb-6
            "
          >
            <ClipboardCheck
              size={22}
              className="
                text-amber-500
              "
            />

            <h2
              className="
                text-2xl
                font-black
              "
            >
              Inspection Forms
            </h2>
          </div>

          <div
            className="
                    grid
                    grid-cols-[repeat(auto-fill,minmax(320px,1fr))]
                    gap-6
                    "
          >
            {filteredForms.length === 0 && (
              <div
                className="
                col-span-full
                bg-white
                border
                rounded-3xl
                p-10
                text-center
                "
              >
                <FileText
                  size={40}
                  className="
                 mx-auto
                    text-slate-300
                    mb-4
                "
                />

                <h3 className="font-bold">No Inspection Forms Found</h3>

                <p
                  className="
                    text-sm
                    text-slate-500
                    mt-2
                "
                >
                  No matching forms found.
                </p>
              </div>
            )}

            {filteredForms.map((item) => (
              <div
                key={item.id}
                className="
                    bg-white
                    border
                    rounded-3xl
                    p-6 md:p-8
                    shadow-sm
                    hover:shadow-xl
                    hover:-translate-y-1
                    transition-all
                    duration-300
                "
              >
                <div className="space-y-4">
                  <div
                    className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-amber-500/10
                        flex
                        items-center
                        justify-center
                      "
                  >
                    <FileText
                      size={26}
                      className="
                          text-amber-500
                        "
                    />
                  </div>

                  <div>
                    <h3
                      className="
                          text-2xl
                          font-black
                        "
                    >
                      {item.title}
                    </h3>
                    <p
                      className="
                        text-sm
                        text-slate-500
                        mt-2
                    "
                    >
                      Form ID : {item.id}
                    </p>
                  </div>
                  <div
                    className="
                        flex
                        justify-between
                        items-center
                    "
                  >
                    <span
                      className="
                        text-sm
                        text-slate-500
                        "
                    >
                      Status
                    </span>

                    <span
                      className={`
                        rounded-full
                        font-black
                        px-2.5
                        py-1
                        text-[10px]
                        md:text-xs

                        ${
                          progressMap[item.id]?.lifecycleStatus === "APPROVED"
                            ? `
                                bg-emerald-100
                                text-emerald-600
                                `
                            : progressMap[item.id]?.lifecycleStatus ===
                                "SUBMITTED"
                              ? `
                                    bg-amber-100
                                    text-amber-600
                                `
                              : progressMap[item.id]?.lifecycleStatus ===
                                  "REJECTED"
                                ? `
                                    bg-red-100
                                    text-red-600
                                    `
                                : `
                                    bg-slate-100
                                    text-slate-600
                                    `
                        }
                        `}
                    >
                      {progressMap[item.id]?.lifecycleStatus || "NOT STARTED"}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenForm(item.id)}
                    className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        px-4
                        py-4
                        rounded-2xl
                        bg-amber-500
                        hover:bg-amber-400
                        font-black
                        text-lg
                      "
                  >
                    Open Form
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
