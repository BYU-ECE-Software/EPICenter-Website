"use client";

import { useState, useEffect } from "react";
import Print3DRequestFormModal from "@/components/forms/Print3DRequestForm";
import type { Print3DFormValues } from "@/components/forms/Print3DRequestForm";
import PcbMillRequestFormModal from "@/components/forms/PCBMillRequestForm";
import type { PcbMillFormValues } from "@/components/forms/PCBMillRequestForm";
import LaserCutRequestFormModal from "@/components/forms/LaserRequestForm";
import type { LaserCutFormValues } from "@/components/forms/LaserRequestForm";
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
  const [printForm, setPrintForm] = useState<Print3DFormValues>({
    requestName: "",
    requestEmail: "",
    file: null as File | null,
    printQuantity: "1",
    filamentColor: "",
    assignedToUserId: "",
    comments: "",
    technicianNotes: "",
  });

  // PCB Mill Modal Form
  const [pcbForm, setPcbForm] = useState<PcbMillFormValues>({
    requestName: "",
    requestEmail: "",
    file: null as File | null,
    pcbSiding: "single",
    boardQuantity: "1",
    silkscreen: "no",
    boardArea: "",
    rubout: "no",
    assignedToUserId: "",
    comments: "",
    technicianNotes: "",
  });

  // Laser Cut Modal Form
  const [laserForm, setLaserForm] = useState<LaserCutFormValues>({
    requestName: "",
    requestEmail: "",
    file: null as File | null,
    confirmedCalendar: false,
    confirmedResponsibility: false,
    assignedToUserId: "",
    comments: "",
    technicianNotes: "",
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
      assignedToUserId: "",
      comments: "",
      technicianNotes: "",
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
      assignedToUserId: "",
      comments: "",
      technicianNotes: "",
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
      assignedToUserId: "",
      comments: "",
      technicianNotes: "",
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
        <Print3DRequestFormModal
          mode="create"
          open={printModalOpen}
          onClose={close3DPrintModal}
          onSubmit={handle3DPrintSubmit}
          saving={saving}
          saveLabel="Submit Request"
          submitDisabled={is3DSubmitDisabled}
          values={printForm}
          setValues={setPrintForm}
          errors={errors}
        />

        {/* PCB Mill Request Modal */}
        <PcbMillRequestFormModal
          mode="create"
          open={pcbModalOpen}
          onClose={closePcbModal}
          onSubmit={handlePcbSubmit}
          saving={saving}
          submitDisabled={isPcbSubmitDisabled}
          values={pcbForm}
          setValues={setPcbForm}
          errors={pcbErrors}
        />

        {/* Laser Cut Request Modal */}
        <LaserCutRequestFormModal
          mode="create"
          open={laserModalOpen}
          onClose={closeLaserModal}
          onSubmit={handleLaserSubmit}
          saving={saving}
          saveLabel="Submit Request"
          submitDisabled={isLaserSubmitDisabled}
          values={laserForm}
          setValues={setLaserForm}
          errors={laserErrors}
        />
      </div>
    </main>
  );
}
