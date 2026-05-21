import React, {
  memo,
  useCallback,
  useMemo,
} from 'react';

import {
  Expand,
  Image as ImageIcon,
} from 'lucide-react';

import hero from '../../../../assets/hero.png';

/**
 * =========================================================
 * STATIC IMAGE LOADER
 * =========================================================
 */

const images = import.meta.glob(
  '../../../../assets/*.{png,jpg,jpeg,webp}',
  {
    eager: true,
    import: 'default',
  }
);

/**
 * =========================================================
 * IMAGE RESOLVER
 * =========================================================
 */

const resolveImage = (imageName) => {

  if (!imageName) {
    return hero;
  }

  if (imageName.startsWith('http')) {
    return imageName;
  }

  return (
    images[
      `../../../../assets/${imageName}`
    ] || hero
  );
};

/**
 * =========================================================
 * INPUT FIELD
 * =========================================================
 */

const InputField = memo(function InputField({
  input,
  value,
  onChange,
}) {

  if (input.type === 'number') {

    const numericValue =
      Number(value);

    const dynamicStyle =
      numericValue >= 2
        ? `
          border-emerald-500/40
          bg-emerald-500/5
          text-emerald-500
        `
        : numericValue === 1
          ? `
            border-amber-500/40
            bg-amber-500/5
            text-amber-500
          `
          : numericValue === 0
            ? `
              border-red-500/40
              bg-red-500/5
              text-red-500
            `
            : `
              border-slate-300
              dark:border-slate-700
            `;

    return (
      <input
        type="number"
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`
          w-20
          p-2.5
          rounded-xl
          border
          text-center
          font-black
          outline-none
          bg-transparent
          transition-all
          duration-200
          focus:ring-2
          focus:ring-amber-500
          focus:border-amber-500
          hover:border-amber-500/40
          ${dynamicStyle}
        `}
      />
    );
  }

  return null;
});

/**
 * =========================================================
 * TABLE ROW
 * =========================================================
 */

const InspectionRow = memo(function InspectionRow({
  row,
  inputs,
  sectionId,
  formData,
  handleInputChange,
}) {

  const getValue = useCallback(
    (fieldId) => {

      return (
        formData?.inspection?.[
          sectionId
        ]?.[
          row.id
        ]?.[
          fieldId
        ] ?? ''
      );

    },
    [
      formData,
      row.id,
      sectionId,
    ]
  );

  const onFieldChange = useCallback(
    (fieldId, value) => {

      handleInputChange(
        sectionId,
        row.id,
        fieldId,
        value
      );

    },
    [
      handleInputChange,
      row.id,
      sectionId,
    ]
  );

  const rankStyle = useMemo(() => {

    if (row.rank === 'S') {

      return `
        bg-red-500/10
        text-red-500
        border-red-500/20
      `;

    }

    return `
      bg-amber-500/10
      text-amber-500
      border-amber-500/20
    `;

  }, [row.rank]);

  return (
    <tr
      className="
        hover:bg-amber-50/40
        dark:hover:bg-amber-500/5
        transition-colors
        duration-150
      "
    >

      {/* ID */}
      <td
        className="
          sticky
          left-0
          z-40
          w-[120px]
          min-w-[120px]
          max-w-[120px]
          p-4
          border
          border-r
          border-slate-200
          dark:border-slate-700
          text-center
          font-mono
          font-bold
          text-slate-500
          bg-white
          dark:bg-slate-900
          will-change-transform
          [transform:translateZ(0)]
          backface-hidden
        "
      >
        <div className="break-words leading-6">
          {row.id}
        </div>
      </td>

      {/* ITEM */}
      <td
        className="
          sticky
          left-[120px]
          z-30
          w-[360px]
          min-w-[360px]
          max-w-[360px]
          p-4
          border
          border-r
          border-slate-200
          dark:border-slate-700
          font-semibold
          bg-white
          dark:bg-slate-900
          will-change-transform
          [transform:translateZ(0)]
          backface-hidden
        "
      >
        <div className="break-words leading-6">
          {row.item}
        </div>
      </td>

      {/* CRITERIA */}
      <td className="p-4 border min-w-[180px] text-slate-600 dark:text-slate-300">
        {row.criteria}
      </td>

      {/* STANDARD */}
      <td className="p-3 border">

        <div className="relative group w-fit mx-auto">

          <img
            src={resolveImage(
              row.stdImg
            )}
            alt="Standard"
            loading="lazy"
            className="
              w-28
              h-20
              object-cover
              rounded-xl
              border
              transition-transform
              duration-300
              hover:scale-105
              cursor-pointer
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-black/40
              rounded-xl
              opacity-0
              group-hover:opacity-100
              transition-all
              flex
              items-center
              justify-center
            "
          >
            <Expand
              size={18}
              className="text-white"
            />
          </div>

        </div>

      </td>

      {/* RANK */}
      <td className="p-4 border text-center">

        <span
          className={`
            px-3
            py-1.5
            rounded-xl
            text-[10px]
            font-black
            uppercase
            border
            ${rankStyle}
          `}
        >
          {row.rank}
        </span>

      </td>

      {/* KEY POINT */}
      <td className="p-4 border text-xs leading-7 min-w-[260px] text-slate-600 dark:text-slate-300">
        {row.keyPoint}
      </td>

      {/* REFERENCE */}
      <td className="p-3 border">

        <div className="relative group w-fit mx-auto">

          <img
            src={resolveImage(
              row.photoImg
            )}
            alt="Reference"
            loading="lazy"
            className="
              w-28
              h-20
              object-cover
              rounded-xl
              border
              transition-transform
              duration-300
              hover:scale-105
              cursor-pointer
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-black/40
              rounded-xl
              opacity-0
              group-hover:opacity-100
              transition-all
              flex
              items-center
              justify-center
            "
          >
            <ImageIcon
              size={18}
              className="text-white"
            />
          </div>

        </div>

      </td>

      {/* METHOD */}
      <td className="p-4 border text-xs leading-6 min-w-[220px] text-slate-500">
        {row.method}
      </td>

      {/* CT */}
      <td className="p-4 border text-center font-black text-slate-500">
        {row.ct}
      </td>

      {/* INPUTS */}
      {inputs.map((input) => (

        <td
          key={`${row.id}-${input.id}`}
          className="
            p-3
            border
            text-center
            min-w-[110px]
          "
        >

          <InputField
            input={input}
            value={getValue(input.id)}
            onChange={(value) =>
              onFieldChange(
                input.id,
                value
              )
            }
          />

        </td>

      ))}

    </tr>
  );
});

