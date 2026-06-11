import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../config/firebase';

import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import { storage }
from '../config/firebase';

import {
  STORAGE_KEYS,
} from '../config/constants/storageKeys';

export default function TrainingAttendance() {

  const currentUser =
    useMemo(
      () =>
        JSON.parse(
          localStorage.getItem(
            STORAGE_KEYS.SESSION
          ) || '{}'
        ),
      []
    );

    const [loading, setLoading] =
        useState(true);

    const [registrations, setRegistrations] =
        useState([]);

    const [attendance, setAttendance] =
        useState([]);

    const [selectedTraining, setSelectedTraining] =
  useState(null);

    const [proofImage, setProofImage] =
    useState(null);

    const [submitting, setSubmitting] =
    useState(false);

  const proofPreviewUrl =
    useMemo(
      () =>
        proofImage
          ? URL.createObjectURL(
              proofImage
            )
          : '',
      [
        proofImage,
      ]
    );

  useEffect(() => {

    return () => {

      if (proofPreviewUrl) {

        URL.revokeObjectURL(
          proofPreviewUrl
        );

      }

    };

  }, [proofPreviewUrl]);

  useEffect(() => {

    const loadData =
      async () => {

        try {

          setLoading(true);

          const registrationSnapshot =
            await getDocs(
              query(
                collection(
                  db,
                  'training_registrations'
                ),
                where(
                  'staffId',
                  '==',
                  String(
                    currentUser.employeeId
                  )
                )
              )
            );

          const attendanceSnapshot =
            await getDocs(
              query(
                collection(
                  db,
                  'training_attendance'
                ),
                where(
                  'staffId',
                  '==',
                  String(
                    currentUser.employeeId
                  )
                )
              )
            );
            console.log(
              "Current Employee:",
              currentUser.employeeId
            );

            console.log(
              "Registration Snapshot:",
              registrationSnapshot
            );

            console.log(
              "Attendance Snapshot:",
              attendanceSnapshot
            );

            console.log(
              "Registrations:",
              registrationSnapshot.docs.map(
                doc => doc.data()
              )
            );

          setRegistrations(
            registrationSnapshot.docs.map(
              doc => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );

          setAttendance(
            attendanceSnapshot.docs.map(
              doc => ({
                id: doc.id,
                ...doc.data(),
              })
            )
          );

        } catch (error) {

          console.error(
            'Failed loading attendance:',
            error
          );

        } finally {

          setLoading(false);

        }

      };

    if (
      currentUser?.employeeId
    ) {

      loadData();

    }

  }, [currentUser]);

  const hasAttendance =
    (trainingId) => {

      return attendance.some(
        item =>
          item.trainingId ===
          trainingId
      );

    };

    const submitAttendance =
    async () => {

        if (!selectedTraining) {

        alert(
            'Please select training.'
        );

        return;

        }

        if (
        hasAttendance(
            selectedTraining.trainingId
        )
        ) {

        alert(
            'Attendance already submitted.'
        );

        return;

        }
        try {

        if (!selectedTraining) {

            alert(
            'Please select training.'
            );

            return;

        }

        if (!proofImage) {

            alert(
            'Please upload attendance photo.'
            );

            return;

        }

        if (
          proofImage.size >
          5 * 1024 * 1024
        ) {

          alert(
            'Attendance photo must be 5MB or smaller.'
          );

          return;

        }

        if (
          !proofImage.type.startsWith(
            'image/'
          )
        ) {

          alert(
            'Please upload a valid image file.'
          );

          return;

        }

        setSubmitting(true);

        const imageRef =
            ref(
            storage,
            `training_proofs/${currentUser.employeeId}_${selectedTraining.trainingId}_${Date.now()}`
            );

        await uploadBytes(
            imageRef,
            proofImage
        );

        const proofImageUrl =
            await getDownloadURL(
            imageRef
            );

        await addDoc(
            collection(
            db,
            'training_attendance'
            ),
            {

            department:
                currentUser.department,

            fullName:
                currentUser.name,

            staffId:
                String(
                currentUser.employeeId
                ),

            trainingDate:
                selectedTraining.trainingDate,

            trainingId:
                selectedTraining.trainingId,

            trainingName:
                selectedTraining.trainingName,

            proofImageUrl,

            attendanceStatus:
                'ATTENDED',

            type:
                'TrainingAttendance',

            userId:
                currentUser.userId,

            submittedDate:
                new Date().toLocaleString(),

            timestamp:
                serverTimestamp(),

            }
        );

        alert(
            'Attendance submitted successfully.'
        );

        window.location.reload();

        } catch (error) {

        console.error(error);

        alert(
            'Failed to submit attendance.'
        );

        } finally {

        setSubmitting(false);

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
        "
      >
        Loading Attendance...
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
      "
    >

      <div
        className="
          max-w-7xl
          mx-auto
          space-y-6
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
              mb-2
            "
          >
            Training Attendance
          </p>

          <h1
            className="
              text-3xl
              md:text-4xl
              font-black
            "
          >
            Attendance Hub
          </h1>

          <p
            className="
              text-slate-500
              mt-2
            "
          >
            Submit attendance for
            your registered trainings.
          </p>

        </div>

        {registrations.length === 0 && (

          <div
            className="
              bg-white
              border
              rounded-3xl
              p-10
              text-center
            "
          >

            <h3
              className="
                text-lg
                font-bold
              "
            >
              No Training Registrations
            </h3>

            <p
              className="
                text-sm
                text-slate-500
                mt-2
              "
            >
              You have not registered
              for any training yet.
            </p>

          </div>

        )}

        <div
        className="
            max-w-4xl
            mx-auto
            bg-white
            border
            rounded-3xl
            p-8
            shadow-sm
        "
        >

        <h2
            className="
            text-3xl
            font-black
            text-center
            mb-8
            "
        >
            Confirm Attendance
        </h2>

        <div
            className="
            grid
            md:grid-cols-2
            gap-5
            "
        >

            <input
            value={
                currentUser.name || ''
            }
            disabled
            className="
                p-4
                rounded-2xl
                bg-slate-100
            "
            />

            <input
            value={
                currentUser.employeeId || ''
            }
            disabled
            className="
                p-4
                rounded-2xl
                bg-slate-100
            "
            />

        </div>

        <select
            value={
            selectedTraining?.trainingId || ''
            }
            onChange={(e) => {

            const selected =
                registrations.find(
                item =>
                    item.trainingId ===
                    e.target.value
                );

            setSelectedTraining(
                selected
            );

            }}
            className="
            w-full
            mt-5
            p-4
            rounded-2xl
            border
            "
        >
            <option value="">
            Select Training Session
            </option>

            {registrations.map(
            item => (

                <option
                key={item.trainingId}
                value={item.trainingId}
                >
                {item.trainingName}
                </option>

            )
            )}

        </select>

        {selectedTraining && (

            <input
                value={
                selectedTraining.trainingDate || ''
                }
                disabled
                className="
                w-full
                mt-4
                p-4
                rounded-2xl
                bg-slate-100
                "
            />

            )}

        <div className="mt-5">

            <input
            type="file"
            accept="image/*"
            onChange={(e) =>
                setProofImage(
                e.target.files[0]
                )
            }
            />

        </div>

        {proofImage && (

            <img
            src={proofPreviewUrl}
            alt="Attendance Proof"
            className="
                mt-4
                w-full
                h-64
                rounded-2xl
                object-cover
                border
            "
            />
        )}

        <button
            onClick={submitAttendance}
            disabled={submitting}
            className="
            mt-6
            w-full
            bg-emerald-500
            hover:bg-emerald-600
            text-white
            py-4
            rounded-2xl
            font-black
            "
        >

            {
            submitting
                ? 'Submitting...'
                : 'Check In'
            }

        </button>

        </div>

        </div>

      </div>

  );

}
