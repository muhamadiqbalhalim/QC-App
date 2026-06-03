import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import {
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react';

import {
  db,
} from '../config/firebase';

import {
  FORM_REGISTRY,
} from '../config/FormRegistry';

import {
  TRAINING_STATUS,
} from '../config/constants/status';

import {
  Card,
  Button,
  Badge,
} from '../components/ui';

export default function ReviewSubmission() {

  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const navigate =
    useNavigate();

  const { submissionId } =
    useParams();
  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [
    submission,
    setSubmission,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  /**
   * =========================================================
   * FETCH
   * =========================================================
   */

  useEffect(() => {

  if (!submissionId) {
    setLoading(false);
    return;
  }

    const fetchSubmission =
      async () => {

        try {

          setLoading(true);

          const submissionRef =
            doc(
              db,
              'user_progress',
              submissionId
            );

          const snapshot =
            await getDoc(
              submissionRef
            );

          if (
            snapshot.exists()
          ) {

            setSubmission({

              id:
                snapshot.id,

              ...snapshot.data(),

            });

          }

        } catch (error) {

          console.error(
            'Submission fetch failed:',
            error
          );

        } finally {

          setLoading(false);

        }

      };

    fetchSubmission();

  }, [submissionId]);

  /**
   * =========================================================
   * TRAINING CONFIG
   * =========================================================
   */

  const trainingConfig =
    useMemo(() => {

      if (!submission) {
        return null;
      }

      return FORM_REGISTRY[
        submission.trainingId
      ];

    }, [submission]);

  /**
   * =========================================================
   * APPROVE
   * =========================================================
   */

 const handleApprove =
  async () => {

    const confirmed =
      window.confirm(
        'Approve this submission?'
      );

    if (!confirmed) {
      return;
    }

    try {

      setActionLoading(true);

      const approvedAt =
        new Date().toISOString();

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

          approvedAt,

          rejectionReason:
            null,

          rejectedAt:
            null,

          updatedAt:
            approvedAt,
        }
      );

      setSubmission(
        (previous) => ({

          ...previous,

          lifecycleStatus:
            TRAINING_STATUS.APPROVED,

          approvedAt,

          rejectionReason:
            null,

          rejectedAt:
            null,

        })
      );

    } catch (error) {

      console.error(
        'Approve failed:',
        error
      );

    } finally {

      setActionLoading(false);

    }

  };

/**
 * =========================================================
 * REJECT
 * =========================================================
 */

const handleReject =
  async () => {

    const confirmed =
      window.confirm(
        'Reject this submission?'
      );

    if (!confirmed) {
      return;
    }

    const reason =
      window.prompt(
        'Enter rejection reason:'
      );

    if (
      !reason ||
      !reason.trim()
    ) {
      return;
    }

    try {

      setActionLoading(true);

      const rejectedAt =
        new Date().toISOString();

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

          rejectionReason:
            reason.trim(),

          rejectedAt,

          updatedAt:
            rejectedAt,
        }
      );

      setSubmission(
        (previous) => ({

          ...previous,

          lifecycleStatus:
            TRAINING_STATUS.REJECTED,

          rejectionReason:
            reason.trim(),

          rejectedAt,

        })
      );

    } catch (error) {

      console.error(
        'Reject failed:',
        error
      );

    } finally {

      setActionLoading(false);

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

          return 'Pending Review';

      }

    };

  /**
   * =========================================================
   * FAILED
   * =========================================================
   */

  const failedInspectionCount =
    submission
      ?.inspectionSummary
      ?.failed || 0;

  const completionRate =
    submission?.inspectionSummary?.total
      ? Math.round(
          (
            submission.inspectionSummary.passed /
            submission.inspectionSummary.total
          ) * 100
        )
      : 0;
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
          bg-[#F8FAFC]
          text-slate-900
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
            Loading submission...
          </p>

        </div>

      </div>

    );

  }

  /**
   * =========================================================
   * NOT FOUND
   * =========================================================
   */

  if (!submission) {

    return (

      <div
        className={`
          min-h-screen
          flex
          items-center
          justify-center
          px-5
          bg-[#F8FAFC]
          text-slate-900
        `}
      >

        <div className="text-center">

          <h1
            className="
              text-3xl
              font-black
              mb-3
            "
          >
            Submission Not Found
          </h1>

          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              navigate(
                '/review-form'
              )
            }
          >

            Back

          </Button>

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
        pb-32
        sm:px-6
        sm:py-6
        lg:px-8
        lg:py-8
        space-y-5
        sm:space-y-6
        bg-[#F8FAFC]
        text-slate-900
      `}
    >

      {/* ================================================= */}
      {/* TOP */}
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
        <div className="min-w-0">

          <button
            onClick={() =>
              navigate(
                '/review-form'
              )
            }
            className="
              flex
              items-center
              gap-2
              text-sm
              font-bold
              opacity-60
              hover:opacity-100
              transition-all
              mb-5
            "
          >

            <ArrowLeft size={16} />

            Back to Review Queue

          </button>

          <div className="flex items-center gap-2 mb-3">

            <ClipboardCheck
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
              Executive Review
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
            {
              submission.trainingTitle
            }
          </h1>

        </div>

        {/* STATUS */}
        <Badge
          variant={
            getStatusVariant(
              submission.lifecycleStatus
            )
          }
          size="lg"
          className="
            min-h-[56px]
            px-6
          "
        >

          {
            getStatusLabel(
              submission.lifecycleStatus
            )
          }

        </Badge>

      </div>

      {/* ================================================= */}
      {/* ALERT */}
      {/* ================================================= */}

      {failedInspectionCount > 0 && (

        <Card
          
          className="
            border-red-500/20
            bg-red-500/10
            text-red-500
          "
        >

          <div className="flex items-start gap-4">

            <AlertTriangle
              size={24}
              className="shrink-0"
            />

            <div>

              <h2
                className="
                  text-xl
                  font-black
                  mb-2
                "
              >
                Failed Inspection Detected
              </h2>

              <p className="text-sm opacity-90">

                This submission contains
                {' '}
                <span className="font-black">
                  {
                    failedInspectionCount
                  }
                </span>
                {' '}
                failed inspection item(s).

              </p>

            </div>

          </div>

        </Card>

      )}

      {/* ================================================= */}
      {/* EMPLOYEE */}
      {/* ================================================= */}

      <Card >

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-5
            gap-5
          "
        >

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
                font-black
                break-words
              "
            >
              {
                submission.employeeName
              }
            </h2>

          </div>

          <div>

            <p
              className="
                text-xs
                font-semibold
                opacity-50
                mb-2
              "
            >
              Employee ID
            </p>

            <h2 className="font-bold text-lg">
              {
                submission.employeeId
              }
            </h2>

          </div>

          <div>

            <p
              className="
                text-xs
                font-semibold
                opacity-50
                mb-2
              "
            >
              Department
            </p>

            <h2 className="font-bold text-lg">
              {
                submission.department
              }
            </h2>

          </div>
          <div>

          <p
            className="
              text-xs
              font-semibold
              opacity-50
              mb-2
            "
          >
            Assigned Executive
          </p>

          <h2 className="font-bold text-lg">
            {submission.approvedByName || 'N/A'}
          </h2>

          <p className="opacity-60">
            ID: {submission.approvedBy}
          </p>

        </div>

        <div>

          <p
            className="
              text-xs
              font-semibold
              opacity-50
              mb-2
            "
          >
            Submitted
          </p>

          <h2 className="font-bold text-base leading-7">
            {new Date(
              submission.completedAt
            ).toLocaleString()}
          </h2>

        </div>

        </div>

      </Card>

      <Card>

        <p
          className="
            text-xs
            font-semibold
            opacity-50
            mb-3
          "
        >
          Workflow Status
        </p>

        <div className="space-y-2">

          <p>
            Status:
            {' '}
            {getStatusLabel(
              submission.lifecycleStatus
            )}
          </p>

          {submission.approvedAt && (

            <p>
              Approved:
              {' '}
              {new Date(
                submission.approvedAt
              ).toLocaleString()}
            </p>

          )}

          {submission.rejectedAt && (

            <p>
              Rejected:
              {' '}
              {new Date(
                submission.rejectedAt
              ).toLocaleString()}
            </p>

          )}
          {submission.rejectionReason && (

            <div className="pt-2">

              <p
                className="
                  text-xs
                  font-semibold
                  opacity-50
                  mb-1
                "
              >
                Rejection Reason
              </p>

              <p
                className="
                  text-red-600
                  font-medium
                "
              >
                {submission.rejectionReason}
              </p>

            </div>

          )}
        </div>

      </Card>

      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

      <div
        className="
          grid
          grid-cols-2
          xl:grid-cols-4
          gap-4
        "
      >

        <Card
          
          hover
        >

          <p
            className="
              text-xs
              font-semibold
              opacity-50
              mb-4
            "
          >
            Total Inspections
          </p>

          <h2
            className="
              text-3xl
              sm:text-4xl
              font-black
            "
          >
            {
              submission
                ?.inspectionSummary
                ?.total || 0
            }
          </h2>

        </Card>

        <Card
          
          hover
        >

          <p
            className="
              text-xs
              font-semibold
              opacity-50
              mb-4
            "
          >
            PASS
          </p>

          <h2
            className="
              text-3xl
              sm:text-4xl
              font-black
              text-emerald-500
            "
          >
            {
              submission
                ?.inspectionSummary
                ?.passed || 0
            }
          </h2>

        </Card>

        <Card
          
          hover
          className="
            border-red-500/20
            bg-red-500/[0.03]
          "
        >

          <p
            className="
              text-xs
              font-semibold
              opacity-50
              mb-4
            "
          >
            FAIL
          </p>

          <h2
            className="
            text-3xl
            sm:text-4xl
            font-black
            text-red-500
            "
          >
            {
              submission
                ?.inspectionSummary
                ?.failed || 0
            }
          </h2>

        </Card>

        <Card hover>

        <p
          className="
            text-xs
            font-semibold
            opacity-50
            mb-4
          "
        >
          Completion
        </p>

        <h2
          className="
            text-3xl
            sm:text-4xl
            font-black
            text-blue-500
          "
        >
          {completionRate}%
        </h2>

      </Card>

      </div>

      {/* ================================================= */}
      {/* RESULTS */}
      {/* ================================================= */}

      <Card
        
        className="space-y-8"
      >

        {/* HEADER */}
        <div>

          <div className="flex items-center gap-2 mb-3">

            <ClipboardCheck
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
              Inspection Results
            </p>

          </div>

          <h2
            className="
              text-2xl
              sm:text-3xl
              font-black
            "
          >
            Submitted Inspection Audit
          </h2>

        </div>

        {/* SECTIONS */}
        {trainingConfig?.tabs?.map(
          (tab) => {

            const sectionData =
              submission.answers?.[
                tab
              ];

            const inspectionRows =
              trainingConfig
                ?.dataSources?.[
                  tab
                ]?.rows || [];

            const sectionFailCount =
              inspectionRows.filter(
                (row) =>
                  sectionData?.[
                    row.id
                  ]?.insp === 'FAIL'
              ).length;

            return (

              <div
                key={tab}
                className="
                  space-y-5
                "
              >

                {/* SECTION HEADER */}
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

                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        opacity-50
                        mb-2
                      "
                    >
                      Inspection Section
                    </p>

                    <h3
                      className="
                        text-2xl
                        font-black
                      "
                    >
                      {tab}
                    </h3>

                  </div>

                  <div className="flex flex-wrap gap-2">

                  <Badge
                    variant="warning"
                    size="lg"
                  >
                    {inspectionRows.length}
                    {' '}
                    Items
                  </Badge>

                  {sectionFailCount > 0 && (

                    <Badge
                      variant="danger"
                      size="lg"
                    >
                      {sectionFailCount}
                      {' '}
                      Failed
                    </Badge>

                  )}

                </div>

                </div>

                {/* ITEMS */}
                <div className="space-y-4">

                  {inspectionRows.map(
                    (item) => {

                      const result =
                        sectionData?.[
                          item.id
                        ]?.insp;

                      const isPass =
                        result ===
                        'PASS';

                      return (

                        <Card
                          key={item.id}
                          
                          hover
                          className={`
                            ${
                              isPass
                                ? `
                                  border-emerald-500/10
                                  bg-emerald-500/[0.03]
                                `
                                : `
                                  border-red-500/20
                                  bg-red-500/[0.03]
                                `
                            }
                          `}
                        >

                          <div
                            className="
                              flex
                              flex-col
                              xl:flex-row
                              xl:items-start
                              xl:justify-between
                              gap-5
                            "
                          >

                            {/* LEFT */}
                            <div className="space-y-4 flex-1">

                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-3
                                "
                              >

                                <Badge
                                  variant="default"
                                  size="md"
                                >

                                  {item.id}

                                </Badge>

                                <Badge
                                  variant={
                                    isPass
                                      ? 'success'
                                      : 'danger'
                                  }
                                  size="md"
                                >

                                  {result ||
                                    'NO RESULT'}

                                </Badge>

                              </div>

                              <div>

                                <h4
                                  className="
                                    text-lg
                                    sm:text-xl
                                    font-black
                                    leading-8
                                    break-words
                                  "
                                >
                                  {
                                    item.item ||
                                    item.inspectionItem
                                  }
                                </h4>

                                {item.criteria && (

                                  <p
                                    className="
                                      mt-3
                                      text-sm
                                      opacity-70
                                      leading-7
                                    "
                                  >
                                    {
                                      item.criteria
                                    }
                                  </p>

                                )}

                              </div>

                              {(item.method ||
                                item.keyPoint) && (

                                <div
                                  className="
                                    flex
                                    flex-col
                                    gap-4
                                  "
                                >

                                  {item.method && (

                                    <div>

                                      <p
                                        className="
                                          text-xs
                                          font-bold
                                          opacity-50
                                          mb-1
                                        "
                                      >
                                        Method
                                      </p>

                                      <p
                                        className="
                                          text-sm
                                          leading-7
                                          opacity-80
                                        "
                                      >
                                        {
                                          item.method
                                        }
                                      </p>

                                    </div>

                                  )}

                                  {item.keyPoint && (

                                    <div>

                                      <p
                                        className="
                                          text-xs
                                          font-bold
                                          opacity-50
                                          mb-1
                                        "
                                      >
                                        Key Point
                                      </p>

                                      <p
                                        className="
                                          text-sm
                                          leading-7
                                          opacity-80
                                        "
                                      >
                                        {
                                          item.keyPoint
                                        }
                                      </p>

                                    </div>

                                  )}

                                </div>

                              )}

                            </div>

                            {/* RESULT */}
                            <Badge
                              variant={
                                isPass
                                  ? 'success'
                                  : 'danger'
                              }
                              size="lg"
                              className="
                                min-h-[60px]
                                min-w-[140px]
                                sm:min-w-[180px]
                                text-base
                              "
                            >

                              <div className="flex items-center gap-3">

                                {isPass ? (

                                  <CheckCircle2
                                    size={20}
                                  />

                                ) : (

                                  <XCircle
                                    size={20}
                                  />

                                )}

                                {result ||
                                  'NO RESULT'}

                              </div>

                            </Badge>

                          </div>

                        </Card>

                      );

                    }
                  )}

                </div>

              </div>

            );

          }
        )}

      </Card>

      {/* ================================================= */}
      {/* ACTIONS */}
      {/* ================================================= */}

      {submission.lifecycleStatus ===
        TRAINING_STATUS.SUBMITTED && (

        <Card
          
          className="
            sticky
            bottom-0
            z-40
            rounded-t-3xl
            lg:rounded-3xl
            backdrop-blur-xl
          "
        >

          <div
            className="
              flex
              flex-col
              xl:flex-row
              gap-5
              xl:items-center
              xl:justify-between
            "
          >

            <div>

              <p
                className="
                  text-sm
                  font-bold
                  text-amber-500
                  mb-2
                "
              >
                Executive Validation
              </p>

              <h2
                className="
                  text-2xl
                  font-black
                "
              >
                Final Review Decision
              </h2>

            </div>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-3
                w-full
                xl:w-auto
              "
            >

              <Button
                variant="danger"
                size="lg"
                icon={XCircle}
                onClick={handleReject}
                loading={actionLoading}
              >

                Reject Submission

              </Button>

              <Button
                variant="success"
                size="lg"
                icon={ShieldCheck}
                onClick={handleApprove}
                loading={actionLoading}
              >

                Approve Submission

              </Button>

            </div>

          </div>

        </Card>

      )}

    </div>

  );

}