/**
 * =========================================================
 * INSPECTION TABLE
 * =========================================================
 */

function InspectionTable({
  section,
  formData = {},
  handleInputChange,
}) {

  if (!section) {

    return (
      <div className="p-10 text-center text-sm font-bold text-red-500">
        Invalid inspection section configuration.
      </div>
    );
  }

  const {
    id: sectionId,
    rows = [],
    inputs = [],
  } = section;

  const renderedRows = useMemo(() => {

    return rows.map((row) => (

      <InspectionRow
        key={row.id}
        row={row}
        inputs={inputs}
        sectionId={sectionId}
        formData={formData}
        handleInputChange={
          handleInputChange
        }
      />

    ));

  }, [
    rows,
    inputs,
    sectionId,
    formData,
    handleInputChange,
  ]);

  return (
    <div className="w-full">

      <div
        className="
          bg-white
          dark:bg-slate-900
          rounded-3xl
          border
          border-slate-200
          dark:border-slate-800
          shadow-2xl
          overflow-hidden
        "
      >

        <div
          className="
            relative
            overflow-auto
            overscroll-x-contain
            max-h-[75vh]
            w-full
          "
        >

          <table
            className="
              w-max
              min-w-[1800px]
              table-fixed
              border-separate
              border-spacing-0
              text-[12px]
            "
          >

            <thead
              className="
                bg-slate-100
                dark:bg-slate-900
              "
            >

              <tr>

                {/* ID HEADER */}
                <th
                  className="
                    sticky
                    top-0
                    left-0
                    z-50
                    w-[120px]
                    min-w-[120px]
                    max-w-[120px]
                    p-4
                    border
                    border-r
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-100
                    dark:bg-slate-900
                    will-change-transform
                    [transform:translateZ(0)]
                    backface-hidden
                  "
                >
                  ID
                </th>

                {/* ITEM HEADER */}
                <th
                  className="
                    sticky
                    top-0
                    left-[120px]
                    z-40
                    w-[360px]
                    min-w-[360px]
                    max-w-[360px]
                    p-4
                    border
                    border-r
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-100
                    dark:bg-slate-900
                    will-change-transform
                    [transform:translateZ(0)]
                    backface-hidden
                  "
                >
                  Inspection Item
                </th>

                <th className="sticky top-0 z-10 p-4 border bg-slate-100 dark:bg-slate-900 min-w-[180px]">
                  Criteria
                </th>

                <th className="sticky top-0 z-10 p-4 border bg-slate-100 dark:bg-slate-900">
                  Standard
                </th>

                <th className="sticky top-0 z-10 p-4 border bg-slate-100 dark:bg-slate-900">
                  Rank
                </th>

                <th className="sticky top-0 z-10 p-4 border bg-slate-100 dark:bg-slate-900 min-w-[260px]">
                  Key Point
                </th>

                <th className="sticky top-0 z-10 p-4 border bg-slate-100 dark:bg-slate-900">
                  Reference
                </th>

                <th className="sticky top-0 z-10 p-4 border bg-slate-100 dark:bg-slate-900 min-w-[220px]">
                  Inspection Method
                </th>

                <th className="sticky top-0 z-10 p-4 border bg-slate-100 dark:bg-slate-900">
                  CT
                </th>

                {inputs.map((input) => (

                  <th
                    key={input.id}
                    className="
                      sticky
                      top-0
                      z-10
                      p-4
                      border
                      bg-slate-100
                      dark:bg-slate-900
                      min-w-[110px]
                    "
                  >
                    {input.label}
                  </th>

                ))}

              </tr>

            </thead>

            <tbody>

              {renderedRows}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default memo(InspectionTable);