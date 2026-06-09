import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';

import {
  Calendar,
  Clock3,
  MapPin,
  User,
  ArrowUpRight,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';

import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import {
  STORAGE_KEYS,
} from '../config/constants/storageKeys';

export default function MyTrainings({
  user: propUser,
}) {

  const navigate =
    useNavigate();

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

  const [loading, setLoading] =
    useState(true);

  const [assignedTrainings, setAssignedTrainings] =
    useState([]);

  const [attendance, setAttendance] =
    useState([]);


  const [filterStatus, setFilterStatus] =
    useState('ALL');

  useEffect(() => {

    if (
      !currentUser?.employeeId
    ) {

      setLoading(false);
      return;

    }

    const loadData =
      async () => {

        try {

          setLoading(true);

          const requests = [];

          if (
            currentUser?.department
          ) {

            requests.push(

          getDocs(
            collection(
              db,
              'trainings'
            )
          )

            );

          } else {

            requests.push(
              Promise.resolve(null)
            );

          }

          requests.push(

            getDocs(
              collection(
                db,
                'training_attendance'
              )
            )

          );

          const [

            trainingSnapshot,

            attendanceSnapshot,

          ] = await Promise.all(
            requests
          );

          if (
            trainingSnapshot
          ) {

            const trainingList =
              trainingSnapshot.docs
                .map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }))
                .filter((training) => {

                  const departments =
                    training.allowedDepartments || [];

                  return (
                    departments.includes(
                      currentUser.department
                    ) ||
                    departments.includes('ALL')
                  );

                });

            setAssignedTrainings(
              trainingList
            );

          }

          const attendanceList =
            attendanceSnapshot.docs.map(
              (doc) => ({

                id: doc.id,

                ...doc.data(),

              })
            );

          setAttendance(
            attendanceList
          );


        } catch (error) {

          console.error(
            'Failed loading trainings:',
            error
          );

        } finally {

          setLoading(false);

        }

      };

    loadData();

  }, [currentUser]);

    const trainingHubItems =
      useMemo(() => {

        const employeeId =
          String(
            currentUser.employeeId || ''
          );

        const items =
          assignedTrainings.map(
            (training) => {

              const attended =
                attendance.find(
                  (record) =>
                    String(
                      record.staffId
                    ) === employeeId &&
                    record.trainingName ===
                    training.name
                );

              return {

                ...training,

                attendanceStatus:
                  attended
                    ? 'ATTENDED'
                    : 'PENDING',

              };

            }
          );

        items.sort(
          (a, b) => {

            if (
              a.attendanceStatus ===
                'PENDING' &&
              b.attendanceStatus ===
                'ATTENDED'
            ) {
              return -1;
            }

            if (
              a.attendanceStatus ===
                'ATTENDED' &&
              b.attendanceStatus ===
                'PENDING'
            ) {
              return 1;
            }

            return (
              new Date(
                b.dateString
              ) -
              new Date(
                a.dateString
              )
            );

          }
        );

        return items;

      }, [
        assignedTrainings,
        attendance,
        currentUser,
      ]);

    const filteredTrainings =
      useMemo(() => {

        if (
          filterStatus === 'JOINED'
        ) {

          return trainingHubItems.filter(
            item =>
              item.attendanceStatus ===
              'ATTENDED'
          );

        }

        if (
          filterStatus === 'PENDING'
        ) {

          return trainingHubItems.filter(
            item =>
              item.attendanceStatus ===
              'PENDING'
          );

        }

        return trainingHubItems;

      }, [
        trainingHubItems,
        filterStatus,
      ]);

  const stats =
    useMemo(() => ({

      total:
        trainingHubItems.length,

      attended:
        trainingHubItems.filter(
          item =>
            item.attendanceStatus ===
            'ATTENDED'
        ).length,

      pending:
        trainingHubItems.filter(
          item =>
            item.attendanceStatus ===
            'PENDING'
        ).length,

    }), [
      trainingHubItems
    ]);

  const isExecutive =
    currentUser?.role ===
    'EXECUTIVE';

  const getAssignedStatusStyle =
    (status) => {

      switch (status) {

        case 'ATTENDED':

          return `
                bg-emerald-500/10
                text-emerald-600
                border-emerald-200
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
          <p className="mt-2 text-lg text-slate-500">
            Loading Training Hub...
          </p>

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
              Attendance tracking,
              compliance registry and
              training management.
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

            {isExecutive
              ? 'Executive Access'
              : 'Operator Access'}
          </div>
          </div>

            <div
              className="
              grid
              grid-cols-[repeat(auto-fill,minmax(320px,1fr))]
              gap-6
              "
            >
            <div className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <p className="text-sm text-slate-500">
                Total Trainings
              </p>
              <h2 className="text-5xl font-black mt-2">
                {stats.total}
              </h2>
            </div>

            <div className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <p className="text-sm text-slate-500">
                Attended
              </p>
              <h2 className="text-5xl font-black text-emerald-500 mt-2">
                {stats.attended}
              </h2>
            </div>

            <div className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <p className="text-sm text-slate-500">
                Pending
              </p>
              <h2 className="text-5xl font-black text-amber-500 mt-2">
                {stats.pending}
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

              <BookOpen
                size={20}
                className="text-amber-500"
              />

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
                  gap-2
                "
              >

                <button
                  onClick={() =>
                    setFilterStatus(
                      'ALL'
                    )
                  }
                  className={`
                    px-4
                    py-2
                    rounded-xl
                    font-bold
                    ${
                      filterStatus ===
                      'ALL'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border'
                    }
                  `}
                >
                  All
                </button>

                <button
                  onClick={() =>
                    setFilterStatus(
                      'PENDING'
                    )
                  }
                  className={`
                    px-4
                    py-2
                    rounded-xl
                    font-bold
                    ${
                      filterStatus ===
                      'PENDING'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border'
                    }
                  `}
                >
                  Not Joined
                </button>

                <button
                  onClick={() =>
                    setFilterStatus(
                      'JOINED'
                    )
                  }
                  className={`
                    px-4
                    py-2
                    rounded-xl
                    font-bold
                    ${
                      filterStatus ===
                      'JOINED'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white border'
                    }
                  `}
                >
                  Joined
                </button>

              </div>

            </div>

            </div>
            <div
              className="
              grid
              grid-cols-[repeat(auto-fill,minmax(320px,1fr))]
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

                  <h3 className="font-bold">
                    No Trainings Found
                  </h3>

                  <p className="text-sm text-slate-500 mt-2">
                    No training assigned to your department yet.
                  </p>
                </div>
              )}


              {filteredTrainings.map(
                (item) => (
                  <div
                    key={item.id}
                    className="bg-white border rounded-3xl p-8 shadow-sm hover:shadow-lg transition-all duration-300"
                  >

                    <div className="space-y-4">

                      <div
                        className="
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-3
                    "
                      >

                        <h3 className="font-black text-2xl">
                          {item.name}
                        </h3>

                        <span
                          className={`
                  px-3
                  py-1
                  rounded-full
                  border
                  text-sm
                  font-black
                  ${getAssignedStatusStyle(
                            item.attendanceStatus
                          )}
                `}
                        >
                          {item.attendanceStatus}
                        </span>

                      </div>

                      <div className="space-y-3 text-base">

                        <div className="flex gap-2">
                          <Calendar size={14} />
                          {item.dateString}
                        </div>

                        <div className="flex gap-2">
                          <Clock3 size={14} />
                          {item.timeString}
                        </div>

                        <div className="flex gap-2">
                          <MapPin size={14} />
                          {item.where}
                        </div>

                        <div className="flex gap-2">
                          <User size={14} />
                          {item.pic}
                        </div>

                      </div>

                      <div
                      className="
                        border-t
                        pt-4
                      "
                    >

                      <button
                        onClick={() => {

                          if (
                            item.attendanceStatus ===
                            'ATTENDED'
                          ) {

                            return;

                          }

                          navigate(
                            '/training-attendance'
                          );

                        }}
                        disabled={
                          item.attendanceStatus ===
                          'ATTENDED'
                        }
                        className={`
                          w-full
                          py-4
                          rounded-2xl
                          font-black

                          ${
                            item.attendanceStatus ===
                            'ATTENDED'
                              ? `
                                bg-emerald-100
                                text-emerald-600
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
                          item.attendanceStatus ===
                          'ATTENDED'
                            ? 'Attendance Submitted'
                            : 'Join Training'
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
