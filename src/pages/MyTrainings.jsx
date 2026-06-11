import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Calendar,
  Clock3,
  MapPin,
  User,
  BookOpen,
  ShieldAlert,
} from "lucide-react";

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from "../config/firebase";

import { STORAGE_KEYS } from "../config/constants/storageKeys";

export default function MyTrainings({ user: propUser }) {
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    if (propUser && Object.keys(propUser).length > 0) {
      return propUser;
    }

    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || "{}");
  }, [propUser]);

  const [loading, setLoading] = useState(true);

  const [assignedTrainings, setAssignedTrainings] = useState([]);

  const [attendance, setAttendance] = useState([]);

  const [filterStatus, setFilterStatus] = useState("ALL");

  useEffect(() => {
    if (!currentUser?.employeeId) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const requests = [];

      if (currentUser?.department) {
        requests.push(
          Promise.all([
            getDocs(
              query(
                collection(db, "trainings"),
                where(
                  "allowedDepartments",
                  "array-contains",
                  currentUser.department
                )
              )
            ),

            getDocs(
              query(
                collection(db, "trainings"),
                where(
                  "allowedDepartments",
                  "array-contains",
                  "ALL"
                )
              )
            ),

            getDocs(
              query(
                collection(db, "trainings"),
                where(
                  "invitedUsers",
                  "array-contains",
                  currentUser.id
                ),
              ),
            ),

            currentUser?.uid
              ? getDocs(
                  query(
                    collection(db, "trainings"),
                    where(
                      "invitedUsers",
                      "array-contains",
                      currentUser.uid,
                    ),
                  ),
                )
              : Promise.resolve({ docs: [] }),
          ])
          );
        } else {
          requests.push(Promise.resolve(null));
        }

        requests.push(
          getDocs(
            query(
              collection(db, "training_attendance"),
              where("staffId", "==", String(currentUser.employeeId)),
            ),
          ),
        );

        const [trainingSnapshot, attendanceSnapshot] =
          await Promise.all(requests);

        if (trainingSnapshot) {
          const trainingDocs = trainingSnapshot.flatMap(
            (snapshot) => snapshot?.docs || []
          );
          const uniqueTrainings = new Map();

          trainingDocs.forEach((doc) => {
            const data = doc.data();

            console.log("Training:", {
              id: doc.id,
              name: data.name,
              isPrivate: data.isPrivate,
              invitedUsers: data.invitedUsers,
              allowedDepartments: data.allowedDepartments,
            });

            uniqueTrainings.set(doc.id, {
              id: doc.id,
              ...data,
            });
          });

          const trainingList = Array.from(uniqueTrainings.values());
          setAssignedTrainings(trainingList);
        }

        const attendanceList = attendanceSnapshot.docs.map((doc) => ({
          id: doc.id,

          ...doc.data(),
        }));

        setAttendance(attendanceList);
      } catch (error) {
        console.error("Failed loading trainings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const trainingHubItems = useMemo(() => {
    const employeeId = String(currentUser.employeeId || "");

    const items = assignedTrainings.map((training) => {
      const attended = attendance.find(
        (record) =>
          String(record.staffId) === employeeId &&
          record.trainingId === training.id,
      );

      const trainingDate = new Date(
        `${training.dateString} ${training.timeString || "23:59"}`
      );

      const overdue = trainingDate < new Date();

      return {
        ...training,

    attendanceStatus: attended
      ? "ATTENDED"
      : overdue
        ? "MISSED"
        : "PENDING",
      };

      }); // <-- tutup map dulu

      items.sort((a, b) => {

      if (
        a.attendanceStatus === "PENDING" &&
        b.attendanceStatus === "ATTENDED"
      ) {
        return -1;
      }

      if (
        a.attendanceStatus === "ATTENDED" &&
        b.attendanceStatus === "PENDING"
      ) {
        return 1;
      }

      const dateA = new Date(`${a.dateString} ${a.timeString || "00:00"}`);

      const dateB = new Date(`${b.dateString} ${b.timeString || "00:00"}`);

      return dateA - dateB;
    });
    return items;
  }, [assignedTrainings, attendance, currentUser]);

  const isOverdue = (item) => {
    const trainingDate = new Date(
      `${item.dateString} ${item.timeString || "23:59"}`,
    );

    return trainingDate < new Date();
  };

  const filteredTrainings = useMemo(() => {
    if (filterStatus === "JOINED") {
      return trainingHubItems.filter(
        (item) => item.attendanceStatus === "ATTENDED",
      );
    }

    if (filterStatus === "MISSED") {
      return trainingHubItems.filter(
        (item) => item.attendanceStatus === "MISSED"
      );
    }

    if (filterStatus === "PENDING") {
      return trainingHubItems.filter(
        (item) => item.attendanceStatus === "PENDING"
      );
    }

    return trainingHubItems;
  }, [trainingHubItems, filterStatus]);

  const stats = useMemo(
    () => ({
      total: trainingHubItems.length,

      attended: trainingHubItems.filter(
        (item) => item.attendanceStatus === "ATTENDED"
      ).length,

      upcoming: trainingHubItems.filter(
        (item) => item.attendanceStatus === "PENDING"
      ).length,

      missed: trainingHubItems.filter(
        (item) => item.attendanceStatus === "MISSED"
      ).length,
    }),
    [trainingHubItems],
  );

  const registerAndJoinTraining = async (item) => {
  try {
    const existingRegistration = await getDocs(
      query(
        collection(db, "training_registrations"),
        where(
          "staffId",
          "==",
          String(currentUser.employeeId)
        ),
        where(
          "trainingId",
          "==",
          item.id
        )
      )
    );

    if (existingRegistration.empty) {
      await addDoc(
        collection(
          db,
          "training_registrations"
        ),
        {
          staffId: String(
            currentUser.employeeId
          ),

          fullName:
            currentUser.name,

          department:
            currentUser.department,

          trainingId:
            item.id,

          trainingName:
            item.name,

          trainingDate:
            item.dateString,

          userId:
            currentUser.id,

          type:
            "TrainingRegistration",

          submittedDate:
            new Date().toLocaleString(),

          timestamp:
            serverTimestamp(),
        }
      );
    }

    navigate(
      "/training-attendance",
      {
        state: {
          trainingId: item.id,
        },
      }
    );

  } catch (error) {
    console.error(error);
    alert(
      "Failed to register training."
    );
  }
};

  const isExecutive = currentUser?.role === "EXECUTIVE";

  const getAssignedStatusStyle = (status) => {
    switch (status) {
      case "ATTENDED":
        return `
                bg-emerald-500/10
                text-emerald-600
                border-emerald-200
            `;

      case "MISSED":
        return `
          bg-red-500/10
          text-red-600
          border-red-200
        `;

      default:
        return `
                bg-amber-500/10
                text-amber-600
                border-amber-200
            `;
    }
  };

  if (loading) {
    return (
      <div
        className="
            min-h-screen
            flex
            items-center
            justify-center
            bg-[#F8FAFC]
            "
      >
        <div
          className="
                bg-white
                rounded-3xl
                border
                p-10
                text-center
            "
        >
          <p className="mt-2 text-lg text-slate-500">Loading Training Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
            min-h-screen
            bg-[#F8FAFC]
            px-4
            md:px-6
            py-6
            md:py-8
        "
    >
      <div
        className="
            w-full
            ml-0
            mr-auto
            space-y-8
          "
      >
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
              Training Management
            </p>

            <h1
              className="
                  text-4xl
                  md:text-5xl
                  font-black
                "
            >
              Training Hub
            </h1>

            <p
              className="
                    mt-2
                    text-slate-500
                "
            >
              Attendance tracking, compliance registry and training management.
            </p>
          </div>
          <div
            className="
                flex items-center gap-2
                px-4 py-4
                rounded-2xl
                border
                bg-white
                text-sm
                font-bold
                uppercase
                tracking-widest
                "
          >
            <ShieldAlert size={14} />

            {isExecutive ? "Executive Access" : "Operator Access"}
          </div>
        </div>

        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
          gap-6
          "
        >
          <div className="bg-white border rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <p className="text-sm text-slate-500">Total Trainings</p>
            <h2 className="text-3xl md:text-5xl font-black mt-2">{stats.total}</h2>
          </div>

          <div className="bg-white border rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
            <p className="text-sm text-slate-500">Attended</p>
            <h2 className="text-3xl md:text-5xl font-black mt-2">
              {stats.attended}
            </h2>
          </div>

          <div className="bg-white border rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <p className="text-sm text-slate-500">
            Upcoming
          </p>

          <h2 className="text-3xl md:text-5xl font-black text-amber-500 mt-2">
            {stats.upcoming}
          </h2>
          </div>

          <div className="bg-white border rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <p className="text-sm text-slate-500">
            Missed
          </p>

          <h2 className="text-3xl md:text-5xl font-black text-red-500 mt-2">
            {stats.missed}
          </h2>
        </div>
        </div>

        <div
          className="
              w-full
              ml-0
              mr-auto
              space-y-8
            "
        >
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-amber-500" />

            <div
              className="
                flex
                flex-wrap
                items-center
                justify-between
                gap-4
                w-full
              "
            >
              <h2
                className="
                  text-2xl
                  font-black
                "
              >
                My Trainings
              </h2>

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  w-full
                  sm:w-auto
                "
              >
                <button
                  onClick={() => setFilterStatus("ALL")}
                  className={`
                    flex-1
                    sm:flex-none
                    px-4
                    py-2
                    rounded-xl
                    font-bold
                    ${
                      filterStatus === "ALL"
                        ? "bg-amber-500 text-white"
                        : "bg-white border"
                    }
                  `}
                >
                  All
                </button>

                <button
                  onClick={() => setFilterStatus("PENDING")}
                  className={`
                    flex-1
                    sm:flex-none
                    px-4
                    py-2
                    rounded-xl
                    font-bold
                    ${
                      filterStatus === "PENDING"
                        ? "bg-amber-500 text-white"
                        : "bg-white border"
                    }
                  `}
                >
                  Not Joined
                </button>

                <button
                  onClick={() => setFilterStatus("JOINED")}
                  className={`
                    flex-1
                    sm:flex-none
                    px-4
                    py-2
                    rounded-xl
                    font-bold
                    ${
                      filterStatus === "JOINED"
                        ? "bg-amber-500 text-white"
                        : "bg-white border"
                    }
                  `}
                >
                  Joined
                </button>

                <button
                onClick={() => setFilterStatus("MISSED")}
                className={`
                  flex-1
                  sm:flex-none
                  px-4
                  py-2
                  rounded-xl
                  font-bold
                  ${
                    filterStatus === "MISSED"
                      ? "bg-red-500 text-white"
                      : "bg-white border"
                  }
                `}
              >
                Missed
              </button>
              </div>
            </div>
          </div>
          <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          2xl:grid-cols-4
          gap-6
          "
          >
            {trainingHubItems.length === 0 && (
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
                <BookOpen
                  size={40}
                  className="
                    mx-auto
                    text-slate-300
                    mb-4
                  "
                />

                <h3 className="font-bold">No Trainings Found</h3>

                <p className="text-sm text-slate-500 mt-2">
                  No training assigned to your department yet.
                </p>
              </div>
            )}

            {filteredTrainings.map((item) => (
              <div
                key={item.id}
                className="bg-white border rounded-3xl p-5 md:p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div
                  className="
                    flex
                    flex-col
                    h-full
                    gap-4
                  "
                >
                <div
                  className="
                    flex
                    justify-between
                    items-start
                    gap-2
                  "
                >
                    <h3
                      className="
                        font-black
                        text-xl
                        leading-tight
                        break-words
                        flex-1
                      "
                    >{item.name}</h3>

                    <span
                      className={`
                  px-3
                  py-1
                  rounded-full
                  border
                  text-sm
                  font-black
                  ${getAssignedStatusStyle(item.attendanceStatus)}
                `}
                    >
                      {item.attendanceStatus}
                    </span>
                  </div>

                  <div className="space-y-3 text-base">
                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                        w-full
                        sm:w-auto
                      "
                    >
                      <Calendar size={14} />
                      {item.dateString}
                    </div>

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                        w-full
                        sm:w-auto
                      "
                    >
                      <Clock3 size={14} />
                      {item.timeString}
                    </div>

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                        w-full
                        sm:w-auto
                      "
                    >
                      <MapPin size={14} />
                      {item.where}
                    </div>

                    <div
                      className="
                        flex
                        flex-wrap
                        gap-2
                        w-full
                        sm:w-auto
                      "
                    >
                      <User size={14} />
                      {item.pic}
                    </div>
                  </div>

                    <div
                      className="
                        mt-auto
                        border-t
                        pt-4
                      "
                    >
                    <button
                      onClick={() => {
                        if (
                          item.attendanceStatus === "ATTENDED" ||
                          isOverdue(item)
                        ) {
                          return;
                        }

                        registerAndJoinTraining(item);
                      }}

                      disabled={
                        item.attendanceStatus === "ATTENDED" || isOverdue(item)
                      }
                      className={`
                          w-full
                          py-4
                          rounded-2xl
                          font-black

                        ${
                          item.attendanceStatus === "ATTENDED"
                            ? `
                              bg-emerald-100
                              text-emerald-600
                            `
                            : isOverdue(item)
                              ? `
                                bg-red-100
                                text-red-600
                                cursor-not-allowed
                              `
                              : `
                                bg-amber-500
                                hover:bg-amber-400
                                text-slate-950
                              `
                        }
                        `}
                    >
                        {
                      item.attendanceStatus === "ATTENDED"
                        ? "Attendance Submitted"
                        : isOverdue(item)
                          ? "Training Expired"
                          : "Join Training"
                    }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
