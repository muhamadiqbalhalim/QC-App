import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from 'firebase/firestore';

import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock3,
  Eye,
  Search,
  ShieldCheck,
  AlertTriangle,
  Filter,
} from 'lucide-react';

import {
  db,
} from '../config/firebase';

import {
  useTheme,
} from '../context/ThemeContext';

import useSession from '../hooks/useSession';

import {
  TRAINING_STATUS,
} from '../config/constants/status';

import {
  Card,
  Button,
  Badge,
} from '../components/ui';

export default function ReviewForm() {

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const navigate =
    useNavigate();

  const { darkMode } =
    useTheme();

  const { getSession } =
    useSession();

  /**
   * =========================================================
   * USER
   * =========================================================
   */

  const currentUser =
    getSession();

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [
    submissions,
    setSubmissions,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState('');

  const [
    statusFilter,
    setStatusFilter,
  ] = useState('ALL');

  const [
    actionLoading,
    setActionLoading,
  ] = useState(null);

  /**
   * =========================================================
   * FETCH
   * =========================================================
   */

  useEffect(() => {

  if (
    !currentUser?.employeeId
  ) {

    setLoading(false);

    return;

  }

    const fetchSubmissions =
      async () => {

        try {

          setLoading(true);

          const submissionsQuery =
            query(
              collection(
                db,
                'user_progress'
              ),
              where(
                'approvedBy',
                '==',
                currentUser.employeeId
              )
            );

          const snapshot =
            await getDocs(
              submissionsQuery
            );

          const data =
            snapshot.docs.map(
              (document) => ({

                id: document.id,

                ...document.data(),

              })
            );

          data.sort(
            (a, b) =>
              new Date(
                b.updatedAt ||
                b.completedAt
              ) -
              new Date(
                a.updatedAt ||
                a.completedAt
              )
          );

          setSubmissions(data);

        } catch (error) {

          console.error(
            'Review fetch failed:',
            error
          );

        } finally {

          setLoading(false);

        }

      };

    fetchSubmissions();

  }, [currentUser?.employeeId]);

  /**
   * =========================================================
   * FILTERED
   * =========================================================
   */

  const filteredSubmissions =
    useMemo(() => {

      let filtered =
        submissions;

      if (search) {

        const keyword =
          search.toLowerCase();

        filtered =
          filtered.filter(
            (submission) => (

              submission.employeeName
                ?.toLowerCase()
                ?.includes(keyword) ||

              submission.trainingTitle
                ?.toLowerCase()
                ?.includes(keyword) ||

              submission.employeeId
                ?.toLowerCase()
                ?.includes(keyword)

            )
          );

      }

      if (
        statusFilter !==
        'ALL'
      ) {

        filtered =
          filtered.filter(
            (submission) =>
              submission.lifecycleStatus ===
              statusFilter
          );

      }

      return filtered;

    }, [
      submissions,
      search,
      statusFilter,
    ]);

  /**
   * =========================================================
   * APPROVE
   * =========================================================
   */

  const handleApprove =
    async (submissionId) => {

      const confirmed =
        window.confirm(
          'Approve this submission?'
        );

      if (!confirmed) {
        return;
      }

      try {

        setActionLoading(
          submissionId
        );

        const progressRef =
          doc(
            db,
            'user_progress',
            submissionId
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

        setSubmissions(
          (previous) =>
            previous.map(
              (item) => {

                if (
                  item.id !==
                  submissionId
                ) {

                  return item;

                }

                return {

                  ...item,

                  lifecycleStatus:
                    TRAINING_STATUS.APPROVED,

                };

              }
            )
        );

      } catch (error) {

        console.error(
          'Approve failed:',
          error
        );

      } finally {

        setActionLoading(null);

      }

    };

  /**
   * =========================================================
   * REJECT
   * =========================================================
   */

  const handleReject =
    async (submissionId) => {

      const confirmed =
        window.confirm(
          'Reject this submission?'
        );

      if (!confirmed) {
        return;
      }

      try {

        setActionLoading(
          submissionId
        );

        const progressRef =
          doc(
            db,
            'user_progress',
            submissionId
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

        setSubmissions(
          (previous) =>
            previous.map(
              (item) => {

                if (
                  item.id !==
                  submissionId
                ) {

                  return item;

                }

                return {

                  ...item,

                  lifecycleStatus:
                    TRAINING_STATUS.REJECTED,

                };

              }
            )
        );

      } catch (error) {

        console.error(
          'Reject failed:',
          error
        );

      } finally {

        setActionLoading(null);

      }

    };

  /**
   * =========================================================
   * STATUS
   * =========================================================
   */

  const getStatusVariant =
    (status) => {

      switch (status) {

        case
          TRAINING_STATUS.APPROVED:

          return 'success';

        case
          TRAINING_STATUS.REJECTED:

          return 'danger';

        default:

          return 'warning';

      }

    };

  const getStatusLabel =
    (status) => {

      switch (status) {

        case
          TRAINING_STATUS.APPROVED:

          return 'Approved';

        case
          TRAINING_STATUS.REJECTED:

          return 'Rejected';

        default:

          return 'Pending';

      }

    };

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
            Loading submissions...
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
        sm:px-6
        sm:py-6
        lg:px-8
        lg:py-8
        space-y-6
        ${styles.page}
      `}
    >

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-5
          xl:flex-row
          xl:items-center
          xl:justify-between
        "
      >

        {/* LEFT */}
        <div>

          <div className="flex items-center gap-2 mb-3">

            <ShieldCheck
              size={16}
              className="text-amber-500"
            />

            <p
              className="
                text-sm
                font-bold
                text-amber-500
              "
            >
              Executive Review Center
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
            Review Submission
          </h1>

        </div>

        {/* RIGHT */}
        <div
          className="
            flex
            flex-col
            sm:flex-row
            gap-3
            w-full
            xl:w-auto
          "
        >

          {/* SEARCH */}
          <Card
            darkMode={darkMode}
            padding="sm"
            className="
              flex
              items-center
              gap-3
              w-full
              sm:min-w-[320px]
            "
          >

            <Search
              className="
                w-5
                h-5
                opacity-50
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search employee or training..."
              className="
                bg-transparent
                outline-none
                w-full
                text-sm
              "
            />

          </Card>

          {/* FILTER */}
          <Card
            darkMode={darkMode}
            padding="sm"
            className="
              flex
              items-center
              gap-3
            "
          >

            <Filter
              size={18}
              className="opacity-60"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="
                bg-transparent
                outline-none
                text-sm
                font-semibold
              "
            >

              <option value="ALL">
                All
              </option>

              <option
                value={
                  TRAINING_STATUS.SUBMITTED
                }
              >
                Pending
              </option>

              <option
                value={
                  TRAINING_STATUS.APPROVED
                }
              >
                Approved
              </option>

              <option
                value={
                  TRAINING_STATUS.REJECTED
                }
              >
                Rejected
              </option>

            </select>

          </Card>

        </div>

      </div>

      {/* ================================================= */}
      {/* EMPTY */}
      {/* ================================================= */}

      {!filteredSubmissions.length && (

        <Card
          darkMode={darkMode}
          className="
            text-center
            py-12
          "
        >

          <ShieldCheck
            size={42}
            className="
              mx-auto
              mb-5
              text-emerald-500
            "
          />

          <h2
            className="
              text-2xl
              font-black
              mb-3
            "
          >
            No Submission Found
          </h2>

          <p className="text-sm opacity-60">
            No operator submissions match the current filter.
          </p>

        </Card>

      )}

      {/* ================================================= */}
      {/* LIST */}
      {/* ================================================= */}

      <div className="space-y-5">

        {filteredSubmissions.map(
          (submission) => {

            const failCount =
              submission
                ?.inspectionSummary
                ?.failed || 0;

            const passCount =
              submission
                ?.inspectionSummary
                ?.passed || 0;

            return (

              <Card
                key={submission.id}
                darkMode={darkMode}
                hover
              >

                {/* TOP */}
                <div
                  className="
                    flex
                    flex-col
                    gap-6
                    xl:flex-row
                    xl:items-start
                    xl:justify-between
                  "
                >

                  {/* LEFT */}
                  <div className="space-y-5 flex-1">

                    {/* EMPLOYEE */}
                    <div>

                      <p
                        className="
                          text-xs
                          font-semibold
                          opacity-50
                          mb-2
                        "
                      >
                        Employee
                      </p>

                      <h2
                        className="
                          text-2xl
                          sm:text-3xl
                          font-black
                          break-words
                        "
                      >
                        {
                          submission.employeeName
                        }
                      </h2>

                      <p className="opacity-60 mt-2">
                        ID:
                        {' '}
                        {
                          submission.employeeId
                        }
                      </p>

                    </div>

                    {/* TRAINING */}
                    <div>

                      <p
                        className="
                          text-xs
                          font-semibold
                          opacity-50
                          mb-2
                        "
                      >
                        Training
                      </p>

                      <p
                        className="
                          text-lg
                          font-bold
                          leading-7
                        "
                      >
                        {
                          submission.trainingTitle
                        }
                      </p>

                    </div>

                    {/* SUMMARY */}
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        gap-3
                      "
                    >

                      <Badge
                        variant="success"
                        size="lg"
                      >

                        PASS:
                        {' '}
                        {passCount}

                      </Badge>

                      <Badge
                        variant={
                          failCount > 0
                            ? 'danger'
                            : 'default'
                        }
                        size="lg"
                      >

                        FAIL:
                        {' '}
                        {failCount}

                      </Badge>

                      {failCount > 0 && (

                        <Badge
                          variant="danger"
                          size="lg"
                        >

                          <div className="flex items-center gap-2">

                            <AlertTriangle
                              size={14}
                            />

                            Attention Required

                          </div>

                        </Badge>

                      )}

                    </div>

                  </div>

                  {/* RIGHT */}
                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      w-full
                      xl:w-auto
                    "
                  >

                    {/* STATUS */}
                    <Badge
                      variant={
                        getStatusVariant(
                          submission.lifecycleStatus
                        )
                      }
                      size="lg"
                      className="
                        w-full
                        xl:w-auto
                        min-h-[52px]
                      "
                    >

                      {
                        getStatusLabel(
                          submission.lifecycleStatus
                        )
                      }

                    </Badge>

                    {/* REVIEW */}
                    <Button
                      variant="info"
                      size="lg"
                      icon={Eye}
                      onClick={() =>
                        navigate(
                          `/review/${submission.id}`
                        )
                      }
                    >

                      Review Submission

                    </Button>

                    {/* ACTIONS */}
                    {submission.lifecycleStatus ===
                      TRAINING_STATUS.SUBMITTED && (

                      <div
                        className="
                          grid
                          grid-cols-1
                          sm:grid-cols-2
                          gap-3
                        "
                      >

                        <Button
                          variant="success"
                          size="md"
                          icon={CheckCircle2}
                          loading={
                            actionLoading ===
                            submission.id
                          }
                          onClick={() =>
                            handleApprove(
                              submission.id
                            )
                          }
                        >

                          Approve

                        </Button>

                        <Button
                          variant="danger"
                          size="md"
                          icon={XCircle}
                          loading={
                            actionLoading ===
                            submission.id
                          }
                          onClick={() =>
                            handleReject(
                              submission.id
                            )
                          }
                        >

                          Reject

                        </Button>

                      </div>

                    )}

                  </div>

                </div>

                {/* FOOTER */}
                <div
                  className="
                    mt-6
                    pt-5
                    border-t
                    border-white/10
                    flex
                    flex-wrap
                    items-center
                    gap-5
                    text-sm
                    opacity-60
                  "
                >

                  <div className="flex items-center gap-2">

                    <Clock3
                      size={15}
                    />

                    Submitted:
                    {' '}
                    {new Date(
                      submission.completedAt
                    ).toLocaleString()}

                  </div>

                  <div className="flex items-center gap-2">

                    <FileText
                      size={15}
                    />

                    {
                      submission.trainingId
                    }

                  </div>

                </div>

              </Card>

            );

          }
        )}

      </div>

    </div>

  );

}