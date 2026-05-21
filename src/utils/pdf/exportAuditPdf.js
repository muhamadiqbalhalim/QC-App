import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';

/**
 * =========================================================
 * EXPORT AUDIT PDF
 * =========================================================
 * Enterprise QC Audit PDF Generator
 * =========================================================
 */

export async function exportAuditPdf({

  currentUser,

  trainingConfig,

  workflowData,

  formData,

  totalMark,

}) {

  /**
   * =========================================================
   * PDF INIT
   * =========================================================
   */

  const pdf =
    new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

  /**
   * =========================================================
   * COLORS
   * =========================================================
   */

  const COLORS = {

    amber:
      [245, 158, 11],

    dark:
      [15, 23, 42],

    gray:
      [100, 116, 139],

    green:
      [16, 185, 129],

    red:
      [239, 68, 68],

  };

  /**
   * =========================================================
   * PAGE SETTINGS
   * =========================================================
   */

  const PAGE_WIDTH =
    pdf.internal.pageSize.getWidth();

  let cursorY = 20;

  /**
   * =========================================================
   * HEADER
   * =========================================================
   */

  pdf.setFillColor(
    ...COLORS.dark
  );

  pdf.rect(
    0,
    0,
    PAGE_WIDTH,
    35,
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

  pdf.setFontSize(10);

  pdf.setTextColor(
    220,
    220,
    220
  );

  pdf.text(
    'Enterprise Quality Control System',
    14,
    26
  );

  cursorY = 48;

  /**
   * =========================================================
   * TRAINING TITLE
   * =========================================================
   */

  pdf.setTextColor(
    ...COLORS.dark
  );

  pdf.setFontSize(18);

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.text(
    trainingConfig.title,
    14,
    cursorY
  );

  cursorY += 10;

  /**
   * =========================================================
   * SUMMARY TABLE
   * =========================================================
   */

  autoTable(pdf, {

    startY:
      cursorY,

    theme:
      'grid',

    styles: {

      fontSize: 10,

      cellPadding: 4,

    },

    headStyles: {

      fillColor:
        COLORS.amber,

      textColor:
        [0, 0, 0],

      fontStyle:
        'bold',

    },

    body: [

      [
        'Employee Name',
        currentUser?.name || 'N/A',
      ],

      [
        'Employee ID',
        currentUser?.employeeId || 'N/A',
      ],

      [
        'Department',
        currentUser?.department || 'N/A',
      ],

      [
        'Training Code',
        trainingConfig?.code || 'N/A',
      ],

      [
        'Final Score',
        `${totalMark}%`,
      ],

      [
        'Result Status',
        workflowData?.resultStatus || 'N/A',
      ],

      [
        'Workflow Status',
        workflowData?.lifecycleStatus || 'N/A',
      ],

      [
        'Executive ID',
        workflowData?.approvedBy || 'N/A',
      ],

      [
        'Completed At',
        workflowData?.completedAt || 'N/A',
      ],

    ],

  });

  cursorY =
    pdf.lastAutoTable.finalY + 14;

  /**
   * =========================================================
   * SECTION TITLE
   * =========================================================
   */

  pdf.setFontSize(14);

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.text(
    'Inspection Results',
    14,
    cursorY
  );

  cursorY += 8;

  /**
   * =========================================================
   * BUILD INSPECTION TABLE
   * =========================================================
   */

  const inspectionRows = [];

  Object.entries(
    formData?.inspection || {}
  ).forEach(
    ([
      sectionId,
      rows,
    ]) => {

      Object.entries(
        rows || {}
      ).forEach(
        ([
          rowId,
          fields,
        ]) => {

          Object.entries(
            fields || {}
          ).forEach(
            ([
              fieldId,
              value,
            ]) => {

              inspectionRows.push([

                sectionId,

                rowId,

                fieldId,

                String(value),

              ]);

            }
          );

        }
      );

    }
  );

  /**
   * =========================================================
   * INSPECTION TABLE
   * =========================================================
   */

  autoTable(pdf, {

    startY:
      cursorY,

    head: [[
      'Section',
      'Row',
      'Field',
      'Result',
    ]],

    body:
      inspectionRows,

    theme:
      'striped',

    styles: {

      fontSize: 8,

      cellPadding: 3,

    },

    headStyles: {

      fillColor:
        COLORS.dark,

      textColor:
        [255, 255, 255],

    },

  });

  cursorY =
    pdf.lastAutoTable.finalY + 18;

  /**
   * =========================================================
   * APPROVAL STATUS
   * =========================================================
   */

  pdf.setFontSize(14);

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.text(
    'Approval Workflow',
    14,
    cursorY
  );

  cursorY += 10;

  /**
   * =========================================================
   * STATUS BOX
   * =========================================================
   */

  const status =
    workflowData?.lifecycleStatus;

  let statusColor =
    COLORS.gray;

  if (
    status === 'APPROVED'
  ) {

    statusColor =
      COLORS.green;

  }

  if (
    status === 'REJECTED'
  ) {

    statusColor =
      COLORS.red;

  }

  if (
    status === 'SUBMITTED'
  ) {

    statusColor =
      COLORS.amber;

  }

  pdf.setFillColor(
    ...statusColor
  );

  pdf.roundedRect(
    14,
    cursorY,
    80,
    12,
    3,
    3,
    'F'
  );

  pdf.setTextColor(
    255,
    255,
    255
  );

  pdf.setFontSize(11);

  pdf.text(
    status || 'UNKNOWN',
    20,
    cursorY + 8
  );

  cursorY += 28;

  /**
   * =========================================================
   * SIGNATURE AREA
   * =========================================================
   */

  pdf.setTextColor(
    ...COLORS.dark
  );

  pdf.setFontSize(12);

  pdf.setFont(
    'helvetica',
    'bold'
  );

  pdf.text(
    'Employee Signature',
    14,
    cursorY
  );

  pdf.text(
    'Executive Approval',
    120,
    cursorY
  );

  cursorY += 20;

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

  /**
   * =========================================================
   * FOOTER
   * =========================================================
   */

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  pdf.setFontSize(8);

  pdf.setTextColor(
    120,
    120,
    120
  );

  pdf.text(
    'Generated by QC Nexus Enterprise System',
    14,
    pageHeight - 10
  );

  pdf.text(
    new Date().toLocaleString(),
    PAGE_WIDTH - 50,
    pageHeight - 10
  );

  /**
   * =========================================================
   * SAVE PDF
   * =========================================================
   */

  const fileName =
    `${trainingConfig.code}_${currentUser.employeeId}.pdf`;

  pdf.save(
    fileName
  );

}