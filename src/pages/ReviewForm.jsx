import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import {
  FileText,
  Clock3,
  Eye,
  Search,
  ShieldCheck,
  AlertTriangle,
  Filter,
  Download,
} from "lucide-react";

import { exportAuditPdf } from "../utils/pdf/exportAuditPdf";

import { FORM_REGISTRY } from '../config/FormRegistry';

import { db } from "../config/firebase";

import useSession from "../hooks/useSession";

import {
  TRAINING_STATUS,
  getTrainingStatusLabel,
  getTrainingStatusVariant,
} from "../config/constants/status";

import { Card, Button, Badge } from "../components/ui";

export default function ReviewForm() {
  /**
   * =========================================================
   * HOOKS
   * =========================================================
   */

  const navigate = useNavigate();

  const { getSession } = useSession();

  /**
   * =========================================================
   * USER
   * =========================================================
   */

  const currentUser = getSession();

  /**
   * =========================================================
   * STATES
   * =========================================================
   */

  const [submissions, setSubmissions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  /**
   * =========================================================
   * FETCH
   * =========================================================
   */

  useEffect(() => {
    if (!currentUser?.employeeId) {
      setLoading(false);

      return;
    }

    const fetchSubmissions = async () => {
      try {
        setLoading(true);

        const submissionsQuery = query(
          collection(db, "user_progress"),
          where("approvedBy", "==", currentUser.employeeId),
        );

        const snapshot = await getDocs(submissionsQuery);

        const data = snapshot.docs.map((document) => ({
          id: document.id,

          ...document.data(),
        }));

        data.sort(
          (a, b) =>
            new Date(b.updatedAt || b.completedAt) -
            new Date(a.updatedAt || a.completedAt),
        );

        setSubmissions(data);
      } catch (error) {
        console.error("Review fetch failed:", error);
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

  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    if (search) {
      const keyword = search.toLowerCase();

      filtered = filtered.filter(
        (submission) =>
          submission.employeeName?.toLowerCase()?.includes(keyword) ||
          submission.trainingTitle?.toLowerCase()?.includes(keyword) ||
          submission.employeeId?.toLowerCase()?.includes(keyword),
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (submission) => submission.lifecycleStatus === statusFilter,
      );
    }

    return filtered;
  }, [submissions, search, statusFilter]);

  const reviewStats = useMemo(() => {
    return {
      pending: submissions.filter(
        (item) => item.lifecycleStatus === TRAINING_STATUS.SUBMITTED,
      ).length,

      approved: submissions.filter(
        (item) => item.lifecycleStatus === TRAINING_STATUS.APPROVED,
      ).length,

      rejected: submissions.filter(
        (item) => item.lifecycleStatus === TRAINING_STATUS.REJECTED,
      ).length,

      attention: submissions.filter(
        (item) =>
          item.lifecycleStatus === TRAINING_STATUS.SUBMITTED &&
          (item.inspectionSummary?.failed || 0) > 0,
      ).length,
    };
  }, [submissions]);
  const handleDownloadPDF = async (submission) => {

    try {

      const trainingConfig =
        FORM_REGISTRY[
          submission.trainingId
            ?.toLowerCase()
        ];

      await exportAuditPdf({

        currentUser: {
          name:
            submission.employeeName,

          employeeId:
            submission.employeeId,

          department:
            submission.department,
        },

        trainingConfig,

        workflowData:
          submission,

        formData:
          submission.formData || {},

        totalMark:
          submission.totalMark || 0,

      });

    } catch (error) {

      console.error(
        "PDF download failed:",
        error
      );

    }

  };
  /**
   * =========================================================
   * STATUS
   * =========================================================
   */

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
            flex
            items-center
            justify-center
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

          <p className="text-sm opacity-60">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
          min-h-screen
          px-4
          py-5
          sm:px-6
          sm:py-6
          lg:px-8
          lg:py-8
          space-y-6
          bg-[#F8FAFC]
          text-slate-900
        "
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
            <ShieldCheck size={16} className="text-amber-500" />

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
              onChange={(event) => setSearch(event.target.value)}
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
            padding="sm"
            className="
              flex
              items-center
              gap-3
            "
          >
            <Filter size={18} className="opacity-60" />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="
                bg-transparent
                outline-none
                text-sm
                font-semibold
              "
            >
              <option value="ALL">All</option>

              <option value={TRAINING_STATUS.SUBMITTED}>Pending</option>

              <option value={TRAINING_STATUS.APPROVED}>Approved</option>

              <option value={TRAINING_STATUS.REJECTED}>Rejected</option>
            </select>
          </Card>
        </div>
      </div>

      {/* ================================================= */}
      {/* EMPTY */}
      {/* ================================================= */}

      <div
        className="
        grid
        grid-cols-2
        lg:grid-cols-4
        gap-4
      "
      >
        <Card>
          <p className="text-xs opacity-60">Pending</p>

          <h2 className="text-3xl font-black mt-2">{reviewStats.pending}</h2>
        </Card>

        <Card>
          <p className="text-xs opacity-60">Approved</p>

          <h2 className="text-3xl font-black mt-2">{reviewStats.approved}</h2>
        </Card>

        <Card>
          <p className="text-xs opacity-60">Rejected</p>

          <h2 className="text-3xl font-black mt-2">{reviewStats.rejected}</h2>
        </Card>

        <Card>
          <p className="text-xs opacity-60">Attention</p>

          <h2 className="text-3xl font-black mt-2 text-red-500">
            {reviewStats.attention}
          </h2>
        </Card>
      </div>

      {!filteredSubmissions.length && (
        <Card
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
        {filteredSubmissions.map((submission) => {
          const failCount = submission?.inspectionSummary?.failed || 0;

          const passCount = submission?.inspectionSummary?.passed || 0;

          return (
            <Card
              key={submission.id}
              hover
              className={
                failCount > 0 &&
                submission.lifecycleStatus === TRAINING_STATUS.SUBMITTED
                  ? "border-red-300 bg-red-50"
                  : ""
              }
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
                      {submission.employeeName}
                    </h2>

                    <p className="opacity-60 mt-2">
                      ID: {submission.employeeId}
                    </p>

                    <p className="opacity-60">
                      Department: {submission.department || "N/A"}
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
                      Assigned Executive
                    </p>

                    <p className="font-bold">
                      {submission.approvedByName || "Executive"}
                    </p>

                    <p className="opacity-60">ID: {submission.approvedBy}</p>
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
                      {submission.trainingTitle}
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
                    <Badge variant="success" size="lg">
                      PASS: {passCount}
                    </Badge>

                    <Badge
                      variant={failCount > 0 ? "danger" : "default"}
                      size="lg"
                    >
                      FAIL: {failCount}
                    </Badge>

                    {failCount > 0 && (
                      <Badge variant="danger" size="lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={14} />
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
                    variant={getTrainingStatusVariant(submission.lifecycleStatus)}
                    size="lg"
                    className="
                        w-full
                        xl:w-auto
                        min-h-[52px]
                      "
                  >
                    {getTrainingStatusLabel(submission.lifecycleStatus)}
                  </Badge>

                  {/* REVIEW */}
                  <Button
                    variant={failCount > 0 ? "danger" : "info"}
                    size="lg"
                    icon={Eye}
                    onClick={() => navigate(`/review/${submission.id}`)}
                  >
                    {failCount > 0 ? "Review Critical" : "Review Submission"}
                  </Button>

                  <Button
                    variant="secondary"
                    icon={Download}
                    onClick={() => handleDownloadPDF(submission)}
                  >
                    Download Report
                  </Button>

                </div>
              </div>

              {/* FOOTER */}
              <div
                className="
                    mt-6
                    pt-5
                    border-t
                    border-slate-200
                    flex
                    flex-wrap
                    items-center
                    gap-5
                    text-sm
                    opacity-60
                  "
              >
                <div className="flex items-center gap-2">
                  <Clock3 size={15} />
                  Submitted: {
                    submission.completedAt
                      ? new Date(
                          submission.completedAt
                        ).toLocaleString()
                      : 'N/A'
                  }
                </div>

                <div className="flex items-center gap-2">
                  <FileText size={15} />

                  {submission.trainingId}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
