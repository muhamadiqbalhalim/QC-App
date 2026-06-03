import React, {
  memo,
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  Expand,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
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
 * MOBILE QC INPUT
 * =========================================================
 */

const InputField = memo(function InputField({
  value,
  onChange,
  readOnly = false,
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-center
        gap-3
      "
    >

      {/* PASS */}
      <button
        type="button"
        onClick={() => {

          if (readOnly) {
            return;
          }

          onChange('PASS');

        }}
        className={`
          w-16
          h-16
          rounded-2xl
          border-2
          transition-all
          duration-200
          active:scale-95
          flex
          items-center
          justify-center
          shadow-sm
          ${
            readOnly
              ? `
                cursor-default
                opacity-90
              `
              : `
                cursor-pointer
              `
          }
          ${
            value === 'PASS'
              ? `
                bg-emerald-500
                border-emerald-500
                text-white
                shadow-lg
                scale-105
              `
              : `
                bg-white
                border-slate-300
                hover:border-emerald-500
              `
          }
        `}
      >

        <CheckCircle2 size={26} />

      </button>

      {/* FAIL */}
      <button
        type="button"
        onClick={() => {

          if (readOnly) {
            return;
          }

          onChange('FAIL');

        }}
        className={`
          w-16
          h-16
          rounded-2xl
          border-2
          transition-all
          duration-200
          active:scale-95
          flex
          items-center
          justify-center
          shadow-sm
          ${
            readOnly
              ? `
                cursor-default
                opacity-90
              `
              : `
                cursor-pointer
              `
          }
          ${
            value === 'FAIL'
              ? `
                bg-red-500
                border-red-500
                text-white
                shadow-lg
                scale-105
              `
              : `
                bg-white
                border-slate-300
                hover:border-red-500
              `
          }
        `}
      >

        <XCircle size={26} />

      </button>

    </div>

  );

});

/**
 * =========================================================
 * IMAGE PREVIEW MODAL
 * =========================================================
 */

const ImagePreviewModal = ({
  image,
  onClose,
}) => {

  if (!image) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[999]
        bg-black/80
        backdrop-blur-sm
        flex
        items-center
        justify-center
        p-4
      "
      onClick={onClose}
    >

      <div
        className="
          relative
          max-w-5xl
          w-full
        "
      >

        <img
          src={image}
          alt="Preview"
          className="
            w-full
            max-h-[85vh]
            object-contain
            rounded-3xl
            bg-white
          "
        />

      </div>

    </div>
  );
};

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
  readOnly = false,
  onPreviewImage,
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
        transition-colors
        duration-150
      "
    >

      {/* ID */}
        <td
          className="
            w-[90px]
            min-w-[90px]
            sm:w-[110px]
            sm:min-w-[110px]
            p-3
            border
            border-slate-200
            text-center
            font-mono
            font-bold
            text-xs
            text-slate-500
          "
        >

        <div className="break-words leading-5">
          {row.id}
        </div>

      </td>

      {/* ITEM */}
        <td
          className="
            w-[180px]
            min-w-[180px]
            sm:w-[280px]
            sm:min-w-[280px]
            p-4
            border
            border-slate-200
            font-semibold
            text-sm
            sm:text-base
          "
        >

        <div className="space-y-3">

          <div className="break-words leading-6">
            {row.item}
          </div>

          {/* MOBILE QUICK STATUS */}
          <div className="lg:hidden">

            {inputs.map((input) => {

              const currentValue =
                getValue(input.id);

              return (

                <div
                  key={input.id}
                  className="
                    flex
                    items-center
                    gap-2
                    mt-2
                  "
                >

                  <span
                    className="
                      text-[11px]
                      font-bold
                      opacity-50
                      uppercase
                    "
                  >
                    {input.label}
                  </span>

                  {currentValue && (

                    <span
                      className={`
                        px-2.5
                        py-1
                        rounded-xl
                        text-[10px]
                        font-black
                        ${
                          currentValue === 'PASS'
                            ? `
                              bg-emerald-500/10
                              text-emerald-500
                            `
                            : `
                              bg-red-500/10
                              text-red-500
                            `
                        }
                      `}
                    >

                      {currentValue}

                    </span>

                  )}

                </div>

              );

            })}

          </div>

        </div>

      </td>

      {/* CRITERIA */}
      <td
        className="
          p-4
          border
          min-w-[220px]
          text-sm
          sm:text-base
          leading-7
          text-slate-600
        "
      >
        {row.criteria}
      </td>

      {/* STANDARD */}
      <td className="p-4 border">

        <button
          type="button"
          onClick={() =>
            onPreviewImage(
              resolveImage(
                row.stdImg
              )
            )
          }
          className="
            relative
            group
            w-fit
            mx-auto
            overflow-hidden
            rounded-2xl
          "
        >

          <img
            src={resolveImage(
              row.stdImg
            )}
            alt="Standard"
            loading="lazy"
            className="
              w-32
              h-24
              sm:w-36
              sm:h-28
              object-cover
              rounded-2xl
              border
              transition-transform
              duration-300
              group-hover:scale-105
            "
          />

          <div
            className="
              absolute
              inset-0
              bg-black/40
              rounded-2xl
              opacity-0
              group-hover:opacity-100
              transition-all
              flex
              items-center
              justify-center
            "
          >

            <Expand
              size={20}
              className="text-white"
            />

          </div>

        </button>

      </td>

      {/* RANK */}
      <td className="p-4 border text-center">

        <span
          className={`
            px-4
            py-2
            rounded-xl
            text-sm
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
      <td
        className="
          p-4
          border
          text-sm
          leading-7
          min-w-[260px]
          text-slate-600
        "
      >
        {row.keyPoint}
      </td>

      {/* REFERENCE */}
      <td className="p-4 border">

        <button
          type="button"
          onClick={() =>
            onPreviewImage(
              resolveImage(
                row.photoImg
              )
            )
          }
          className="
            relative
            group
            w-fit
            mx-auto
            overflow-hidden
            rounded-2xl
          "
        >

          <img
            src={resolveImage(
              row.photoImg
            )}
            alt="Reference"
            loading="lazy"
            className="
            w-32
            h-24
            sm:w-36
            sm:h-28
            object-cover
            rounded-2xl
            border
            transition-transform
            duration-300
            group-hover:scale-105
          "
          />

          <div
            className="
              absolute
              inset-0
              bg-black/40
              rounded-2xl
              opacity-0
              group-hover:opacity-100
              transition-all
              flex
              items-center
              justify-center
            "
          >

            <ImageIcon
              size={20}
              className="text-white"
            />

          </div>

        </button>

      </td>

      {/* METHOD */}
      <td
        className="
          p-4
          border
          text-sm
          leading-7
          min-w-[240px]
          text-slate-500
        "
      >
        {row.method}
      </td>

      {/* CT */}
      <td
        className="
          p-4
          border
          text-center
          font-black
          text-slate-500
          text-sm
        "
      >
        {row.ct}
      </td>

      {/* INPUTS */}
      {inputs.map((input) => (

        <td
          key={`${row.id}-${input.id}`}
          className="
            p-4
            border
            text-center
            min-w-[180px]
          "
        >

          <div className="space-y-3">

            <p
              className="
                text-xs
                font-bold
                opacity-50
                uppercase
                lg:hidden
              "
            >
              {input.label}
            </p>

            <InputField
              value={getValue(input.id)}
              readOnly={readOnly}
              onChange={(value) =>
                onFieldChange(
                  input.id,
                  value
                )
              }
            />

          </div>

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
  readOnly = false,
}) {

  const [
    previewImage,
    setPreviewImage,
  ] = useState(null);

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

  const safeRows =
    Array.isArray(rows)
      ? rows
      : [];

  const safeInputs =
    Array.isArray(inputs)
      ? inputs
      : [];

  const renderedRows = useMemo(() => {

    return safeRows.map((row) => (

      <InspectionRow
        key={row.id}
        row={row}
        inputs={safeInputs}
        sectionId={sectionId}
        formData={formData}
        handleInputChange={
          handleInputChange
        }
        readOnly={readOnly}
        onPreviewImage={
          setPreviewImage
        }
      />

    ));

  }, [
    safeRows,
    safeInputs,
    sectionId,
    formData,
    handleInputChange,
    readOnly,
  ]);

  return (
    <div className="w-full">

      {/* IMAGE MODAL */}
      <ImagePreviewModal
        image={previewImage}
        onClose={() =>
          setPreviewImage(null)
        }
      />

      <div
        className="
          bg-white
          rounded-3xl
          border
          border-slate-200
          shadow-xl
          overflow-hidden
        "
      >

        {/* MOBILE SCROLL HINT */}
        <div
          className="
            px-4
            py-3
            text-sm
            font-semibold
            text-amber-500
            border-b
            border-slate-200
            lg:hidden
            bg-amber-500/5
          "
        >
          Swipe to view all inspection details
        </div>

        {/* TABLE CONTAINER */}
          <div
            className="
              mobile-table-scroll
              relative
              overflow-x-auto
              overflow-y-hidden
              w-full
              pb-3
              touch-pan-x
              overscroll-x-contain
              [-webkit-overflow-scrolling:touch]
            "
          >

          <table
            className="
              w-max
              min-w-[1100px]
              lg:min-w-[1400px]
              table-fixed
              border-separate
              border-spacing-0
              text-[13px]
              sm:text-sm
            "
          >

            <thead
              className="
                bg-slate-100
              "
            >

              <tr>

                <th
                  className="
                    w-[90px]
                    min-w-[90px]
                    sm:w-[110px]
                    sm:min-w-[110px]
                    p-4
                    border
                    border-slate-200
                    bg-slate-100
                  "
                >
                  ID
                </th>

                <th
                  className="
                    w-[180px]
                    min-w-[180px]
                    sm:w-[340px]
                    sm:min-w-[340px]
                    p-4
                    border
                    border-slate-200
                    bg-slate-100
                  "
                >
                  Inspection Item
                </th>

                <th className="p-4 border bg-slate-100 min-w-[220px]">
                  Criteria
                </th>

                <th className="p-4 border bg-slate-100">
                  Standard
                </th>

                <th className="p-4 border bg-slate-100">
                  Rank
                </th>

                <th className="p-4 border bg-slate-100 min-w-[260px]">
                  Key Point
                </th>

                <th className="p-4 border bg-slate-100">
                  Reference
                </th>

                <th className="p-4 border bg-slate-100 min-w-[240px]">
                  Method
                </th>

                <th className="p-4 border bg-slate-100">
                  CT
                </th>

                {safeInputs.map((input) => (

                  <th
                    key={input.id}
                    className="
                      p-4
                      border
                      bg-slate-100
                      min-w-[180px]
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