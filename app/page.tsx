"use client";

import { useState, useEffect } from "react";
import FormModal from "@/components/FormModal";
import {
  validatePositiveInt,
  positiveIntError,
  isEmailValid,
  emailError,
} from "@/lib/utils/validation";

export default function Home() {
  // Modal open/close - for each of the three forms
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [pcbModalOpen, setPcbModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // 3D Print Modal Form
  const [printForm, setPrintForm] = useState({
    requestName: "",
    requestEmail: "",
    file: null as File | null,
    printQuantity: "1",
    filamentColor: "",
    comments: "",
  });

  // PCB Mill Modal Form
  const [pcbForm, setPcbForm] = useState({
    requestName: "",
    requestEmail: "",
    file: null as File | null,
    pcbSiding: "single",
    boardQuantity: "1",
    silkscreen: "no",
    boardArea: "",
    rubout: "no",
    comments: "",
  });

  // Check that user entered a valid email - one for each form
  const isPrintEmailValid = isEmailValid(printForm.requestEmail);
  const isPcbEmailValid = isEmailValid(pcbForm.requestEmail);

  // Reset 3d Print Form
  const reset3DPrintForm = () => {
    setPrintForm({
      requestName: "",
      requestEmail: "",
      file: null,
      printQuantity: "1",
      filamentColor: "",
      comments: "",
    });
  };

  // Close 3D Print Modal
  const close3DPrintModal = () => {
    setPrintModalOpen(false);
    reset3DPrintForm();
  };

  // Check that user entered a valid integer
  const printQty = validatePositiveInt(printForm.printQuantity);
  const isQuantityValid = printQty.isValid;

  // Required fields gate for 3D print
  const is3DSubmitDisabled =
    !printForm.requestName.trim() ||
    !isPrintEmailValid ||
    !printForm.file ||
    !isQuantityValid ||
    !printForm.filamentColor.trim();

  // Submitting 3D Print Form
  const handle3DPrintSubmit = async () => {
    if (is3DSubmitDisabled) return;

    setSaving(true);
    try {
      // Placeholder for now
      console.log("3D Print Request", {
        name: printForm.requestName.trim(),
        email: printForm.requestEmail.trim(),
        file: printForm.file?.name,
        quantity: Number(printForm.printQuantity),
        filamentColor: printForm.filamentColor.trim(),
        comments: printForm.comments.trim(),
      });

      close3DPrintModal();
    } finally {
      setSaving(false);
    }
  };

  // 3D Print errors
  const errors = {
    requestEmail: emailError(printForm.requestEmail),
    printQuantity: positiveIntError(printQty, "quantity"),
  };

  // Reset PCB Mill Form
  const resetPcbForm = () => {
    setPcbForm({
      requestName: "",
      requestEmail: "",
      file: null,
      pcbSiding: "single",
      boardQuantity: "1",
      silkscreen: "no",
      boardArea: "",
      rubout: "no",
      comments: "",
    });
  };

  // Close PCB Mill Form
  const closePcbModal = () => {
    setPcbModalOpen(false);
    resetPcbForm();
  };

  // check that user entered valid integers
  const pcbQty = validatePositiveInt(pcbForm.boardQuantity);
  const pcbArea = validatePositiveInt(pcbForm.boardArea);

  const isBoardQtyValid = pcbQty.isValid;
  const isBoardAreaValid = pcbArea.isValid;

  // Pricing (per in^2)
  const sidingRate = pcbForm.pcbSiding === "double" ? 0.8 : 0.4;
  const silkscreenRate =
    pcbForm.pcbSiding === "single" && pcbForm.silkscreen === "yes" ? 0.2 : 0;
  const ruboutRate = pcbForm.rubout === "yes" ? 0.1 : 0;

  const ratePerIn2 = sidingRate + silkscreenRate + ruboutRate;

  // Estimate = (rate per in^2) * area * qty
  const costEstimate =
    isBoardQtyValid && isBoardAreaValid
      ? ratePerIn2 * pcbArea.num * pcbQty.num
      : 0;

  const costEstimateText =
    isBoardQtyValid && isBoardAreaValid ? `$${costEstimate.toFixed(2)}` : "";

  // Gap in PCB Mill Spacing
  const gap = "\u2007\u2007\u2007\u2007\u2007";

  // Required fields gate for PCB Mill
  const isPcbSubmitDisabled =
    !pcbForm.requestName.trim() ||
    !isPcbEmailValid ||
    !pcbForm.file ||
    !isBoardQtyValid ||
    !isBoardAreaValid;

  // Force Silkscreen to "no" when double sided is selected
  useEffect(() => {
    if (pcbForm.pcbSiding === "double" && pcbForm.silkscreen !== "no") {
      setPcbForm((p) => ({ ...p, silkscreen: "no" }));
    }
  }, [pcbForm.pcbSiding, pcbForm.silkscreen]);

  // Submitting PCB Mill Form
  const handlePcbSubmit = async () => {
    if (isPcbSubmitDisabled) return;

    setSaving(true);
    try {
      console.log("PCB Mill Request", {
        name: pcbForm.requestName.trim(),
        email: pcbForm.requestEmail.trim(),
        file: pcbForm.file?.name,

        pcbSiding: pcbForm.pcbSiding,
        boardQuantity: pcbQty.num,
        silkscreen: pcbForm.silkscreen,
        boardArea: pcbArea.num,
        rubout: pcbForm.rubout,
        estimatedCost: costEstimateText,

        comments: pcbForm.comments.trim(),
      });

      closePcbModal();
    } finally {
      setSaving(false);
    }
  };

  // PCB Mill errors
  const pcbErrors = {
    requestEmail: emailError(pcbForm.requestEmail),
    boardQuantity: positiveIntError(pcbQty, "quantity"),
    boardArea: positiveIntError(pcbArea, "area"),
  };

  return (
    <main className="min-h-[calc(100vh-8rem)] bg-gradient-to-br from-byu-royal/5 via-white to-byu-navy/5 flex items-center justify-center px-4 py-12">
      <div className="w-full text-center">
        {/* Little badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-byu-navy text-white text-xs tracking-wide uppercase mb-4">
          <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
          Under construction
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-byu-navy tracking-tight">
          Welcome to the <span className="text-byu-royal">EPICenter</span> ⚡
        </h1>

        <p className="mt-4 text-sm sm:text-base text-gray-700 max-w-2xl mx-auto">
          This will be the home for ECE shop orders, inventory, and other
          engineering goodies. For now, it&apos;s basically a very fancy
          &quot;Coming Soon&quot; page while we plug in all the wires.
        </p>

        {/* Silly status line */}
        <div className="mt-6 text-xs sm:text-sm text-gray-600">
          <p>Current status: ⚙️ calibrating flux capacitors…</p>
          <p className="mt-1 italic">
            If you&apos;re seeing this, the engineers are still tinkering.
          </p>
        </div>

        {/* Request buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            className="px-5 py-3 rounded-md border border-byu-royal text-byu-royal bg-white hover:bg-byu-royal hover:text-white transition text-sm font-medium"
            onClick={() => setPrintModalOpen(true)}
          >
            3D Print Request
          </button>

          <button
            type="button"
            className="px-5 py-3 rounded-md border border-byu-royal text-byu-royal bg-white hover:bg-byu-royal hover:text-white transition text-sm font-medium"
            onClick={() => setPcbModalOpen(true)}
          >
            PCB Mill Request
          </button>

          <button
            type="button"
            className="px-5 py-3 rounded-md border border-byu-royal text-byu-royal bg-white hover:bg-byu-royal hover:text-white transition text-sm font-medium"
          >
            Laser Cut Request
          </button>
        </div>

        {/* 3D Print Request Modal */}
        <FormModal
          open={printModalOpen}
          onClose={close3DPrintModal}
          onSubmit={handle3DPrintSubmit}
          title="New 3D Print Request"
          size="lg"
          saving={saving}
          saveLabel="Submit Request"
          submitDisabled={is3DSubmitDisabled}
          values={printForm}
          setValues={setPrintForm}
          errors={errors}
          fields={[
            {
              key: "requestName",
              label: "Name",
              required: true,
            },
            {
              key: "requestEmail",
              label: "Email",
              required: true,
              type: "email",
            },

            // Custom file picker
            {
              kind: "custom",
              key: "file",
              colSpan: 2,
              render: () => (
                <div className="text-left">
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Print File *
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    We accept .stl, .3mf, .stp
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                      Choose file
                      <input
                        type="file"
                        className="hidden"
                        accept=".stl,.3mf,.stp"
                        onChange={(e) =>
                          setPrintForm((p) => ({
                            ...p,
                            file: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </label>

                    <div className="text-sm text-gray-700 truncate max-w-[22rem]">
                      {printForm.file ? (
                        printForm.file.name
                      ) : (
                        <span className="text-gray-400">No file selected</span>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "printQuantity",
              label: "Print Quantity",
              required: true,
              type: "number",
            },
            {
              key: "filamentColor",
              label: "Filament Color (1st choice)",
              required: true,
            },
            {
              kind: "custom",
              key: "comments",
              colSpan: 2,
              render: () => (
                <div className="text-left">
                  {/* Explanation Lines */}
                  <div className="mt-2 text-xs font-medium text-gray-600">
                    <p>3D Prints cost $0.10 per gram.</p>
                    <p className="mt-1.5">Infill set to 15%</p>
                  </div>

                  <label className="block text-sm font-medium text-byu-navy mt-5 mb-1">
                    Additional Comments
                  </label>

                  <p className="mt-0.5 text-xs text-gray-500 mb-2">
                    Use this to note any special settings (layer height,
                    supports, orientation, etc). Most prints will work with our
                    default settings.
                  </p>

                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                    placeholder="Optional notes..."
                    value={printForm.comments}
                    onChange={(e) =>
                      setPrintForm((p) => ({
                        ...p,
                        comments: e.target.value,
                      }))
                    }
                  />
                </div>
              ),
            },
          ]}
        />

        {/* PCB Mill Request Modal */}
        <FormModal
          open={pcbModalOpen}
          onClose={closePcbModal}
          onSubmit={handlePcbSubmit}
          title="New PCB Mill Request"
          size="lg"
          saving={saving}
          saveLabel="Submit Request"
          submitDisabled={isPcbSubmitDisabled}
          values={pcbForm}
          setValues={setPcbForm}
          errors={pcbErrors}
          fields={[
            {
              key: "requestName",
              label: "Name",
              required: true,
            },
            {
              key: "requestEmail",
              label: "Email",
              required: true,
              type: "email",
            },
            // Custom file picker
            {
              kind: "custom",
              key: "file",
              colSpan: 2,
              render: () => (
                <div className="text-left mb-5">
                  <label className="block text-sm font-medium text-byu-navy mb-1">
                    Gerber Files *
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    Submit a .zip containing your Gerber files
                  </p>
                  <p className="text-sm text-gray-600 mb-3 font-medium">
                    We have UPDATED DESIGN CONSTRAINTS for your PCB designs.
                    Please use{" "}
                    <a
                      href={process.env.NEXT_PUBLIC_PCB_MILL_INSTRUCTIONS_URL}
                      className="text-blue-600 underline hover:text-blue-800"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      this link
                    </a>{" "}
                    and follow this 5 minute guide BEFORE submitting your PCB.
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                      Choose file
                      <input
                        type="file"
                        className="hidden"
                        accept=".zip"
                        onChange={(e) =>
                          setPcbForm((p) => ({
                            ...p,
                            file: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </label>

                    <div className="text-sm text-gray-700 truncate max-w-[22rem]">
                      {pcbForm.file ? (
                        pcbForm.file.name
                      ) : (
                        <span className="text-gray-400">No file selected</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 mt-6">
                    NOTE ABOUT SILKSCREEN: Our silkscreens are produced by
                    MILLING on the FR4 surface (opposite side to the copper).{" "}
                    <span className="font-semibold">
                      IF YOUR SILKSREEN IS ON THE SAME SIDE AS YOUR COPPER, TEXT
                      WILL BE MIRRORED.
                    </span>
                  </p>
                </div>
              ),
            },
            // Row 1: PCB Siding + Board Quantity
            {
              key: "pcbSiding",
              label: "PCB Siding",
              required: true,
              kind: "select",
              options: [
                { label: `Single Sided${gap}$0.40/in²`, value: "single" },
                {
                  label: `Double Sided${"\u2007\u2007\u2007\u2007"}$0.80/in²`,
                  value: "double",
                },
              ],
            },
            {
              key: "boardQuantity",
              label: "Board Quantity",
              required: true,
              type: "number",
            },

            // Row 2: Silkscreen (single sided only) + Board Area
            {
              kind: "custom",
              key: "silkscreen",
              render: () => {
                const disabled = pcbForm.pcbSiding === "double";

                return (
                  <div className={`text-left ${disabled ? "opacity-70" : ""}`}>
                    <label className="block text-sm font-medium text-byu-navy mb-1">
                      Silkscreen (only for Single Sided){" "}
                      {pcbForm.pcbSiding === "single" ? "*" : null}
                    </label>

                    <select
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-byu-royal focus:border-byu-royal"
                      value={pcbForm.silkscreen}
                      disabled={disabled}
                      onChange={(e) =>
                        setPcbForm((p) => ({
                          ...p,
                          silkscreen: e.target.value,
                        }))
                      }
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes{gap}+ $0.20/in²</option>
                    </select>

                    {disabled ? (
                      <p className="mt-1 text-xs text-gray-500">
                        Silkscreen is only available for Single Sided boards.
                      </p>
                    ) : null}
                  </div>
                );
              },
            },
            {
              key: "boardArea",
              label: "Board Area (in²)",
              required: true,
              type: "number",
              adornment: { text: "in²", position: "end" },
            },

            // Row 3: Rubout + Cost Estimate
            {
              key: "rubout",
              label: "Rubout",
              kind: "select",
              options: [
                { label: "No", value: "no" },
                { label: `Yes${gap}+ $0.10/in²`, value: "yes" },
              ],
            },
            {
              kind: "custom",
              key: "costEstimate",
              render: () => (
                <div className="text-left">
                  <div className="rounded-md border border-byu-royal/20 bg-byu-royal/5 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-byu-navy/80">
                        Cost estimate
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                      <span>
                        Rate:{" "}
                        <span className="font-medium">{`$${ratePerIn2.toFixed(2)}/in²`}</span>
                      </span>
                      <span className="text-lg font-extrabold text-byu-navy">
                        {costEstimateText}
                      </span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "comments",
              label: "Additional Comments",
              type: "textarea",
              colSpan: 2,
              helperText: "If this is an RF board, you MUST specify here",
            },
          ]}
        />
      </div>
    </main>
  );
}
