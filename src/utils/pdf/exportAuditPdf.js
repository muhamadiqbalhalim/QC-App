import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function exportAuditPdf({

  currentUser,
  trainingConfig,
  workflowData,
  formData,
  totalMark = 0,

}) {

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const COLORS = {

    dark: [15, 23, 42],
    amber: [245, 158, 11],
    green: [16, 185, 129],
    red: [239, 68, 68],
    gray: [100, 116, 139],

  };

  const PAGE_WIDTH =
    pdf.internal.pageSize.getWidth();

  const PAGE_HEIGHT =
    pdf.internal.pageSize.getHeight();

  let cursorY;

  /* ===================================================== */
  /* HEADER */
  /* ===================================================== */

  pdf.setFillColor(...COLORS.dark);

  pdf.rect(
    0,
    0,
    PAGE_WIDTH,
    32,
    'F'
  );

  pdf.setTextColor(
    255,
    255,
    255
  );

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.setFontSize(22);

  pdf.text(
    'QC AUDIT REPORT',
    14,
    18
  );

  pdf.setFontSize(9);

  pdf.text(
    'Quality Control Training Management System',
    14,
    25
  );

  cursorY = 42;

  /* ===================================================== */
  /* TRAINING INFO */
  /* ===================================================== */

  pdf.setTextColor(
    ...COLORS.dark
  );

  pdf.setFontSize(18);

  pdf.text(
    trainingConfig?.title ||
      'Training Audit',
    14,
    cursorY
  );

  cursorY += 10;

  autoTable(pdf, {

    startY: cursorY,

    theme: 'grid',

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: COLORS.amber,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
    },

    body: [

      [
        'Employee Name',
        currentUser?.name ||
          workflowData?.employeeName ||
          'N/A',
      ],

      [
        'Employee ID',
        currentUser?.employeeId ||
          workflowData?.employeeId ||
          'N/A',
      ],

      [
        'Department',
        currentUser?.department ||
          workflowData?.department ||
          'N/A',
      ],

      [
        'Training Code',
        trainingConfig?.code ||
          workflowData?.trainingId ||
          '-',
      ],

      [
        'Training Name',
        trainingConfig?.title ||
          '-',
      ],

      [
        'Final Score',
        `${totalMark}%`,
      ],

      [
        'Result Status',
        workflowData?.resultStatus ||
          '-',
      ],

      [
        'Workflow Status',
        workflowData?.lifecycleStatus ||
          '-',
      ],

      [
        'Inspection Date',
        workflowData?.completedAt ||
          workflowData?.updatedAt ||
          '-',
      ],

    ],

  });

  cursorY =
    pdf.lastAutoTable.finalY +
    12;

  /* ===================================================== */
  /* EXECUTIVE ASSESSMENT */
  /* ===================================================== */

  const executiveAssessment =
    workflowData?.executiveAssessment ||
    {};

  pdf.setFontSize(14);

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.text(
    'Executive Assessment',
    14,
    cursorY
  );

  cursorY += 6;

  autoTable(pdf, {

    startY: cursorY,

    theme: 'grid',

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: COLORS.dark,
      textColor: [255,255,255],
    },

    body: [

      [
        'Pre-Test',
        executiveAssessment.preTest ??
          '-',
      ],

      [
        'Post-Test',
        executiveAssessment.postTest ??
          '-',
      ],

      [
        'Executive Remark',
        executiveAssessment.remark ??
          '-',
      ],

    ],

  });

  cursorY =
    pdf.lastAutoTable.finalY +
    12;

  /* ===================================================== */
  /* INSPECTION RESULTS */
  /* ===================================================== */

  pdf.setFontSize(14);

  pdf.text(
    'Inspection Results',
    14,
    cursorY
  );

  cursorY += 5;

  const inspectionRows = [];

  Object.entries(
    formData?.inspection || {}
  ).forEach(

    ([sectionId, rows]) => {

      Object.entries(
        rows || {}
      ).forEach(

        ([rowId, fields]) => {

          const insp =
            fields?.insp ?? '-';

          const keyPt =
            fields?.keyPt ?? '-';

          const seq =
            fields?.seq ?? '-';

          const completed =
            insp !== '-' &&
            keyPt !== '-' &&
            seq !== '-';

          inspectionRows.push([

            sectionId,

            rowId,

            String(insp),

            String(keyPt),

            String(seq),

            completed
              ? 'COMPLETE'
              : 'INCOMPLETE',

          ]);

        }

      );

    }

  );

  autoTable(pdf, {

    startY: cursorY,

    head: [[

      'Section',
      'Inspection ID',
      'Insp Res',
      'KeyPt Res',
      'Seq Res',
      'Status',

    ]],

    body: inspectionRows,

    styles: {

      fontSize: 8,
      cellPadding: 2,

    },

    headStyles: {

      fillColor:
        COLORS.dark,

      textColor:
        [255,255,255],

    },

    theme: 'striped',

  });

  cursorY =
    pdf.lastAutoTable.finalY +
    12;

  /* ===================================================== */
  /* APPROVAL INFO */
  /* ===================================================== */

  if (
    cursorY >
    PAGE_HEIGHT - 60
  ) {

    pdf.addPage();

    cursorY = 20;

  }

  pdf.setFontSize(14);

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.text(
    'Approval Information',
    14,
    cursorY
  );

  cursorY += 6;

  autoTable(pdf, {

    startY: cursorY,

    theme: 'grid',

    styles: {
      fontSize: 9,
      cellPadding: 3,
    },

    headStyles: {
      fillColor: COLORS.amber,
      textColor: [0,0,0],
    },

    body: [

      [
        'Executive ID',
        workflowData?.approvedBy ||
          '-',
      ],

      [
        'Approved Date',
        workflowData?.approvedAt ||
          '-',
      ],

      [
        'Rejected Date',
        workflowData?.rejectedAt ||
          '-',
      ],

      [
        'Status',
        workflowData?.lifecycleStatus ||
          '-',
      ],

    ],

  });

  cursorY =
    pdf.lastAutoTable.finalY +
    25;

  /* ===================================================== */
  /* SIGNATURE */
  /* ===================================================== */

  pdf.setFontSize(11);

  pdf.setTextColor(
    ...COLORS.dark
  );

  pdf.text(
    'Operator Signature',
    14,
    cursorY
  );

  pdf.text(
    'Executive Approval',
    120,
    cursorY
  );

  cursorY += 18;

  pdf.line(
    14,
    cursorY,
    80,
    cursorY
  );

  pdf.line(
    120,
    cursorY,
    186,
    cursorY
  );

  /* ===================================================== */
  /* FOOTER */
  /* ===================================================== */

  pdf.setFontSize(8);

  pdf.setTextColor(
    120,
    120,
    120
  );

  pdf.text(
    'Generated by QC Training System',
    14,
    PAGE_HEIGHT - 10
  );

  pdf.text(
    new Date().toLocaleString(),
    PAGE_WIDTH - 55,
    PAGE_HEIGHT - 10
  );

  /* ===================================================== */
  /* SAVE */
  /* ===================================================== */

  const fileName = `${trainingConfig?.code || 'AUDIT'}_${
    workflowData?.employeeId ||
    currentUser?.employeeId ||
    'USER'
  }.pdf`;

  pdf.save(fileName);

}
