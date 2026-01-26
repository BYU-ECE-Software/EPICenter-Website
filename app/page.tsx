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
  const [laserModalOpen, setLaserModalOpen] = useState(false);
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

  // Laser Cut Modal Form
  const [laserForm, setLaserForm] = useState({
    requestName: "",
    requestEmail: "",
    file: null as File | null,
    confirmedCalendar: false,
    confirmedResponsibility: false,
    comments: "",
  });

  // Check that user entered a valid email - one for each form
  const isPrintEmailValid = isEmailValid(printForm.requestEmail);
  const isPcbEmailValid = isEmailValid(pcbForm.requestEmail);
  const isLaserEmailValid = isEmailValid(laserForm.requestEmail);

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

  //Reset Laser cut form modal
  const resetLaserForm = () => {
    setLaserForm({
      requestName: "",
      requestEmail: "",
      file: null,
      confirmedCalendar: false,
      confirmedResponsibility: false,
      comments: "",
    });
  };

  // close laser cut form modal
  const closeLaserModal = () => {
    setLaserModalOpen(false);
    resetLaserForm();
  };

  // Required fields gate for Laser Cut
  const isLaserSubmitDisabled =
    !laserForm.requestName.trim() ||
    !isLaserEmailValid ||
    !laserForm.file ||
    !laserForm.confirmedCalendar ||
    !laserForm.confirmedResponsibility;

  // Submitting Laser Cut Form
  const handleLaserSubmit = async () => {
    if (isLaserSubmitDisabled) return;

    setSaving(true);
    try {
      console.log("Laser Cut Request", {
        name: laserForm.requestName.trim(),
        email: laserForm.requestEmail.trim(),
        file: laserForm.file?.name,
        confirmedCalendar: laserForm.confirmedCalendar,
        confirmedResponsibility: laserForm.confirmedResponsibility,
        comments: laserForm.comments.trim(),
      });

      closeLaserModal();
    } finally {
      setSaving(false);
    }
  };

  // Laser cut errors
  const laserErrors = {
    requestEmail: emailError(laserForm.requestEmail),
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
            onClick={() => setLaserModalOpen(true)}
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
            // Row 1: Board Area + Board Quantity
            {
              key: "boardArea",
              label: "Board Area (in²)",
              required: true,
              type: "number",
              adornment: { text: "in²", position: "end" },
            },
            {
              key: "boardQuantity",
              label: "Board Quantity",
              required: true,
              type: "number",
            },

            // Row 2: PCB Siding + Silkscreen (single sided only)
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

        {/* Laser Cut Request Modal */}
        <FormModal
          open={laserModalOpen}
          onClose={closeLaserModal}
          onSubmit={handleLaserSubmit}
          title="New Laser Cut Request"
          size="lg"
          saving={saving}
          saveLabel="Submit Request"
          submitDisabled={isLaserSubmitDisabled}
          values={laserForm}
          setValues={setLaserForm}
          errors={laserErrors}
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
                    Cut File *
                  </label>
                  <p className="text-xs text-gray-600 mb-3">
                    We accept .svg and .pdf
                  </p>

                  <div className="flex items-center gap-3 mb-2">
                    <label className="inline-flex items-center justify-center rounded-sm bg-gray-100 border border-black px-2 py-1 text-sm text-black cursor-pointer hover:bg-gray-200 transition">
                      Choose file
                      <input
                        type="file"
                        className="hidden"
                        accept=".svg,.pdf"
                        onChange={(e) =>
                          setLaserForm((p) => ({
                            ...p,
                            file: e.target.files?.[0] ?? null,
                          }))
                        }
                      />
                    </label>

                    <div className="text-sm text-gray-700 truncate max-w-[22rem]">
                      {laserForm.file ? (
                        laserForm.file.name
                      ) : (
                        <span className="text-gray-400">No file selected</span>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },

            // Big process explanation + embedded sheet
            {
              kind: "custom",
              key: "processAndCalendar",
              colSpan: 2,
              render: () => (
                <div className="text-left mt-2">
                  <label className="block text-sm font-semibold text-byu-navy mb-2">
                    How the process works
                  </label>

                  <div className="space-y-5 text-sm text-gray-700">
                    <div>
                      <p className="font-medium text-byu-navy">Process</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>
                          Sign up for a time on the{" "}
                          <a
                            href={
                              process.env
                                .NEXT_PUBLIC_LASER_SCHEDULE_SHEET_VIEW_URL
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline hover:text-blue-800"
                          >
                            Google Sheets
                          </a>
                          .
                        </li>
                        <li>
                          Come meet with a shop tech at the time you signed up
                          and process your job.
                        </li>
                        <li>
                          You are required to be present during the entire cut.
                        </li>
                        <li>
                          If you are not able to be present, a shop tech can
                          watch your job for $20/hour.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-byu-navy">Material</p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>
                          You are responsible for providing your own material.
                        </li>
                        <li>
                          There is a limited selection of material in stock that
                          you can purchase from the EPICenter.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-byu-navy">
                        Disallowed materials
                      </p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>PVC - emits pure chlorine gas</li>
                        <li>ABS - emits cyanide gas</li>
                        <li>HDPE - melts and catches fire</li>
                        <li>PolyStyrene foam - catches fire</li>
                        <li>Polypropylene foam - catches fire</li>
                        <li>Fiberglass - emits fumes</li>
                      </ul>
                      <p className="mt-1 text-xs text-gray-500">
                        *please do not bring in any unidentified material
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-byu-navy">
                        Common and safe materials
                      </p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        <li>Acrylic</li>
                        <li>Most woods (max thickness for cutting = 1/4")</li>
                        <li>Foamboard</li>
                        <li>Cardboard</li>
                        <li>Paper/Cardstock</li>
                        <li>Leather</li>
                        <li>Magnetic sheet</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-medium text-byu-navy">Metal etching</p>
                      <p className="mt-1">
                        Our laser cutter is not powerful enough to cut or etch
                        metal
                      </p>
                    </div>

                    <div>
                      <p className="font-medium text-byu-navy">
                        Other considerations
                      </p>
                      <p className="mt-1">
                        We will not process jobs that take over 8 hours. You'll
                        need to divide these jobs into shorter jobs.
                      </p>
                    </div>

                    {/* Required checkboxes */}
                    <div className="mt-6 space-y-3">
                      <label className="block text-sm font-semibold text-byu-navy mb-2">
                        Requirements *
                      </label>
                      <label className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={laserForm.confirmedCalendar}
                          onChange={(e) =>
                            setLaserForm((p) => ({
                              ...p,
                              confirmedCalendar: e.target.checked,
                            }))
                          }
                        />
                        <span>
                          I have submitted a time on the scheduling calendar.
                        </span>
                      </label>

                      <label className="flex items-start gap-2 text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={laserForm.confirmedResponsibility}
                          onChange={(e) =>
                            setLaserForm((p) => ({
                              ...p,
                              confirmedResponsibility: e.target.checked,
                            }))
                          }
                        />
                        <span>
                          I understand that I am responsible for watching my
                          laser cut the entire time (unless I want to pay a
                          $20/hour fee)
                        </span>
                      </label>

                      {(!laserForm.confirmedCalendar ||
                        !laserForm.confirmedResponsibility) && (
                        <p className="text-xs text-gray-500">
                          Both acknowledgements must be checked before
                          submitting.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              kind: "custom",
              key: "comments",
              colSpan: 2,
              render: () => (
                <div className="text-left">
                  <label className="block text-sm font-medium text-byu-navy mt-4 mb-1">
                    Additional Comments
                  </label>

                  <p className="mt-0.5 text-xs text-gray-500 mb-2">
                    Use this to note any special settings (cutting speed, power
                    level, # of passes raster infill, etc). Most jobs will work
                    with our default settings.
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
      </div>
    </main>
  );
}
